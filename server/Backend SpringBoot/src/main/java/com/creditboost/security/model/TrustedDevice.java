package com.creditboost.security.model;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * Represents a trusted device for an administrator.
 * This is embedded in the Admin entity.
 */
@Embeddable
public class TrustedDevice {

    @Column(name = "device_fingerprint", nullable = false)
    private String fingerprint;

    @Column(name = "device_name")
    private String name;

    @Column(name = "device_info", length = 1000)
    private String deviceInfo;

    @Column(name = "device_registration_date", nullable = false)
    private LocalDateTime registrationDate;

    @Column(name = "device_last_used")
    private LocalDateTime lastUsed;

    @Column(name = "device_expiration_date")
    private LocalDateTime expirationDate;

    @Column(name = "device_ip_address")
    private String ipAddress;

    @Column(name = "device_verified", nullable = false)
    private boolean verified = false;

    @Column(name = "device_verification_date")
    private LocalDateTime verificationDate;

    @Column(name = "device_biometric_capabilities")
    private String biometricCapabilities;

    @Column(name = "device_hardware_attestation")
    private String hardwareAttestation;

    @Column(name = "device_active", nullable = false)
    private boolean active = true;

    @Column(name = "device_deactivated_at")
    private LocalDateTime deactivatedAt;

    @Column(name = "device_deactivated_by")
    private String deactivatedBy;

    @Column(name = "device_deactivation_reason")
    private String deactivationReason;

    public String getFingerprint() {
        return fingerprint;
    }

    public void setFingerprint(String fingerprint) {
        this.fingerprint = fingerprint;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDeviceInfo() {
        return deviceInfo;
    }

    public void setDeviceInfo(String deviceInfo) {
        this.deviceInfo = deviceInfo;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public LocalDateTime getLastUsed() {
        return lastUsed;
    }

    public void setLastUsed(LocalDateTime lastUsed) {
        this.lastUsed = lastUsed;
    }

    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public LocalDateTime getVerificationDate() {
        return verificationDate;
    }

    public void setVerificationDate(LocalDateTime verificationDate) {
        this.verificationDate = verificationDate;
    }

    public String getBiometricCapabilities() {
        return biometricCapabilities;
    }

    public void setBiometricCapabilities(String biometricCapabilities) {
        this.biometricCapabilities = biometricCapabilities;
    }

    public String getHardwareAttestation() {
        return hardwareAttestation;
    }

    public void setHardwareAttestation(String hardwareAttestation) {
        this.hardwareAttestation = hardwareAttestation;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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

    /**
     * Check if the device is expired.
     * 
     * @return true if the device is expired, false otherwise
     */
    public boolean isExpired() {
        return expirationDate != null && LocalDateTime.now().isAfter(expirationDate);
    }

    /**
     * Check if the device has biometric capability.
     * 
     * @param type the biometric type
     * @return true if the device has the specified biometric capability, false otherwise
     */
    public boolean hasBiometricCapability(BiometricType type) {
        return biometricCapabilities != null && biometricCapabilities.contains(type.name());
    }

    /**
     * Update the last used timestamp.
     */
    public void updateLastUsed() {
        this.lastUsed = LocalDateTime.now();
    }

    /**
     * Deactivate the device.
     * 
     * @param deactivatedBy the admin who deactivated the device
     * @param reason the reason for deactivation
     */
    public void deactivate(String deactivatedBy, String reason) {
        this.active = false;
        this.deactivatedAt = LocalDateTime.now();
        this.deactivatedBy = deactivatedBy;
        this.deactivationReason = reason;
    }
}