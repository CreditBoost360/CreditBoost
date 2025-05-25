// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./AccessControl.sol";

/**
 * @title InstitutionRegistry
 * @dev Manages the registry of verified institutions that can issue stamps
 */
contract InstitutionRegistry is Pausable {
    using ECDSA for bytes32;
    
    CreditBoostAccess public accessControl;
    
    // Institution struct
    struct Institution {
        string name;
        string institutionType; // "bank", "government", "credit_bureau", etc.
        string countryCode;
        address walletAddress;
        string metadataURI; // URI to additional institution metadata (IPFS)
        bytes32 publicKeyHash;
        uint256 verificationLevel; // 0=none, 1=basic, 2=verified, 3=premium
        bool active;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    // Mapping from institution address to Institution struct
    mapping(address => Institution) public institutions;
    
    // Mapping of institution name to address to check for duplicates
    mapping(string => address) public institutionNameToAddress;
    
    // Array of all institution addresses for enumeration
    address[] public institutionAddresses;
    
    // Events
    event InstitutionRegistered(address indexed institutionAddress, string name, string institutionType, string countryCode);
    event InstitutionUpdated(address indexed institutionAddress, string name, string institutionType, string countryCode);
    event InstitutionStatusChanged(address indexed institutionAddress, bool active);
    event InstitutionVerificationLevelChanged(address indexed institutionAddress, uint256 level);
    event PublicKeyUpdated(address indexed institutionAddress, bytes32 publicKeyHash);
    
    /**
     * @dev Modifier to check if caller is an admin
     */
    modifier onlyAdmin() {
        require(accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender), "Caller is not an admin");
        _;
    }
    
    /**
     * @dev Constructor that sets the access control contract
     * @param _accessControl Address of the AccessControl contract
     */
    constructor(address _accessControl) {
        require(_accessControl != address(0), "Invalid access control address");
        accessControl = CreditBoostAccess(_accessControl);
    }
    
    /**
     * @dev Pauses the contract
     */
    function pause() public onlyAdmin {
        _pause();
    }
    
    /**
     * @dev Unpauses the contract
     */
    function unpause() public onlyAdmin {
        _unpause();
    }
    
    /**
     * @dev Registers a new institution
     * @param institutionAddress Address of the institution's wallet
     * @param name Name of the institution
     * @param institutionType Type of institution (bank, government, etc.)
     * @param countryCode ISO country code
     * @param metadataURI URI to additional institution metadata
     * @param publicKeyHash Hash of institution's public key for verification signatures
     */
    function registerInstitution(
        address institutionAddress,
        string memory name,
        string memory institutionType,
        string memory countryCode,
        string memory metadataURI,
        bytes32 publicKeyHash
    ) 
        public 
        onlyAdmin
        whenNotPaused 
    {
        require(institutionAddress != address(0), "Invalid institution address");
        require(bytes(name).length > 0, "Name cannot be empty");
        require(bytes(institutionType).length > 0, "Type cannot be empty");
        require(bytes(countryCode).length > 0, "Country code cannot be empty");
        require(institutions[institutionAddress].createdAt == 0, "Institution already registered");
        require(institutionNameToAddress[name] == address(0), "Institution name already in use");
        
        // Create new institution
        Institution memory newInstitution = Institution({
            name: name,
            institutionType: institutionType,
            countryCode: countryCode,
            walletAddress: institutionAddress,
            metadataURI: metadataURI,
            publicKeyHash: publicKeyHash,
            verificationLevel: 1, // Basic verification by default
            active: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        // Store institution
        institutions[institutionAddress] = newInstitution;
        institutionNameToAddress[name] = institutionAddress;
        institutionAddresses.push(institutionAddress);
        
        // Grant institution role
        accessControl.grantInstitutionAdmin(institutionAddress);
        
        emit InstitutionRegistered(institutionAddress, name, institutionType, countryCode);
    }
    
    /**
     * @dev Updates an existing institution
     * @param institutionAddress Address of the institution to update
     * @param name Name of the institution
     * @param institutionType Type of institution (bank, government, etc.)
     * @param countryCode ISO country code
     * @param metadataURI URI to additional institution metadata
     */
    function updateInstitution(
        address institutionAddress,
        string memory name,
        string memory institutionType,
        string memory countryCode,
        string memory metadataURI
    ) 
        public 
        onlyAdmin
        whenNotPaused 
    {
        require(institutions[institutionAddress].createdAt > 0, "Institution not registered");
        
        Institution storage institution = institutions[institutionAddress];
        
        // If name is changing, update the name mapping
        if (keccak256(bytes(institution.name)) != keccak256(bytes(name))) {
            delete institutionNameToAddress[institution.name];
            institutionNameToAddress[name] = institutionAddress;
        }
        
        // Update institution
        institution.name = name;
        institution.institutionType = institutionType;
        institution.countryCode = countryCode;
        institution.metadataURI = metadataURI;
        institution.updatedAt = block.timestamp;
        
        emit InstitutionUpdated(institutionAddress, name, institutionType, countryCode);
    }
    
    /**
     * @dev Changes an institution's active status
     * @param institutionAddress Address of the institution
     * @param active New active status
     */
    function setInstitutionStatus(address institutionAddress, bool active) 
        public 
        onlyAdmin
        whenNotPaused 
    {
        require(institutions[institutionAddress].createdAt > 0, "Institution not registered");
        
        institutions[institutionAddress].active = active;
        institutions[institutionAddress].updatedAt = block.timestamp;
        
        emit InstitutionStatusChanged(institutionAddress, active);
    }
    
    /**
     * @dev Changes an institution's verification level
     * @param institutionAddress Address of the institution
     * @param level New verification level
     */
    function setVerificationLevel(address institutionAddress, uint256 level) 
        public 
        onlyAdmin
        whenNotPaused 
    {
        require(institutions[institutionAddress].createdAt > 0, "Institution not registered");
        require(level <= 3, "Invalid verification level");
        
        institutions[institutionAddress].verificationLevel = level;
        institutions[institutionAddress].updatedAt = block.timestamp;
        
        emit InstitutionVerificationLevelChanged(institutionAddress, level);
    }
    
    /**
     * @dev Updates an institution's public key
     * @param institutionAddress Address of the institution
     * @param publicKeyHash Hash of institution's public key
     */
    function updatePublicKey(address institutionAddress, bytes32 publicKeyHash) 
        public 
        whenNotPaused 
    {
        require(institutions[institutionAddress].createdAt > 0, "Institution not registered");
        require(msg.sender == institutionAddress || accessControl.hasRole(accessControl.ADMIN_ROLE(), msg.sender), 
            "Only institution or admin can update public key");
        
        institutions[institutionAddress].publicKeyHash = publicKeyHash;
        institutions[institutionAddress].updatedAt = block.timestamp;
        
        emit PublicKeyUpdated(institutionAddress, publicKeyHash);
    }
    
    /**
     * @dev Gets all institution addresses
     * @return Array of all institution addresses
     */
    function getAllInstitutions() public view returns (address[] memory) {
        return institutionAddresses;
    }
    
    /**
     * @dev Gets the number of registered institutions
     * @return Number of registered institutions
     */
    function getInstitutionCount() public view returns (uint256) {
        return institutionAddresses.length;
    }
    
    /**
     * @dev Checks if an institution is active and verified
     * @param institutionAddress Address of the institution
     * @return Boolean indicating if the institution is active and verified
     */
    function isActiveAndVerified(address institutionAddress) public view returns (bool) {
        Institution memory institution = institutions[institutionAddress];
        return institution.active && institution.verificationLevel > 0;
    }
    
    /**
     * @dev Gets an institution's details
     * @param institutionAddress Address of the institution
     * @return All the institution's details
     */
    function getInstitution(address institutionAddress) 
        public 
        view 
        returns (
            string memory name,
            string memory institutionType,
            string memory countryCode,
            address walletAddress,
            string memory metadataURI,
            bytes32 publicKeyHash,
            uint256 verificationLevel,
            bool active,
            uint256 createdAt,
            uint256 updatedAt
        ) 
    {
        Institution memory institution = institutions[institutionAddress];
        return (
            institution.name,
            institution.institutionType,
            institution.countryCode,
            institution.walletAddress,
            institution.metadataURI,
            institution.publicKeyHash,
            institution.verificationLevel,
            institution.active,
            institution.createdAt,
            institution.updatedAt
        );
    }
}

