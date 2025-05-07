package com.creditboost.security.repository;

import com.creditboost.security.model.AdminDeactivationRequest;
import com.creditboost.security.model.DeactivationRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for AdminDeactivationRequest entities.
 */
@Repository
public interface AdminDeactivationRequestRepository extends JpaRepository<AdminDeactivationRequest, Long> {

    /**
     * Find a deactivation request by request ID.
     * 
     * @param requestId the request ID
     * @return the deactivation request, or empty if not found
     */
    Optional<AdminDeactivationRequest> findByRequestId(String requestId);

    /**
     * Find all deactivation requests for a specific target admin.
     * 
     * @param targetAdminId the target admin ID
     * @return the list of deactivation requests
     */
    List<AdminDeactivationRequest> findByTargetAdminId(String targetAdminId);

    /**
     * Find all deactivation requests created by a specific admin.
     * 
     * @param requestingAdminId the requesting admin ID
     * @return the list of deactivation requests
     */
    List<AdminDeactivationRequest> findByRequestingAdminId(String requestingAdminId);

    /**
     * Find all deactivation requests with a specific status.
     * 
     * @param status the status
     * @return the list of deactivation requests
     */
    List<AdminDeactivationRequest> findByStatus(DeactivationRequestStatus status);

    /**
     * Find all deactivation requests for a specific target admin with a specific status.
     * 
     * @param targetAdminId the target admin ID
     * @param status the status
     * @return the list of deactivation requests
     */
    List<AdminDeactivationRequest> findByTargetAdminIdAndStatus(String targetAdminId, DeactivationRequestStatus status);

    /**
     * Find all pending deactivation requests.
     * 
     * @return the list of pending deactivation requests
     */
    @Query("SELECT r FROM AdminDeactivationRequest r WHERE r.status = 'PENDING'")
    List<AdminDeactivationRequest> findPendingRequests();

    /**
     * Find all deactivation requests that have been approved by a specific admin.
     * 
     * @param adminId the admin ID
     * @return the list of deactivation requests
     */
    @Query("SELECT r FROM AdminDeactivationRequest r JOIN r.approvals a WHERE a = :adminId")
    List<AdminDeactivationRequest> findRequestsApprovedBy(@Param("adminId") String adminId);

    /**
     * Find all deactivation requests that need approval from other admins.
     * 
     * @param adminId the admin ID to exclude (requesting admin)
     * @return the list of deactivation requests
     */
    @Query("SELECT r FROM AdminDeactivationRequest r WHERE r.status = 'PENDING' AND r.requestingAdminId != :adminId AND r.targetAdminId != :adminId")
    List<AdminDeactivationRequest> findRequestsNeedingApproval(@Param("adminId") String adminId);

    /**
     * Find all deactivation requests created within a specific time range.
     * 
     * @param start the start time
     * @param end the end time
     * @return the list of deactivation requests
     */
    List<AdminDeactivationRequest> findByRequestTimeBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Find all emergency deactivation requests.
     * 
     * @return the list of emergency deactivation requests
     */
    List<AdminDeactivationRequest> findByEmergencyDeactivationTrue();

    /**
     * Find all security threat deactivation requests.
     * 
     * @return the list of security threat deactivation requests
     */
    List<AdminDeactivationRequest> findBySecurityThreatTrue();

    /**
     * Find the most recent deactivation request for a specific target admin.
     * 
     * @param targetAdminId the target admin ID
     * @return the most recent deactivation request, or empty if not found
     */
    Optional<AdminDeactivationRequest> findFirstByTargetAdminIdOrderByRequestTimeDesc(String targetAdminId);

    /**
     * Find all deactivation requests with pagination.
     * 
     * @param pageable the pagination information
     * @return the page of deactivation requests
     */
    Page<AdminDeactivationRequest> findAll(Pageable pageable);

    /**
     * Find all deactivation requests that have expired but still have a PENDING status.
     * 
     * @param expiryTime the expiry time
     * @return the list of expired deactivation requests
     */
    @Query("SELECT r FROM AdminDeactivationRequest r WHERE r.status = 'PENDING' AND r.requestTime < :expiryTime")
    List<AdminDeactivationRequest> findExpiredPendingRequests(@Param("expiryTime") LocalDateTime expiryTime);
}