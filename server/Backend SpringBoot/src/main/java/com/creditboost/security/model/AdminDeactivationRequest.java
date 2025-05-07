package com.creditboost.security.model;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Entity representing a request to deactivate a Level 6 administrator.
 * Requires approval from other Level 6 administrators.
 */
@Entity
@Table(name = "admin_deactivation_requests")
public class AdminDeactivationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "request_id", nullable = false, unique = true)
    private String requestId;

    @Column(name = "target_admin_id", nullable = false)
    private String targetAdminId;

    @Column(name = "requesting_admin_id", nullable = false)
    private String requestingAdminId;

    @Column(name = "reason", nullable = false, length = 1000)
    private String reason;

    @Column(name = "request_time", nullable = false)
    private LocalDateTime requestTime;

    @Column(name = "completion_time")
    private LocalDateTime completionTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    private DeactivationRequestStatus status;

    @ElementCollection
    @CollectionTable(name = "admin_deactivation_approvals", joinColumns = @JoinColumn(name = "request_id"))
    @Column(name = "approving_admin_id")
    private List<String> approvals = new ArrayList<>();

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "device_fingerprint")
    private String deviceFingerprint;

    @Column(name = "security_threat", nullable = false)
    private boolean securityThreat = false;

    @Column(name = "emergency_deactivation", nullable = false)
    private boolean emergencyDeactivation = false;

    @Column(name = "denying_admin_id")
    private String denyingAdminId;

    @Column(name = "denial_reason", length = 1000)
    private String denialReason;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRequestId() {
        return requestId;
    }

    public void setRequestId(String requestId) {
        this.requestId = requestId;
    }

    public String getTargetAdminId() {
        return targetAdminId;
    }

    public void setTargetAdminId(String targetAdminId) {
        this.targetAdminId = targetAdminId;
    }

    public String getRequestingAdminId() {
        return requestingAdminId;
    }

    public void setRequestingAdminId(String requestingAdminId) {
        this.requestingAdminId = requestingAdminId;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
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

    public DeactivationRequestStatus getStatus() {
        return status;
    }

    public void setStatus(DeactivationRequestStatus status) {
        this.status = status;
    }

    public List<String> getApprovals() {
        return approvals;
    }

    public void setApprovals(List<String> approvals) {
        this.approvals = approvals;
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

    public boolean isSecurityThreat() {
        return securityThreat;
    }

    public void setSecurityThreat(boolean securityThreat) {
        this.securityThreat = securityThreat;
    }

    public boolean isEmergencyDeactivation() {
        return emergencyDeactivation;
    }

    public void setEmergencyDeactivation(boolean emergencyDeactivation) {
        this.emergencyDeactivation = emergencyDeactivation;
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

    /**
     * Check if the request is pending.
     * 
     * @return true if the request is pending, false otherwise
     */
    public boolean isPending() {
        return status == DeactivationRequestStatus.PENDING;
    }

    /**
     * Check if the request is approved.
     * 
     * @return true if the request is approved, false otherwise
     */
    public boolean isApproved() {
        return status == DeactivationRequestStatus.APPROVED;
    }

    /**
     * Check if the request is denied.
     * 
     * @return true if the request is denied, false otherwise
     */
    public boolean isDenied() {
        return status == DeactivationRequestStatus.DENIED;
    }

    /**
     * Check if the request is expired.
     * 
     * @return true if the request is expired, false otherwise
     */
    public boolean isExpired() {
        return status == DeactivationRequestStatus.EXPIRED;
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