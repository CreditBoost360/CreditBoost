package com.creditboost.security.model;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Entity representing an administrator in the system.
 * Level 6 administrators have the highest security clearance.
 */
@Entity
@Table(name = "admins")
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String email;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "access_level", nullable = false)
    private int accessLevel;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "two_factor_enabled", nullable = false)
    private boolean twoFactorEnabled = true;

    @Column(name = "two_factor_secret")
    private String twoFactorSecret;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "last_ip")
    private String lastIp;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "deactivated_at")
    private LocalDateTime deactivatedAt;

    @Column(name = "deactivated_by")
    private String deactivatedBy;

    @Column(name = "deactivation_reason")
    private String deactivationReason;

    @ElementCollection
    @CollectionTable(name = "admin_approved_ips", joinColumns = @JoinColumn(name = "admin_id"))
    @Column(name = "ip_address")
    private Set<String> approvedIpAddresses = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "admin_biometric_templates", joinColumns = @JoinColumn(name = "admin_id"))
    private Set<BiometricTemplate> biometricTemplates = new HashSet<>();

    @ElementCollection
    @CollectionTable(name = "admin_trusted_devices", joinColumns = @JoinColumn(name = "admin_id"))
    private Set<TrustedDevice> trustedDevices = new HashSet<>();

    @Column(name = "failed_login_attempts")
    private int failedLoginAttempts = 0;

    @Column(name = "account_locked_until")
    private LocalDateTime accountLockedUntil;

    @Column(name = "security_key")
    private String securityKey;

    @Column(name = "security_key_expiry")
    private LocalDateTime securityKeyExpiry;

    @Column(name = "emergency_access_until")
    private LocalDateTime emergencyAccessUntil;

    @Column(name = "emergency_access_reason")
    private String emergencyAccessReason;

    // Getters and setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public int getAccessLevel() {
        return accessLevel;
    }

    public void setAccessLevel(int accessLevel) {
        this.accessLevel = accessLevel;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isTwoFactorEnabled() {
        return twoFactorEnabled;
    }

    public void setTwoFactorEnabled(boolean twoFactorEnabled) {
        this.twoFactorEnabled = twoFactorEnabled;
    }

    public String getTwoFactorSecret() {
        return twoFactorSecret;
    }

    public void setTwoFactorSecret(String twoFactorSecret) {
        this.twoFactorSecret = twoFactorSecret;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public String getLastIp() {
        return lastIp;
    }

    public void setLastIp(String lastIp) {
        this.lastIp = lastIp;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getDeactivatedAt() {
        return deactivatedAt;
    }

    public void setDeactivatedAt(LocalDateTime deactivatedAt) {
        this.deactivatedAt = deactivatedAt;
    }

    public String getDeactivatedBy() {
        return deactivatedBy;
    }

    public void setDeactivatedBy(String deactivatedBy) {
        this.deactivatedBy = deactivatedBy;
    }

    public String getDeactivationReason() {
        return deactivationReason;
    }

    public void setDeactivationReason(String deactivationReason) {
        this.deactivationReason = deactivationReason;
    }

    public Set<String> getApprovedIpAddresses() {
        return approvedIpAddresses;
    }

    public void setApprovedIpAddresses(Set<String> approvedIpAddresses) {
        this.approvedIpAddresses = approvedIpAddresses;
    }

    public Set<BiometricTemplate> getBiometricTemplates() {
        return biometricTemplates;
    }

    public void setBiometricTemplates(Set<BiometricTemplate> biometricTemplates) {
        this.biometricTemplates = biometricTemplates;
    }

    public Set<TrustedDevice> getTrustedDevices() {
        return trustedDevices;
    }

    public void setTrustedDevices(Set<TrustedDevice> trustedDevices) {
        this.trustedDevices = trustedDevices;
    }

    public int getFailedLoginAttempts() {
        return failedLoginAttempts;
    }

    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public LocalDateTime getAccountLockedUntil() {
        return accountLockedUntil;
    }

    public void setAccountLockedUntil(LocalDateTime accountLockedUntil) {
        this.accountLockedUntil = accountLockedUntil;
    }

    public String getSecurityKey() {
        return securityKey;
    }

    public void setSecurityKey(String securityKey) {
        this.securityKey = securityKey;
    }

    public LocalDateTime getSecurityKeyExpiry() {
        return securityKeyExpiry;
    }

    public void setSecurityKeyExpiry(LocalDateTime securityKeyExpiry) {
        this.securityKeyExpiry = securityKeyExpiry;
    }

    public LocalDateTime getEmergencyAccessUntil() {
        return emergencyAccessUntil;
    }

    public void setEmergencyAccessUntil(LocalDateTime emergencyAccessUntil) {
        this.emergencyAccessUntil = emergencyAccessUntil;
    }

    public String getEmergencyAccessReason() {
        return emergencyAccessReason;
    }

    public void setEmergencyAccessReason(String emergencyAccessReason) {
        this.emergencyAccessReason = emergencyAccessReason;
    }

    /**
     * Check if the admin account is locked.
     * 
     * @return true if the account is locked, false otherwise
     */
    public boolean isAccountLocked() {
        return accountLockedUntil != null && LocalDateTime.now().isBefore(accountLockedUntil);
    }

    /**
     * Check if the admin has emergency access.
     * 
     * @return true if the admin has emergency access, false otherwise
     */
    public boolean hasEmergencyAccess() {
        return emergencyAccessUntil != null && LocalDateTime.now().isBefore(emergencyAccessUntil);
    }

    /**
     * Check if the security key is valid.
     * 
     * @return true if the security key is valid, false otherwise
     */
    public boolean isSecurityKeyValid() {
        return securityKey != null && securityKeyExpiry != null && 
               LocalDateTime.now().isBefore(securityKeyExpiry);
    }

    /**
     * Get the admin's full name.
     * 
     * @return the admin's full name
     */
    public String getFullName() {
        return firstName + " " + lastName;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}