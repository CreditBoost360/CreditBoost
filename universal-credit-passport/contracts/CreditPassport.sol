// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./AccessControl.sol";
import "./InstitutionRegistry.sol";

/**
 * @title CreditPassport
 * @dev Core contract for the Universal Credit Passport system
 * Implements ERC721 standard for passport tokens with extended functionality
 * Enhanced with ReentrancyGuard to prevent reentrancy attacks
 * Includes robust access control and validation mechanisms
 */
contract CreditPassport is ERC721Enumerable, ERC721URIStorage, Pausable, ReentrancyGuard {
    using ECDSA for bytes32;
    using Counters for Counters.Counter;
    using Address for address;
    
    // Counter for passport IDs
    Counters.Counter private _passportIdCounter;
    
    // Security and state variables
    uint256 private constant MAX_INT = 2**256 - 1;
    bool private _emergencyStopped;
    
    // Access control contract
    CreditBoostAccess public accessControl;
    
    // Institution registry contract
    InstitutionRegistry public institutionRegistry;
    
    // Passport data structure
    struct Passport {
        string passportNumber;
        address owner;
        uint256 issuanceDate;
        uint256 expirationDate;
        uint256 creditScore;
        string riskLevel; // "low", "medium", "high", "very_high"
        string ipfsHash;  // IPFS hash of passport document
        string metadataURI; // Additional metadata URI (IPFS)
        bool isActive;
        uint256 version;
        uint256 lastVerifiedAt;
    }
    
    // Verification stamp structure
    struct VerificationStamp {
        address institution;
        string verificationType; // "identity", "credit", "income", etc.
        uint256 verificationDate;
        uint256 expirationDate;
        string ipfsHash; // IPFS hash of verification data
        bytes signature;
        address verifier;
        bool isValid;
    }
    
    // Access grant structure
    struct AccessGrant {
        address grantedTo;
        uint256 grantedAt;
        uint256 expiresAt;
        string accessLevel; // "view", "verify", "full"
        bool isActive;
    }
    
    // Mapping from token ID to Passport
    mapping(uint256 => Passport) public passports;
    
    // Mapping from passport number to token ID
    mapping(string => uint256) public passportNumberToId;
    
    // Mapping from token ID to verification stamps
    mapping(uint256 => mapping(address => mapping(string => VerificationStamp))) public verificationStamps;
    
    // Mapping from token ID to list of institutions that have verified
    mapping(uint256 => address[]) public passportVerifiers;
    
    // Mapping from token ID to list of verification types by institution
    mapping(uint256 => mapping(address => string[])) public verificationTypes;
    
    // Mapping from token ID to list of access grants
    mapping(uint256 => mapping(address => AccessGrant)) public accessGrants;
    
    // Mapping from token ID to list of addresses with access
    mapping(uint256 => address[]) public accessGrantees;
    
    // Events
    event PassportCreated(uint256 indexed tokenId, string passportNumber, address indexed owner, uint256 timestamp);
    event PassportUpdated(uint256 indexed tokenId, string passportNumber, uint256 timestamp, uint256 version);
    event PassportStatusChanged(uint256 indexed tokenId, bool isActive, uint256 timestamp);
    event PassportRevoked(uint256 indexed tokenId, string reason, address indexed revokedBy, uint256 timestamp);
    event PassportExpired(uint256 indexed tokenId, uint256 expirationDate);
    event VerificationStampAdded(uint256 indexed tokenId, address indexed institution, string verificationType, uint256 timestamp, uint256 expirationDate);
    event VerificationStampRemoved(uint256 indexed tokenId, address indexed institution, string verificationType, address indexed removedBy, uint256 timestamp);
    event VerificationStampExpired(uint256 indexed tokenId, address indexed institution, string verificationType, uint256 expirationDate);
    event AccessGranted(uint256 indexed tokenId, address indexed grantedTo, string accessLevel, uint256 expiresAt, address indexed grantedBy);
    event AccessRevoked(uint256 indexed tokenId, address indexed revokedFrom, address indexed revokedBy, uint256 timestamp);
    event DocumentIntegrityVerified(uint256 indexed tokenId, bool verified, string documentHash, address indexed verifier);
    event EmergencyStop(address indexed by, uint256 timestamp);
    event EmergencyRecovery(address indexed by, uint256 timestamp);
    
    // Modifiers
    
    /**
     * @dev Modifier to check if system is not in emergency mode
     */
    modifier notInEmergencyMode() {
        require(!_emergencyStopped, "Contract is in emergency stop mode");
        _;
    }
    
    /**
     * @dev Modifier to check if caller can manage a passport
     * @param tokenId Token ID of the passport
     */
    modifier canManagePassport(uint256 tokenId) {
        require(_exists(tokenId), "Passport does not exist");
        require(
            ownerOf(tokenId) == msg.sender || 
            accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender) ||
            accessControl.hasRole(accessControl.PASSPORT_MANAGER_ROLE(), msg.sender),
            "Not authorized to manage passport"
        );
        _;
    }
    
    /**
     * @dev Modifier to check if caller can stamp a passport
     */
    modifier canStampPassport() {
        require(
            accessControl.hasRole(accessControl.VERIFIER_ROLE(), msg.sender) &&
            institutionRegistry.isActiveAndVerified(msg.sender),
            "Not authorized to stamp passport"
        );
        _;
    }
    
    /**
     * @dev Modifier to check if caller has access to a passport
     * @param tokenId Token ID of the passport
     */
    modifier hasAccess(uint256 tokenId) {
        require(
            ownerOf(tokenId) == msg.sender || 
            accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender) ||
            (accessGrants[tokenId][msg.sender].isActive && accessGrants[tokenId][msg.sender].expiresAt > block.timestamp),
            "No access to passport"
        );
        _;
    }
    
    /**
     * @dev Constructor
     * @param _accessControl Address of the AccessControl contract
     * @param _institutionRegistry Address of the InstitutionRegistry contract
     */
    constructor(
        address _accessControl,
        address _institutionRegistry
    ) 
        ERC721("Universal Credit Passport", "UCP") 
    {
        require(_accessControl != address(0), "Invalid access control address");
        require(_institutionRegistry != address(0), "Invalid institution registry address");
        
        accessControl = CreditBoostAccess(_accessControl);
        institutionRegistry = InstitutionRegistry(_institutionRegistry);
    }
    
    /**
     * @dev Pauses the contract - freezes non-critical operations
     */
    function pause() public {
        require(accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender), "Not an admin");
        _pause();
    }
    
    /**
     * @dev Unpauses the contract
     */
    function unpause() public {
        require(accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender), "Not an admin");
        _unpause();
    }
    
    /**
     * @dev Emergency stop - more severe than pause, blocks all state changes
     */
    function emergencyStop() public {
        require(accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender), "Not an admin");
        _emergencyStopped = true;
        emit EmergencyStop(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Recovers from emergency stop
     */
    function emergencyRecover() public {
        require(accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender), "Not an admin");
        _emergencyStopped = false;
        emit EmergencyRecovery(msg.sender, block.timestamp);
    }
    
    /**
     * @dev Returns the emergency status of the contract
     * @return Whether the contract is in emergency stop mode
     */
    function isEmergencyStopped() public view returns (bool) {
        return _emergencyStopped;
    }
    
    /**
     * @dev Creates a new credit passport
     * @param owner Address of the passport owner
     * @param passportNumber Unique passport number
     * @param ipfsHash IPFS hash of the passport document
     * @param metadataURI URI to additional passport metadata
     * @param creditScore Credit score (300-850)
     * @param riskLevel Risk level (low, medium, high, very_high)
     * @param expirationDays Validity period in days
     * @return tokenId Token ID of the created passport
     */
    /**
     * @dev Creates a new credit passport
     * @param owner Address of the passport owner
     * @param passportNumber Unique passport number
     * @param ipfsHash IPFS hash of the passport document
     * @param metadataURI URI to additional passport metadata
     * @param creditScore Credit score (300-850)
     * @param riskLevel Risk level (low, medium, high, very_high)
     * @param expirationDays Validity period in days
     * @return tokenId Token ID of the created passport
     */
    function createPassport(
        address owner,
        string memory passportNumber,
        string memory ipfsHash,
        string memory metadataURI,
        uint256 creditScore,
        string memory riskLevel,
        uint256 expirationDays
    ) 
        public
        whenNotPaused
        notInEmergencyMode
        nonReentrant
        returns (uint256)
    {
        require(
            accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender) ||
            accessControl.hasRole(accessControl.PASSPORT_MANAGER_ROLE(), msg.sender),
            "Not authorized to create passport"
        );
        require(bytes(passportNumber).length > 0, "Passport number cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(owner != address(0), "Invalid owner address");
        require(!owner.isContract(), "Owner cannot be a contract");
        require(creditScore >= 300 && creditScore <= 850, "Invalid credit score");
        require(expirationDays > 0 && expirationDays <= 3650, "Invalid expiration period"); // Max 10 years
        require(passportNumberToId[passportNumber] == 0, "Passport number already exists");
        
        // Check passport number format - should have a specific format
        require(_validatePassportNumber(passportNumber), "Invalid passport number format");
        
        // Increment passport ID counter
        _passportIdCounter.increment();
        uint256 tokenId = _passportIdCounter.current();
        
        // Create passport
        Passport memory newPassport = Passport({
            passportNumber: passportNumber,
            owner: owner,
            issuanceDate: block.timestamp,
            expirationDate: block.timestamp + (expirationDays * 1 days),
            creditScore: creditScore,
            riskLevel: riskLevel,
            ipfsHash: ipfsHash,
            metadataURI: metadataURI,
            isActive: true,
            version: 1,
            lastVerifiedAt: 0
        });
        
        // Store passport
        passports[tokenId] = newPassport;
        passportNumberToId[passportNumber] = tokenId;
        
        // Mint token
        _safeMint(owner, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        emit PassportCreated(tokenId, passportNumber, owner, block.timestamp);
    }
    
    /**
     * @dev Updates an existing passport
     * @param tokenId Token ID of the passport
     * @param ipfsHash New IPFS hash of the passport document
     * @param metadataURI New URI to additional passport metadata
     * @param creditScore New credit score
     * @param riskLevel New risk level
     */
    function updatePassport(
        uint256 tokenId,
        string memory ipfsHash,
        string memory metadataURI,
        uint256 creditScore,
        string memory riskLevel
    ) 
        public
        whenNotPaused
        canManagePassport(tokenId)
    {
        require(_exists(tokenId), "Passport does not exist");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(creditScore >= 300 && creditScore <= 850, "Invalid credit score");
        require(passports[tokenId].isActive, "Passport is not active");
        require(block.timestamp < passports[tokenId].expirationDate, "Passport has expired");
        
        // Update passport
        passports[tokenId].ipfsHash = ipfsHash;
        passports[tokenId].metadataURI = metadataURI;
        passports[tokenId].creditScore = creditScore;
        passports[tokenId].riskLevel = riskLevel;
        passports[tokenId].version += 1;
        
        // Update token URI
        _setTokenURI(tokenId, metadataURI);
        
        emit PassportUpdated(tokenId, passports[tokenId].passportNumber, block.timestamp, passports[tokenId].version);
    }
    
    /**
     * @dev Extends the expiration date of a passport
     * @param tokenId Token ID of the passport
     * @param additionalDays Additional validity period in days
     */
    function extendExpiration(uint256 tokenId, uint256 additionalDays) 
        public
        whenNotPaused
        canManagePassport(tokenId)
    {
        require(_exists(tokenId), "Passport does not exist");
        require(passports[tokenId].isActive, "Passport is not active");
        
        passports[tokenId].expirationDate += (additionalDays * 1 days);
        
        emit PassportUpdated(tokenId, passports[tokenId].passportNumber, block.timestamp, passports[tokenId].version);
    }
    
    /**
     * @dev Changes the active status of a passport
     * @param tokenId Token ID of the passport
     * @param isActive New active status
     */
    function setPassportStatus(uint256 tokenId, bool isActive) 
        public
        whenNotPaused
        canManagePassport(tokenId)
    {
        require(_exists(tokenId), "Passport does not exist");
        
        passports[tokenId].isActive = isActive;
        
        emit PassportStatusChanged(tokenId, isActive, block.timestamp);
    }
    
    /**
     * @dev Revokes a passport
     * @param tokenId Token ID of the passport
     * @param reason Reason for revocation
     */
    function revokePassport(uint256 tokenId, string memory reason) 
        public
        whenNotPaused
    {
        require(
            accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender),
            "Only admin can revoke passport"
        );
        require(_exists(tokenId), "Passport does not exist");
        
        passports[tokenId].isActive = false;
        
        emit PassportRevoked(tokenId, reason, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Adds a verification stamp to a passport
     * @param tokenId Token ID of the passport
     * @param verificationType Type of verification (identity, credit, etc.)
     * @param ipfsHash IPFS hash of verification data
     * @param signature Digital signature of the verification
     * @param expirationDays Validity period of the verification in days
     */
    function addVerificationStamp(
        uint256 tokenId,
        string memory verificationType,
        string memory ipfsHash,
        bytes memory signature,
        uint256 expirationDays
    ) 
        public
        whenNotPaused
        canStampPassport
    {
        require(_exists(tokenId), "Passport does not exist");
        require(passports[tokenId].isActive, "Passport is not active");
        require(block.timestamp < passports[tokenId].expirationDate, "Passport has expired");
        require(bytes(verificationType).length > 0, "Verification type cannot be empty");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        
        address institution = msg.sender;
        
        // Create verification stamp
        VerificationStamp memory stamp = VerificationStamp({
            institution: institution,
            verificationType: verificationType,
            verificationDate: block.timestamp,
            expirationDate: block.timestamp + (expirationDays * 1 days),
            ipfsHash: ipfsHash,
            signature: signature,
            verifier: msg.sender,
            isValid: true
        });
        
        // Check if this is the first verification from this institution
        bool isNewVerifier = true;
        for (uint i = 0; i < passportVerifiers[tokenId].length; i++) {
            if (passportVerifiers[tokenId][i] == institution) {
                isNewVerifier = false;
                break;
            }
        }
        
        // Add to verifiers list if new
        if (isNewVerifier) {
            passportVerifiers[tokenId].push(institution);
        }
        
        // Check if this is a new verification type for this institution
        bool isNewType = true;
        for (uint i = 0; i < verificationTypes[tokenId][institution].length; i++) {
            if (keccak256(bytes(verificationTypes[tokenId][institution][i])) == keccak256(bytes(verificationType))) {
                isNewType = false;
                break;
            }
        }
        
        // Add verification type if new
        if (isNewType) {
            verificationTypes[tokenId][institution].push(verificationType);
        }
        
        // Store verification stamp
        verificationStamps[tokenId][institution][verificationType] = stamp;
        
        // Update last verified timestamp
        passports[tokenId].lastVerifiedAt = block.timestamp;
        
        emit VerificationStampAdded(tokenId, institution, verificationType, block.timestamp, stamp.expirationDate);
    }
    
    /**
     * @dev Removes a verification stamp from a passport
     * @param tokenId Token ID of the passport
     * @param institution Address of the institution
     * @param verificationType Type of verification
     */
    function removeVerificationStamp(
        uint256 tokenId,
        address institution,
        string memory verificationType
    ) 
        public
        whenNotPaused
    {
        require(_exists(tokenId), "Passport does not exist");
        require(
            msg.sender == institution ||
            accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender),
            "Not authorized to remove stamp"
        );
        require(verificationStamps[tokenId][institution][verificationType].institution == institution, "Stamp does not exist");
        
        // Invalidate stamp
        verificationStamps[tokenId][institution][verificationType].isValid = false;
        
        emit VerificationStampRemoved(tokenId, institution, verificationType, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Verifies a document against its IPFS hash
     * @param tokenId Token ID of the passport
     * @param documentHash Hash of the document to verify
     * @return Boolean indicating if document is valid
     */
    function verifyDocumentIntegrity(uint256 tokenId, string memory documentHash) 
        public
        view
        returns (bool)
    {
        require(_exists(tokenId), "Passport does not exist");
        
        // Check if the provided hash matches the stored IPFS hash
        return keccak256(bytes(passports[tokenId].ipfsHash)) == keccak256(bytes(documentHash));
    }
    
    /**
     * @dev Verifies a signature for a verification stamp
     * @param tokenId Token ID of the passport
     * @param institution Address of the institution
     * @param verificationType Type of verification
     * @param message Message that was signed
     * @return Boolean indicating if signature is valid
     */
    function verifySignature(
        uint256 tokenId,
        address institution,
        string memory verificationType,
        bytes32 message
    ) 
        public
        view
        returns (bool)
    {
        VerificationStamp memory stamp = verificationStamps[tokenId][institution][verificationType];
        
        // Get institution's public key hash from registry
        (,,,,,bytes32 publicKeyHash,,,,) = institutionRegistry.getInstitution(institution);
        
        // Recover signer from signature
        bytes32 signedHash = keccak256(
            abi.encodePacked(
                "\x19Ethereum Signed Message:\n32",
                message
            )
        );
        
        address signer = signedHash.recover(stamp.signature);
        
        // Verify that the signer matches the expected verifier
        return signer == stamp.verifier;
    }
    
    /**
     * @dev Grants access to a passport to another address
     * @param tokenId Token ID of the passport
     * @param grantee Address to grant access to
     * @param accessLevel Level of access (view, verify, full)
     * @param durationDays Duration of access in days
     */
    function grantAccess(
        uint256 tokenId,
        address grantee,
        string memory accessLevel,
        uint256 durationDays
    ) 
        public
        whenNotPaused
        canManagePassport(tokenId)
    {
        require(_exists(tokenId), "Passport does not exist");
        require(grantee != address(0), "Invalid grantee address");
        require(
            keccak256(bytes(accessLevel)) == keccak256(bytes("view")) ||
            keccak256(bytes(accessLevel)) == keccak256(bytes("verify")) ||
            keccak256(bytes(accessLevel)) == keccak256(bytes("full")),
            "Invalid access level"
        );
        
        // Create access grant
        AccessGrant memory grant = AccessGrant({
            grantedTo: grantee,
            grantedAt: block.timestamp,
            expiresAt: block.timestamp + (durationDays * 1 days),
            accessLevel: accessLevel,
            isActive: true
        });
        
        // Check if grantee already has access
        bool isNewGrantee = true;
        for (uint i = 0; i < accessGrantees[tokenId].length; i++) {
            if (accessGrantees[tokenId][i] == grantee) {
                isNewGrantee = false;
                break;
            }
        }
        
        // Add to grantees list if new
        if (isNewGrantee) {
            accessGrantees[tokenId].push(grantee);
        }
        
        // Store access grant
        accessGrants[tokenId][grantee] = grant;
        
        emit AccessGranted(tokenId, grantee, accessLevel, grant.expiresAt, msg.sender);
    }
    
    /**
     * @dev Revokes access to a passport from an address
     * @param tokenId Token ID of the passport
     * @param grantee Address to revoke access from
     */
    function revokeAccess(uint256 tokenId, address grantee) 
        public
        whenNotPaused
        canManagePassport(tokenId)
    {
        require(_exists(tokenId), "Passport does not exist");
        require(accessGrants[tokenId][grantee].isActive, "No active access grant");
        
        // Deactivate grant
        accessGrants[tokenId][grantee].isActive = false;
        
        emit AccessRevoked(tokenId, grantee, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Gets all verifiers for a passport
     * @param tokenId Token ID of the passport
     * @return Array of verifier addresses
     */
    function getPassportVerifiers(uint256 tokenId) 
        public
        view
        hasAccess(tokenId)
        returns (address[] memory)
    {
        return passportVerifiers[tokenId];
    }
    
    /**
     * @dev Gets all verification types for an institution on a passport
     * @param tokenId Token ID of the passport
     * @param institution Address of the institution
     * @return Array of verification types
     */
    function getVerificationTypes(uint256 tokenId, address institution) 
        public
        view
        hasAccess(tokenId)
        returns (string[] memory)
    {
        return verificationTypes[tokenId][institution];
    }
    
    /**
     * @dev Gets all addresses with access to a passport
     * @param tokenId Token ID of the passport
     * @return Array of grantee addresses
     */
    function getAccessGrantees(uint256 tokenId) 
        public
        view
        canManagePassport(tokenId)
        returns (address[] memory)
    {
        return accessGrantees[tokenId];
    }
    
    /**
     * @dev Gets a verification stamp
     * @param tokenId Token ID of the passport
     * @param institution Address of the institution
     * @param verificationType Type of verification
     * @return Verification stamp details
     */
    function getVerificationStamp(
        uint256 tokenId,
        address institution,
        string memory verificationType
    ) 
        public
        view
        hasAccess(tokenId)
        returns (
            address _institution,
            string memory _verificationType,
            uint256 _verificationDate,
            uint256 _expirationDate,
            string memory _ipfsHash,
            address _verifier,
            bool _isValid
        )
    {
        VerificationStamp memory stamp = verificationStamps[tokenId][institution][verificationType];
        
        return (
            stamp.institution,
            stamp.verificationType,
            stamp.verificationDate,
            stamp.expirationDate,
            stamp.ipfsHash,
            stamp.verifier,
            stamp.isValid
        );
    }
    
    /**
     * @dev Creates an IPFS content hash link
     * @param hash IPFS content hash
     * @return Full IPFS URL
     */
    function getIPFSLink(string memory hash) public pure returns (string memory) {
        return string(abi.encodePacked("ipfs://", hash));
    }
    
    /**
     * @dev Checks if a verification stamp is valid and not expired
     * @param tokenId Token ID of the passport
     * @param institution Address of the institution
     * @param verificationType Type of verification
     * @return Boolean indicating if stamp is valid
     */
    function isStampValid(
        uint256 tokenId,
        address institution,
        string memory verificationType
    ) 
        public
        view
        returns (bool)
    {
        VerificationStamp memory stamp = verificationStamps[tokenId][institution][verificationType];
        
        return (
            stamp.isValid &&
            block.timestamp <= stamp.expirationDate &&
            institutionRegistry.isActiveAndVerified(institution)
        );
    }
    
    /**
     * @dev Gets full passport data
     * @param tokenId Token ID of the passport
     * @return All passport data
     */
    function getPassport(uint256 tokenId) 
        public
        view
        hasAccess(tokenId)
        returns (
            string memory passportNumber,
            address owner,
            uint256 issuanceDate,
            uint256 expirationDate,
            uint256 creditScore,
            string memory riskLevel,
            string memory ipfsHash,
            string memory metadataURI,
            bool isActive,
            uint256 version,
            uint256 lastVerifiedAt
        )
    {
        Passport memory passport = passports[tokenId];
        
        return (
            passport.passportNumber,
            passport.owner,
            passport.issuanceDate,
            passport.expirationDate,
            passport.creditScore,
            passport.riskLevel,
            passport.ipfsHash,
            passport.metadataURI,
            passport.isActive,
            passport.version,
            passport.lastVerifiedAt
        );
    }
    
    /**
     * @dev Checks if a passport exists by passport number
     * @param passportNumber Passport number to check
     * @return Boolean indicating if passport exists
     */
    function passportExists(string memory passportNumber) public view returns (bool) {
        return passportNumberToId[passportNumber] != 0;
    }
    
    /**
     * @dev Checks if a passport is expired
     * @param tokenId Token ID of the passport
     * @return Boolean indicating if passport is expired
     */
    function isPassportExpired(uint256 tokenId) public view returns (bool) {
        require(_exists(tokenId), "Passport does not exist");
        return block.timestamp > passports[tokenId].expirationDate;
    }
    
    /**
     * @dev Generate a document hash for verification
     * @param content Content of the document
     * @return Hash of the document
     */
    function generateDocumentHash(string memory content) public pure returns (bytes32) {
        return keccak256(bytes(content));
    }
    
    /**
     * @dev Required override for conflicts in inherited contracts
     */
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    /**
     * @dev Required override for conflicts in inherited contracts
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    /**
     * @dev Required override for conflicts in inherited contracts
     */
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Required override for conflicts in inherited contracts
     */
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
