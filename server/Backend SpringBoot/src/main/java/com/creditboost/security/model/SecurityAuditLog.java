package com.creditboost.security.model;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing a security audit log entry.
 * All security-related actions are logged for accountability.
 */
@Entity
@Table(name = "security_audit_logs")
public class SecurityAuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_id")
    private String adminId;

    @Column(name = "action", nullable = false)
    private String action;

    @Column(name = "details", length = 2000)
    private String details;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "device_fingerprint")
    private String deviceFingerprint;

    @Column(name = "session_id")
    private String sessionId;

    @Column(name = "success", nullable = false)
    private boolean success = true;

    @Column(name = "failure_reason", length = 1000)
    private String failureReason;

    @Column(name = "affected_entity")
    private String affectedEntity;

    @Column(name = "affected_entity_id")
    private String affectedEntityId;

    @Column(name = "severity", nullable = false)
    private String severity = "INFO";

    @Column(name = "source_system")
    private String sourceSystem;

    @Column(name = "request_id")
    private String requestId;

    @Column(name = "user_agent", length = 1000)
    private String userAgent;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getDetails() {
        return details;
    }

    public void setDetails(String details) {
        this.details = details;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getIpAddress() {
        return ipAddress;
    }

    public void setIpAddress(String ipAddress) {
        this.ipAddress = ipAddress;
    }

    public String getDeviceFingerprint() {
        return deviceFingerprint;
    }

    public void setDeviceFingerprint(String deviceFingerprint) {
        this.deviceFingerprint = deviceFingerprint;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public String getAffectedEntity() {
        return affectedEntity;
    }

    public void setAffectedEntity(String affectedEntity) {
        this.affectedEntity = affectedEntity;
    }

    public String getAffectedEntityId() {
        return affectedEntityId;
    }

    public void setAffectedEntityId(String affectedEntityId) {
        this.affectedEntityId = affectedEntityId;
    }

    public String getSeverity() {
        return severity;
    }

    public void setSeverity(String severity) {
        this.severity = severity;
    }

    public String getSourceSystem() {
        return sourceSystem;
    }

    public void setSourceSystem(String sourceSystem) {
        this.sourceSystem = sourceSystem;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    @PrePersist
    protected void onCreate() {
        this.timestamp = LocalDateTime.now();
    }
}