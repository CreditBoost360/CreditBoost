package com.creditboost.security.repository;

import com.creditboost.security.model.BridgeAccessRequest;
import com.creditboost.security.model.BridgeAccessStatus;
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
 * Repository for BridgeAccessRequest entities.
 */
@Repository
public interface BridgeAccessRequestRepository extends JpaRepository<BridgeAccessRequest, String> {

    /**
     * Find all bridge access requests for a specific admin.
     * 
     * @param adminId the admin ID
     * @return the list of bridge access requests
     */
    List<BridgeAccessRequest> findByAdminId(String adminId);

    /**
     * Find all bridge access requests with a specific status.
     * 
     * @param status the status
     * @return the list of bridge access requests
     */
    List<BridgeAccessRequest> findByStatus(BridgeAccessStatus status);

    /**
     * Find all bridge access requests for a specific admin with a specific status.
     * 
     * @param adminId the admin ID
     * @param status the status
     * @return the list of bridge access requests
     */
    List<BridgeAccessRequest> findByAdminIdAndStatus(String adminId, BridgeAccessStatus status);

    /**
     * Find all pending bridge access requests.
     * 
     * @return the list of pending bridge access requests
     */
    @Query("SELECT r FROM BridgeAccessRequest r WHERE r.status = 'PENDING'")
    List<BridgeAccessRequest> findPendingRequests();

    /**
     * Find all bridge access requests that have been approved by a specific admin.
     * 
     * @param adminId the admin ID
     * @return the list of bridge access requests
     */
    @Query("SELECT r FROM BridgeAccessRequest r JOIN r.approvals a WHERE a = :adminId")
    List<BridgeAccessRequest> findRequestsApprovedBy(@Param("adminId") String adminId);

    /**
     * Find all bridge access requests that need approval from other admins.
     * 
     * @param adminId the admin ID to exclude (requesting admin)
     * @return the list of bridge access requests
     */
    @Query("SELECT r FROM BridgeAccessRequest r WHERE r.status = 'PENDING' AND r.adminId != :adminId")
    List<BridgeAccessRequest> findRequestsNeedingApproval(@Param("adminId") String adminId);

    /**
     * Find all bridge access requests created within a specific time range.
     * 
     * @param start the start time
     * @param end the end time
     * @return the list of bridge access requests
     */
    List<BridgeAccessRequest> findByRequestTimeBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Find all emergency bridge access requests.
     * 
     * @return the list of emergency bridge access requests
     */
    List<BridgeAccessRequest> findByEmergencyAccessTrue();

    /**
     * Find the most recent bridge access request for a specific admin.
     * 
     * @param adminId the admin ID
     * @return the most recent bridge access request, or empty if not found
     */
    Optional<BridgeAccessRequest> findFirstByAdminIdOrderByRequestTimeDesc(String adminId);

    /**
     * Find all bridge access requests with pagination.
     * 
     * @param pageable the pagination information
     * @return the page of bridge access requests
     */
    Page<BridgeAccessRequest> findAll(Pageable pageable);

    /**
     * Count the number of bridge access requests for a specific admin within a time range.
     * 
     * @param adminId the admin ID
     * @param start the start time
     * @param end the end time
     * @return the count
     */
    @Query("SELECT COUNT(r) FROM BridgeAccessRequest r WHERE r.adminId = :adminId AND r.requestTime BETWEEN :start AND :end")
    int countRequestsByAdminInTimeRange(
        @Param("adminId") String adminId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    /**
     * Find all bridge access requests that have expired but still have a PENDING status.
     * 
     * @param expiryTime the expiry time
     * @return the list of expired bridge access requests
     */
    @Query("SELECT r FROM BridgeAccessRequest r WHERE r.status = 'PENDING' AND r.requestTime < :expiryTime")
    List<BridgeAccessRequest> findExpiredPendingRequests(@Param("expiryTime") LocalDateTime expiryTime);
}