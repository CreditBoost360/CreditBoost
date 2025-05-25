// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Import OpenZeppelin contracts for access control
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// Import Chainlink CCIP interfaces
import "@chainlink/contracts/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts/src/v0.8/ccip/libraries/Client.sol";

contract CreditPassport is AccessControl, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Define roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant FINANCIAL_INSTITUTION_ROLE = keccak256("FINANCIAL_INSTITUTION_ROLE");
    bytes32 public constant CREDIT_BUREAU_ROLE = keccak256("CREDIT_BUREAU_ROLE");
    
    // Chainlink CCIP Router for cross-chain functionality
    IRouterClient private immutable router;
    struct CreditData {
        uint256 creditScore;
        string[] transactionHistory;
        address owner;
        string kycIpfsHash;           // IPFS hash of KYC documents
        bool kycVerified;             // Whether KYC is verified
        uint256 lastUpdateTimestamp;  // Timestamp of last update
    }
    
    struct AccessGrant {
        address institution;          // Financial institution granted access
        uint256 expiryTimestamp;      // When access expires
        bool canWrite;                // Whether institution can write data
    }
    
    // Counter for generating unique access tokens
    Counters.Counter private accessTokenIdCounter;
    
    // Main credit record storage
    mapping(address => CreditData) private creditRecords;
    
    // Access control mappings
    mapping(address => mapping(address => AccessGrant)) private accessGrants; // user => institution => grant
    mapping(uint256 => address) private accessTokenToUser; // token ID => user address
    mapping(bytes32 => bool) private validAccessTokens; // hash of (token, institution, timestamp) => valid
    
    // Cross-chain message mapping
    mapping(bytes32 => bool) private processedMessages;

    event CreditDataUpdated(address indexed user, uint256 creditScore, string[] transactionHistory);
    event KYCUpdated(address indexed user, string ipfsHash, bool verified);
    event AccessGranted(address indexed user, address indexed institution, uint256 expiryTimestamp);
    event AccessRevoked(address indexed user, address indexed institution);
    event CrossChainDataReceived(bytes32 indexed messageId, address indexed user);
    event CrossChainDataSent(bytes32 indexed messageId, uint64 destinationChainSelector, address receiver);

    /**
     * @dev Contract constructor
     * @param _router The address of the Chainlink CCIP Router
     */
    constructor(address _router) {
        router = IRouterClient(_router);
        
        // Set up admin role for contract deployer
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Validates if a passport number follows the required format
     * @param passportNumber The passport number to validate
     * @return bool Returns true if the passport number is valid, false otherwise
     */
    function _validatePassportNumber(string memory passportNumber) private pure returns (bool) {
        bytes memory passportBytes = bytes(passportNumber);
        
        // Check if length is correct (UCP- + 12 characters = 16 total)
        if (passportBytes.length != 16) {
            return false;
        }
        
        // Check prefix "UCP-"
        if (passportBytes[0] != "U" || 
            passportBytes[1] != "C" || 
            passportBytes[2] != "P" || 
            passportBytes[3] != "-") {
            return false;
        }
        
        // Validate the 12 alphanumeric characters
        for (uint i = 4; i < passportBytes.length; i++) {
            bytes1 char = passportBytes[i];
            
            // Check if character is alphanumeric (0-9, A-Z, a-z)
            bool isAlphanumeric = (
                (char >= "0" && char <= "9") ||
                (char >= "A" && char <= "Z") ||
                (char >= "a" && char <= "z")
            );
            
            if (!isAlphanumeric) {
                return false;
            }
        }
        
        return true;
    }

    function createCreditPassport(uint256 _creditScore, string[] memory _transactionHistory) public {
        require(creditRecords[msg.sender].owner == address(0), "Credit Passport already exists for this user.");
        
        creditRecords[msg.sender] = CreditData({
            creditScore: _creditScore,
            transactionHistory: _transactionHistory,
            owner: msg.sender,
            kycIpfsHash: "",
            kycVerified: false,
            lastUpdateTimestamp: block.timestamp
        });

        emit CreditDataUpdated(msg.sender, _creditScore, _transactionHistory);
    }

    function updateCreditScore(uint256 _newCreditScore) public {
        require(creditRecords[msg.sender].owner != address(0), "Credit Passport does not exist for this user.");
        
        creditRecords[msg.sender].creditScore = _newCreditScore;
        creditRecords[msg.sender].lastUpdateTimestamp = block.timestamp;

        emit CreditDataUpdated(msg.sender, _newCreditScore, creditRecords[msg.sender].transactionHistory);
    }
    
    /**
     * @dev Update credit score for a user (only authorized institutions can call)
     * @param _user The address of the user
     * @param _newCreditScore The new credit score
     */
    function updateCreditScoreByInstitution(address _user, uint256 _newCreditScore) public {
        require(hasRole(FINANCIAL_INSTITUTION_ROLE, msg.sender) || hasRole(CREDIT_BUREAU_ROLE, msg.sender), 
                "Caller is not an authorized institution");
        require(creditRecords[_user].owner != address(0), "Credit Passport does not exist for this user");
        
        // Check if institution has valid access
        AccessGrant memory grant = accessGrants[_user][msg.sender];
        require(grant.institution == msg.sender, "Institution does not have access");
        require(grant.expiryTimestamp > block.timestamp, "Access has expired");
        require(grant.canWrite, "Institution does not have write access");
        
        creditRecords[_user].creditScore = _newCreditScore;
        creditRecords[_user].lastUpdateTimestamp = block.timestamp;

        emit CreditDataUpdated(_user, _newCreditScore, creditRecords[_user].transactionHistory);
    }

    function addTransaction(string memory _transaction) public {
        require(creditRecords[msg.sender].owner != address(0), "Credit Passport does not exist for this user.");
        
        creditRecords[msg.sender].transactionHistory.push(_transaction);

        emit CreditDataUpdated(msg.sender, creditRecords[msg.sender].creditScore, creditRecords[msg.sender].transactionHistory);
    }

    function getCreditData(address _user) public view returns (uint256, string[] memory) {
        require(creditRecords[_user].owner != address(0), "Credit Passport does not exist for this user.");
        
        // If caller is the owner, return data immediately
        if (msg.sender == _user) {
            CreditData memory data = creditRecords[_user];
            return (data.creditScore, data.transactionHistory);
        }
        
        // If caller is an institution, check access
        AccessGrant memory grant = accessGrants[_user][msg.sender];
        require(grant.institution == msg.sender, "Institution does not have access");
        require(grant.expiryTimestamp > block.timestamp, "Access has expired");
        
        CreditData memory data = creditRecords[_user];
        return (data.creditScore, data.transactionHistory);
    }
    
    /**
     * @dev Get comprehensive credit data including KYC info
     * @param _user The address of the user
     * @return creditScore, transactionHistory, kycIpfsHash, kycVerified, lastUpdateTimestamp
     */
    function getFullCreditData(address _user) public view returns (
        uint256, 
        string[] memory, 
        string memory, 
        bool, 
        uint256
    ) {
        require(creditRecords[_user].owner != address(0), "Credit Passport does not exist for this user.");
        
        // Only owner, authorized institutions, or admins can access full data
        bool isAuthorized = (_user == msg.sender) || 
                           hasRole(ADMIN_ROLE, msg.sender) || 
                           (accessGrants[_user][msg.sender].institution == msg.sender && 
                            accessGrants[_user][msg.sender].expiryTimestamp > block.timestamp);
                            
        require(isAuthorized, "Not authorized to access full credit data");
        
        CreditData memory data = creditRecords[_user];
        return (
            data.creditScore, 
            data.transactionHistory, 
            data.kycIpfsHash, 
            data.kycVerified, 
            data.lastUpdateTimestamp
        );
    }
    
    /**
     * @dev Update KYC documents by uploading IPFS hash
     * @param _ipfsHash The IPFS hash where KYC documents are stored
     */
    function updateKYCDocuments(string memory _ipfsHash) public {
        require(creditRecords[msg.sender].owner != address(0), "Credit Passport does not exist for this user");
        
        creditRecords[msg.sender].kycIpfsHash = _ipfsHash;
        // KYC needs to be verified by an authorized entity
        creditRecords[msg.sender].kycVerified = false;
        creditRecords[msg.sender].lastUpdateTimestamp = block.timestamp;
        
        emit KYCUpdated(msg.sender, _ipfsHash, false);
    }
    
    /**
     * @dev Verify KYC documents (only callable by credit bureaus)
     * @param _user The address of the user
     * @param _verified Whether the KYC is verified
     */
    function verifyKYC(address _user, bool _verified) public {
        require(hasRole(CREDIT_BUREAU_ROLE, msg.sender), "Caller is not an authorized credit bureau");
        require(creditRecords[_user].owner != address(0), "Credit Passport does not exist for this user");
        require(bytes(creditRecords[_user].kycIpfsHash).length > 0, "No KYC documents uploaded");
        
        creditRecords[_user].kycVerified = _verified;
        creditRecords[_user].lastUpdateTimestamp = block.timestamp;
        
        emit KYCUpdated(_user, creditRecords[_user].kycIpfsHash, _verified);
    }
    
    /**
     * @dev Grant temporary access to a financial institution
     * @param _institution The address of the financial institution
     * @param _durationInDays Access duration in days
     * @param _canWrite Whether the institution can update credit data
     * @return accessToken A unique token for this access grant
     */
    function grantInstitutionAccess(
        address _institution, 
        uint256 _durationInDays, 
        bool _canWrite
    ) public returns (uint256) {
        require(creditRecords[msg.sender].owner != address(0), "Credit Passport does not exist for this user");
        require(_institution != address(0), "Invalid institution address");
        require(_durationInDays > 0 && _durationInDays <= 365, "Duration must be between 1 and 365 days");
        
        // Maximum access period is 365 days
        uint256 expiryTimestamp = block.timestamp + (_durationInDays * 1 days);
        
        // Create access grant
        accessGrants[msg.sender][_institution] = AccessGrant({
            institution: _institution,
            expiryTimestamp: expiryTimestamp,
            canWrite: _canWrite
        });
        
        // Generate access token
        accessTokenIdCounter.increment();
        uint256 accessToken = accessTokenIdCounter.current();
        accessTokenToUser[accessToken] = msg.sender;
        
        // Create hash for verification
        bytes32 accessHash = keccak256(abi.encodePacked(accessToken, _institution, expiryTimestamp));
        validAccessTokens[accessHash] = true;
        
        emit AccessGranted(msg.sender, _institution, expiryTimestamp);
        return accessToken;
    }
    
    /**
     * @dev Revoke access from a financial institution
     * @param _institution The address of the financial institution
     */
    function revokeInstitutionAccess(address _institution) public {
        require(creditRecords[msg.sender].owner != address(0), "Credit Passport does not exist for this user");
        require(accessGrants[msg.sender][_institution].institution == _institution, "Institution does not have access");
        
        // Invalidate existing access
        delete accessGrants[msg.sender][_institution];
        
        emit AccessRevoked(msg
}