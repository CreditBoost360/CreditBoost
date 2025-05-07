package com.creditboost.security.repository;

import com.creditboost.security.model.Admin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Admin entities.
 */
@Repository
public interface AdminRepository extends JpaRepository<Admin, Long> {

    /**
     * Find an admin by username.
     * 
     * @param username the username
     * @return the admin, or empty if not found
     */
    Optional<Admin> findByUsername(String username);

    /**
     * Find an admin by email.
     * 
     * @param email the email
     * @return the admin, or empty if not found
     */
    Optional<Admin> findByEmail(String email);

    /**
     * Find all admins with a specific access level.
     * 
     * @param accessLevel the access level
     * @return the list of admins
     */
    List<Admin> findByAccessLevel(int accessLevel);

    /**
     * Find all active admins with a specific access level.
     * 
     * @param accessLevel the access level
     * @param active the active status
     * @return the list of admins
     */
    List<Admin> findByAccessLevelAndActive(int accessLevel, boolean active);

    /**
     * Find all admins who have not logged in since a specific date.
     * 
     * @param date the date
     * @return the list of admins
     */
    @Query("SELECT a FROM Admin a WHERE a.lastLogin < :date")
    List<Admin> findInactiveAdminsSince(@Param("date") LocalDateTime date);

    /**
     * Find all admins with emergency access.
     * 
     * @param now the current date and time
     * @return the list of admins
     */
    @Query("SELECT a FROM Admin a WHERE a.emergencyAccessUntil > :now")
    List<Admin> findAdminsWithEmergencyAccess(@Param("now") LocalDateTime now);

    /**
     * Find all admins with locked accounts.
     * 
     * @param now the current date and time
     * @return the list of admins
     */
    @Query("SELECT a FROM Admin a WHERE a.accountLockedUntil > :now")
    List<Admin> findLockedAdmins(@Param("now") LocalDateTime now);

    /**
     * Count the number of active Level 6 administrators.
     * 
     * @return the count
     */
    @Query("SELECT COUNT(a) FROM Admin a WHERE a.accessLevel = 6 AND a.active = true")
    int countActiveLevel6Admins();

    /**
     * Find all admins except the specified admin.
     * 
     * @param adminId the admin ID to exclude
     * @return the list of admins
     */
    @Query("SELECT a FROM Admin a WHERE a.id != :adminId")
    List<Admin> findAllExcept(@Param("adminId") Long adminId);

    /**
     * Find all admins with a specific access level except the specified admin.
     * 
     * @param accessLevel the access level
     * @param adminId the admin ID to exclude
     * @return the list of admins
     */
    @Query("SELECT a FROM Admin a WHERE a.accessLevel = :accessLevel AND a.id != :adminId")
    List<Admin> findByAccessLevelExcept(@Param("accessLevel") int accessLevel, @Param("adminId") Long adminId);
}