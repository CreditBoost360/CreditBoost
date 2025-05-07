package com.creditboost.security.config;

import com.creditboost.security.model.Admin;
import com.creditboost.security.repository.AdminRepository;
import com.creditboost.security.service.BridgeLocationService;
import com.creditboost.security.service.SecurityAuditService;
import com.creditboost.security.service.SecureNotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

import javax.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * Configuration for Level 6 security clearance administrators and bridge access.
 * This class enforces the strict security requirements for the highest level of access.
 */
@Configuration
@EnableScheduling
public class Level6SecurityConfig {

    @Autowired
    private Level6SecurityProperties securityProperties;
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private BridgeLocationService bridgeLocationService;
    
    @Autowired
    private SecurityAuditService auditService;
    
    @Autowired
    private SecureNotificationService notificationService;
    
    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);
    
    /**
     * Initialize the Level 6 security system and validate configuration.
     * Ensures exactly 3 Level 6 administrators are configured.
     */
    @PostConstruct
    public void initializeLevel6Security() {
        // Verify exactly 3 Level 6 admins are configured
        List<Admin> level6Admins = adminRepository.findByAccessLevel(6);
        
        if (level6Admins.size() != 3) {
            throw new SecurityConfigurationException(
                "Exactly 3 Level 6 administrators must be configured. Found: " + level6Admins.size()
            );
        }
        
        auditService.logSystemEvent(
            "LEVEL6_SECURITY_INITIALIZED",
            "Level 6 security system initialized with " + level6Admins.size() + " administrators"
        );
        
        // Initialize random bridge locations
        bridgeLocationService.initializeRandomBridgeLocations();
        
        // Schedule bridge location rotation
        if (securityProperties.getBridge().getRandomization().isEnabled()) {
            scheduleBridgeLocationRotation();
        }
        
        // Log initialization
        auditService.logSystemEvent(
            "LEVEL6_SECURITY_INITIALIZED",
            "Level 6 security system initialized successfully"
        );
    }
    
    /**
     * Schedule the rotation of bridge locations at the configured interval.
     */
    private void scheduleBridgeLocationRotation() {
        int intervalMinutes = securityProperties.getBridge().getRandomization().getChangeIntervalMinutes();
        
        scheduler.scheduleAtFixedRate(
            () -> bridgeLocationService.rotateRandomBridgeLocations(),
            intervalMinutes,
            intervalMinutes,
            TimeUnit.MINUTES
        );
    }
    
    /**
     * Generate and distribute daily security reports at midnight.
     * This provides Level 6 administrators with a comprehensive view of system activity.
     */
    @Scheduled(cron = "0 0 0 * * ?") // Run at midnight every day
    public void generateDailySecurityReports() {
        List<Admin> level6Admins = adminRepository.findByAccessLevel(6);
        
        // Generate comprehensive security report
        String reportId = auditService.generateDailySecurityReport();
        
        // Notify all Level 6 admins
        for (Admin admin : level6Admins) {
            notificationService.sendSecurityReport(admin.getId(), reportId);
        }
        
        auditService.logSystemEvent(
            "DAILY_SECURITY_REPORT_GENERATED",
            "Daily security report generated and distributed to Level 6 administrators"
        );
    }
    
    /**
     * Verify the integrity of the Level 6 security system.
     * Runs every hour to ensure all components are functioning correctly.
     */
    @Scheduled(cron = "0 0 * * * ?") // Run every hour
    public void verifySecurityIntegrity() {
        // Verify all Level 6 admins are still active
        List<Admin> level6Admins = adminRepository.findByAccessLevel(6);
        
        if (level6Admins.size() != 3) {
            // Critical security alert - incorrect number of Level 6 admins
            auditService.logSecurityEvent(
                "SYSTEM",
                "LEVEL6_SECURITY_BREACH",
                "Incorrect number of Level 6 administrators detected: " + level6Admins.size()
            );
            
            // Notify all remaining Level 6 admins
            for (Admin admin : level6Admins) {
                notificationService.sendSecurityAlert(
                    admin.getId(),
                    "CRITICAL",
                    "Security breach detected: Incorrect number of Level 6 administrators"
                );
            }
        }
        
        // Verify bridge locations are properly configured
        bridgeLocationService.verifyBridgeIntegrity();
    }
    
    @Bean
    public Level6BridgeAccessManager bridgeAccessManager() {
        return new Level6BridgeAccessManagerImpl(
            securityProperties,
            adminRepository,
            bridgeLocationService,
            auditService,
            notificationService
        );
    }
}