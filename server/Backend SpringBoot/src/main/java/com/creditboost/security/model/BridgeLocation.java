package com.creditboost.security.model;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Entity representing a bridge location for Level 6 administrators.
 * Bridge locations are randomly assigned and rotated for security.
 */
@Entity
@Table(name = "bridge_locations")
public class BridgeLocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "admin_index", nullable = false)
    private int adminIndex;

    @Column(name = "access_point", nullable = false)
    private int accessPoint;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "previous_access_point")
    private Integer previousAccessPoint;

    @Column(name = "rotation_count")
    private int rotationCount = 0;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public int getAdminIndex() {
        return adminIndex;
    }

    public void setAdminIndex(int adminIndex) {
        this.adminIndex = adminIndex;
    }

    public int getAccessPoint() {
        return accessPoint;
    }

    public void setAccessPoint(int accessPoint) {
        // Store previous access point before updating
        if (this.accessPoint != 0) {
            this.previousAccessPoint = this.accessPoint;
            this.rotationCount++;
        }
        this.accessPoint = accessPoint;
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

    public Integer getPreviousAccessPoint() {
        return previousAccessPoint;
    }

    public void setPreviousAccessPoint(Integer previousAccessPoint) {
        this.previousAccessPoint = previousAccessPoint;
    }

    public int getRotationCount() {
        return rotationCount;
    }

    public void setRotationCount(int rotationCount) {
        this.rotationCount = rotationCount;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}