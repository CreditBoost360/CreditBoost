package com.creditboost.security.model;

import javax.persistence.Column;
import javax.persistence.Embeddable;
import javax.persistence.EnumType;
import javax.persistence.Enumerated;
import java.time.LocalDateTime;

/**
 * Represents a biometric template for an administrator.
 * This is embedded in the Admin entity.
 */
@Embeddable
public class BiometricTemplate {

    @Enumerated(EnumType.STRING)
    @Column(name = "biometric_type", nullable = false)
    private BiometricType type;

    @Column(name = "biometric_data", nullable = false, length = 10000)
    private String encryptedData;

    @Column(name = "biometric_created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "biometric_updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "biometric_hash", nullable = false)
    private String hash;

    @Column(name = "biometric_quality_score")
    private Double qualityScore;

    @Column(name = "biometric_verification_count")
    private int verificationCount = 0;

    @Column(name = "biometric_last_verified")
    private LocalDateTime lastVerified;

    public BiometricType getType() {
        return type;
    }

    public void setType(BiometricType type) {
        this.type = type;
    }

    public String getEncryptedData() {
        return encryptedData;
    }

    public void setEncryptedData(String encryptedData) {
        this.encryptedData = encryptedData;
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

    public String getHash() {
        return hash;
    }

    public void setHash(String hash) {
        this.hash = hash;
    }

    public Double getQualityScore() {
        return qualityScore;
    }

    public void setQualityScore(Double qualityScore) {
        this.qualityScore = qualityScore;
    }

    public int getVerificationCount() {
        return verificationCount;
    }

    public void setVerificationCount(int verificationCount) {
        this.verificationCount = verificationCount;
    }

    public LocalDateTime getLastVerified() {
        return lastVerified;
    }

    public void setLastVerified(LocalDateTime lastVerified) {
        this.lastVerified = lastVerified;
    }

    /**
     * Increment the verification count and update the last verified timestamp.
     */
    public void incrementVerificationCount() {
        this.verificationCount++;
        this.lastVerified = LocalDateTime.now();
    }
}