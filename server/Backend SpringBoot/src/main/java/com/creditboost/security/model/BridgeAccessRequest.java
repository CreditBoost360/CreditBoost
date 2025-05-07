package com.creditboost.security.model;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a bridge access request from a Level 6 administrator.
 * Requires approval from other Level 6 administrators.
 */
@Entity
@Table(name = "bridge_access_requests")
public class BridgeAccessRequest {

    @Id
    @Column(name = "request_id", nullable = false)
    private String requestId;

    @Column(name = "admin_id", nullable = false)
    private String adminId;

    @Column(name = "access_point", nullable = false)
    private int accessPoint;

    @Column(name = "request_time", nullable = false)
    private LocalDateTime requestTime;

    @Column(name = "completion_time")
    private LocalDateTime completionTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private BridgeAccessStatus status;

    @ElementCollection
    @CollectionTable(name = "bridge_access_approvals", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "approving_admin_id")
    private List<String> approvals = new ArrayList<>();

    @Column(name = "reason", length = 1000)
    private String reason;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "device_fingerprint")
    private String deviceFingerprint;

    @Column(name = "denying_admin_id")
    private String denyingAdminId;

    @Column(name = "denial_reason", length = 1000)
    private String denialReason;

    @Column(name = "emergency_access", nullable = false)
    private boolean emergencyAccess = false;

    @Column(name = "bridge_token")
    private String bridgeToken;

    @Column(name = "token_expiry")
    private LocalDateTime tokenExpiry;

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getAdminId() {
        return adminId;
    }

    public void setAdminId(String adminId) {
        this.adminId = adminId;
    }

    public int getAccessPoint() {
        return accessPoint;
    }

    public void setAccessPoint(int accessPoint) {
        this.accessPoint = accessPoint;
    }

    public LocalDateTime getRequestTime() {
        return requestTime;
    }

    public void setRequestTime(LocalDateTime requestTime) {
        this.requestTime = requestTime;
    }

    public LocalDateTime getCompletionTime() {
        return completionTime;
    }

    public void setCompletionTime(LocalDateTime completionTime) {
        this.completionTime = completionTime;
    }

    public BridgeAccessStatus getStatus() {
        return status;
    }

    public void setStatus(BridgeAccessStatus status) {
        this.status = status;
    }

    public List<String> getApprovals() {
        return approvals;
    }

    public void setApprovals(List<String> approvals) {
        this.approvals = approvals;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
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

    public String getDenyingAdminId() {
        return denyingAdminId;
    }

    public void setDenyingAdminId(String denyingAdminId) {
        this.denyingAdminId = denyingAdminId;
    }

    public String getDenialReason() {
        return denialReason;
    }

    public void setDenialReason(String denialReason) {
        this.denialReason = denialReason;
    }

    public boolean isEmergencyAccess() {
        return emergencyAccess;
    }

    public void setEmergencyAccess(boolean emergencyAccess) {
        this.emergencyAccess = emergencyAccess;
    }

    public String getBridgeToken() {
        return bridgeToken;
    }

    public void setBridgeToken(String bridgeToken) {
        this.bridgeToken = bridgeToken;
    }

    public LocalDateTime getTokenExpiry() {
        return tokenExpiry;
    }

    public void setTokenExpiry(LocalDateTime tokenExpiry) {
        this.tokenExpiry = tokenExpiry;
    }

    /**
     * Check if the request is pending.
     * 
     * @return true if the request is pending, false otherwise
     */
    public boolean isPending() {
        return status == BridgeAccessStatus.PENDING;
    }

    /**
     * Check if the request is approved.
     * 
     * @return true if the request is approved, false otherwise
     */
    public boolean isApproved() {
        return status == BridgeAccessStatus.APPROVED;
    }

    /**
     * Check if the request is denied.
     * 
     * @return true if the request is denied, false otherwise
     */
    public boolean isDenied() {
        return status == BridgeAccessStatus.DENIED;
    }

    /**
     * Check if the request is expired.
     * 
     * @return true if the request is expired, false otherwise
     */
    public boolean isExpired() {
        return status == BridgeAccessStatus.EXPIRED;
    }

    /**
     * Check if the bridge token is valid.
     * 
     * @return true if the bridge token is valid, false otherwise
     */
    public boolean isTokenValid() {
        return bridgeToken != null && tokenExpiry != null && 
               LocalDateTime.now().isBefore(tokenExpiry);
    }

    /**
     * Add an approval from an admin.
     * 
     * @param adminId the admin ID
     * @return true if the admin was added to approvals, false if already approved
     */
    public boolean addApproval(String adminId) {
        if (!approvals.contains(adminId)) {
            approvals.add(adminId);
            return true;
        }
        return false;
    }

    /**
     * Check if an admin has approved this request.
     * 
     * @param adminId the admin ID
     * @return true if the admin has approved this request, false otherwise
     */
    public boolean isApprovedBy(String adminId) {
        return approvals.contains(adminId);
    }

    /**
     * Get the duration of the request in seconds.
     * 
     * @return the duration in seconds, or -1 if the request is still pending
     */
    public long getDurationSeconds() {
        if (completionTime == null) {
            return -1;
        }
        return java.time.Duration.between(requestTime, completionTime).getSeconds();
    }
}