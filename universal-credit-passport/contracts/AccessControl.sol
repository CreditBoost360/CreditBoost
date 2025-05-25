// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title CreditBoostAccess
 * @dev Manages role-based access control for the Universal Credit Passport system
 */
contract CreditBoostAccess is AccessControl, Pausable {
    // Role definitions
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant INSTITUTION_ROLE = keccak256("INSTITUTION_ROLE");
    bytes32 public constant PASSPORT_MANAGER_ROLE = keccak256("PASSPORT_MANAGER_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    bytes32 public constant INSTITUTION_ADMIN_ROLE = keccak256("INSTITUTION_ADMIN_ROLE");
    
    // Events
    event RoleGranted(bytes32 indexed role, address indexed account, address indexed sender);
    event RoleRevoked(bytes32 indexed role, address indexed account, address indexed sender);
    event ContractPaused(address indexed pauser);
    event ContractUnpaused(address indexed unpauser);

    /**
     * @dev Constructor that gives the deployer the admin role
     */
    constructor() {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(ADMIN_ROLE, msg.sender);
        
        // Admin role can grant and revoke all roles
        _setRoleAdmin(INSTITUTION_ROLE, ADMIN_ROLE);
        _setRoleAdmin(PASSPORT_MANAGER_ROLE, ADMIN_ROLE);
        _setRoleAdmin(VERIFIER_ROLE, ADMIN_ROLE);
        
        // Institution admins can manage verifiers within their institution
        _setRoleAdmin(VERIFIER_ROLE, INSTITUTION_ADMIN_ROLE);
    }
    
    /**
     * @dev Pauses the contract
     */
    function pause() public onlyRole(ADMIN_ROLE) {
        _pause();
        emit ContractPaused(msg.sender);
    }
    
    /**
     * @dev Unpauses the contract
     */
    function unpause() public onlyRole(ADMIN_ROLE) {
        _unpause();
        emit ContractUnpaused(msg.sender);
    }
    
    /**
     * @dev Grants an institution admin role
     * @param institution Address of the institution
     */
    function grantInstitutionAdmin(address institution) public onlyRole(ADMIN_ROLE) {
        grantRole(INSTITUTION_ADMIN_ROLE, institution);
        grantRole(INSTITUTION_ROLE, institution);
    }
    
    /**
     * @dev Grants a verifier role to an address
     * @param verifier Address of the verifier
     */
    function grantVerifier(address verifier) public onlyRole(INSTITUTION_ADMIN_ROLE) {
        grantRole(VERIFIER_ROLE, verifier);
    }
    
    /**
     * @dev Revokes a verifier role from an address
     * @param verifier Address of the verifier
     */
    function revokeVerifier(address verifier) public onlyRole(INSTITUTION_ADMIN_ROLE) {
        revokeRole(VERIFIER_ROLE, verifier);
    }
    
    /**
     * @dev Checks if an address has the institution role
     * @param institution Address to check
     * @return Boolean indicating if the address has the institution role
     */
    function isInstitution(address institution) public view returns (bool) {
        return hasRole(INSTITUTION_ROLE, institution);
    }
    
    /**
     * @dev Checks if an address has the verifier role
     * @param verifier Address to check
     * @return Boolean indicating if the address has the verifier role
     */
    function isVerifier(address verifier) public view returns (bool) {
        return hasRole(VERIFIER_ROLE, verifier);
    }
    
    /**
     * @dev Checks if an address has the passport manager role
     * @param manager Address to check
     * @return Boolean indicating if the address has the passport manager role
     */
    function isPassportManager(address manager) public view returns (bool) {
        return hasRole(PASSPORT_MANAGER_ROLE, manager);
    }
}

