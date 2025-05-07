package com.creditboost.security.repository;

import com.creditboost.security.model.BridgeLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repository for BridgeLocation entities.
 */
@Repository
public interface BridgeLocationRepository extends JpaRepository<BridgeLocation, Long> {

    /**
     * Find a bridge location by admin index.
     * 
     * @param adminIndex the admin index
     * @return the bridge location, or empty if not found
     */
    Optional<BridgeLocation> findByAdminIndex(int adminIndex);

    /**
     * Find a bridge location by access point.
     * 
     * @param accessPoint the access point
     * @return the bridge location, or empty if not found
     */
    Optional<BridgeLocation> findByAccessPoint(int accessPoint);

    /**
     * Check if a bridge location exists for a specific admin index.
     * 
     * @param adminIndex the admin index
     * @return true if a bridge location exists, false otherwise
     */
    boolean existsByAdminIndex(int adminIndex);

    /**
     * Check if a bridge location exists for a specific access point.
     * 
     * @param accessPoint the access point
     * @return true if a bridge location exists, false otherwise
     */
    boolean existsByAccessPoint(int accessPoint);

    /**
     * Delete all bridge locations for a specific admin index.
     * 
     * @param adminIndex the admin index
     */
    void deleteByAdminIndex(int adminIndex);
}