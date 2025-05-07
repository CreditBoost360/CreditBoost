package com.creditboost.security.repository;

import com.creditboost.security.model.SecurityAuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Repository for SecurityAuditLog entities.
 */
@Repository
public interface SecurityAuditLogRepository extends JpaRepository<SecurityAuditLog, Long> {

    /**
     * Find all audit logs for a specific admin.
     * 
     * @param adminId the admin ID
     * @return the list of audit logs
     */
    List<SecurityAuditLog> findByAdminId(String adminId);

    /**
     * Find all audit logs for a specific action.
     * 
     * @param action the action
     * @return the list of audit logs
     */
    List<SecurityAuditLog> findByAction(String action);

    /**
     * Find all audit logs for a specific admin and action.
     * 
     * @param adminId the admin ID
     * @param action the action
     * @return the list of audit logs
     */
    List<SecurityAuditLog> findByAdminIdAndAction(String adminId, String action);

    /**
     * Find all audit logs within a specific time range.
     * 
     * @param start the start time
     * @param end the end time
     * @return the list of audit logs
     */
    List<SecurityAuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);

    /**
     * Find all audit logs for a specific admin within a specific time range.
     * 
     * @param adminId the admin ID
     * @param start the start time
     * @param end the end time
     * @return the list of audit logs
     */
    List<SecurityAuditLog> findByAdminIdAndTimestampBetween(String adminId, LocalDateTime start, LocalDateTime end);

    /**
     * Find all audit logs for a specific IP address.
     * 
     * @param ipAddress the IP address
     * @return the list of audit logs
     */
    List<SecurityAuditLog> findByIpAddress(String ipAddress);

    /**
     * Find all audit logs for a specific device fingerprint.
     * 
     * @param deviceFingerprint the device fingerprint
     * @return the list of audit logs
     */
    List<SecurityAuditLog> findByDeviceFingerprint(String deviceFingerprint);

    /**
     * Find all audit logs for a specific session ID.
     * 
     * @param sessionId the session ID
     * @return the list of audit logs
     */
    List<SecurityAuditLog> findBySessionId(String sessionId);

    /**
     * Find all failed audit logs.
     * 
     * @return the list of failed audit logs
     */
    List<SecurityAuditLog> findBySuccessFalse();

    /**
     * Find all audit logs with a specific severity.
     * 
     * @param severity the severity
     * @return the list of audit logs
     */
    List<SecurityAuditLog> findBySeverity(String severity);

    /**
     * Find all audit logs for a specific affected entity.
     * 
     * @param affectedEntity the affected entity
     * @return the list of audit logs
     */
    List<SecurityAuditLog> findByAffectedEntity(String affectedEntity);

    /**
     * Find all audit logs for a specific affected entity ID.
     * 
     * @param affectedEntityId the affected entity ID
     * @return the list of audit logs
     */
    List<SecurityAuditLog> findByAffectedEntityId(String affectedEntityId);

    /**
     * Find all audit logs with pagination.
     * 
     * @param pageable the pagination information
     * @return the page of audit logs
     */
    Page<SecurityAuditLog> findAll(Pageable pageable);

    /**
     * Find all distinct IP addresses used by a specific admin.
     * 
     * @param adminId the admin ID
     * @return the list of distinct IP addresses
     */
    @Query("SELECT DISTINCT s.ipAddress FROM SecurityAuditLog s WHERE s.adminId = :adminId AND s.ipAddress IS NOT NULL")
    List<String> findDistinctIpAddressesByAdminId(@Param("adminId") String adminId);

    /**
     * Count the number of login attempts by a specific admin within a specific time range.
     * 
     * @param adminId the admin ID
     * @param start the start time
     * @param end the end time
     * @return the count
     */
    @Query("SELECT COUNT(s) FROM SecurityAuditLog s WHERE s.adminId = :adminId AND s.action = 'LOGIN' AND s.timestamp BETWEEN :start AND :end")
    long countLoginsByAdminIdAndTimeRange(
        @Param("adminId") String adminId,
        @Param("start") LocalDateTime start,
        @Param("end") LocalDateTime end
    );

    /**
     * Find all audit logs containing a specific text in the details.
     * 
     * @param text the text to search for
     * @return the list of audit logs
     */
    @Query("SELECT s FROM SecurityAuditLog s WHERE s.details LIKE %:text%")
    List<SecurityAuditLog> findByDetailsContaining(@Param("text") String text);

    /**
     * Find all audit logs for a specific request ID.
     * 
     * @param requestId the request ID
     * @return the list of audit logs
     */
    List<SecurityAuditLog> findByRequestId(String requestId);
}