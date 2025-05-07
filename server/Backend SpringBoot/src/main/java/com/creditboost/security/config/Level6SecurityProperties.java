package com.creditboost.security.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Configuration properties for Level 6 security system.
 * These properties are loaded from application.properties/yml.
 */
@Component
@ConfigurationProperties(prefix = "security")
public class Level6SecurityProperties {

    private Bridge bridge = new Bridge();
    private Admin admin = new Admin();
    private Biometric biometric = new Biometric();
    private Audit audit = new Audit();
    private Alerts alerts = new Alerts();
    private EmergencyAccess emergencyAccess = new EmergencyAccess();

    public Bridge getBridge() {
        return bridge;
    }

    public void setBridge(Bridge bridge) {
        this.bridge = bridge;
    }

    public Admin getAdmin() {
        return admin;
    }

    public void setAdmin(Admin admin) {
        this.admin = admin;
    }

    public Biometric getBiometric() {
        return biometric;
    }

    public void setBiometric(Biometric biometric) {
        this.biometric = biometric;
    }

    public Audit getAudit() {
        return audit;
    }

    public void setAudit(Audit audit) {
        this.audit = audit;
    }

    public Alerts getAlerts() {
        return alerts;
    }

    public void setAlerts(Alerts alerts) {
        this.alerts = alerts;
    }

    public EmergencyAccess getEmergencyAccess() {
        return emergencyAccess;
    }

    public void setEmergencyAccess(EmergencyAccess emergencyAccess) {
        this.emergencyAccess = emergencyAccess;
    }

    /**
     * Bridge security configuration.
     */
    public static class Bridge {
        private Level6 level6 = new Level6();
        private Randomization randomization = new Randomization();
        private int accessPoints = 12;
        private int concurrentApprovalsRequired = 2;
        private int approvalTimeoutSeconds = 180;
        private boolean lockoutOnSuspiciousActivity = true;
        private String tokenSecret;

        public Level6 getLevel6() {
            return level6;
        }

        public void setLevel6(Level6 level6) {
            this.level6 = level6;
        }

        public Randomization getRandomization() {
            return randomization;
        }

        public void setRandomization(Randomization randomization) {
            this.randomization = randomization;
        }

        public int getAccessPoints() {
            return accessPoints;
        }

        public void setAccessPoints(int accessPoints) {
            this.accessPoints = accessPoints;
        }

        public int getConcurrentApprovalsRequired() {
            return concurrentApprovalsRequired;
        }

        public void setConcurrentApprovalsRequired(int concurrentApprovalsRequired) {
            this.concurrentApprovalsRequired = concurrentApprovalsRequired;
        }

        public int getApprovalTimeoutSeconds() {
            return approvalTimeoutSeconds;
        }

        public void setApprovalTimeoutSeconds(int approvalTimeoutSeconds) {
            this.approvalTimeoutSeconds = approvalTimeoutSeconds;
        }

        public boolean isLockoutOnSuspiciousActivity() {
            return lockoutOnSuspiciousActivity;
        }

        public void setLockoutOnSuspiciousActivity(boolean lockoutOnSuspiciousActivity) {
            this.lockoutOnSuspiciousActivity = lockoutOnSuspiciousActivity;
        }

        public String getTokenSecret() {
            return tokenSecret;
        }

        public void setTokenSecret(String tokenSecret) {
            this.tokenSecret = tokenSecret;
        }
    }

    /**
     * Level 6 admin configuration.
     */
    public static class Level6 {
        private int adminCount = 3;
        private List<String> adminIds;

        public int getAdminCount() {
            return adminCount;
        }

        public void setAdminCount(int adminCount) {
            this.adminCount = adminCount;
        }

        public List<String> getAdminIds() {
            return adminIds;
        }

        public void setAdminIds(List<String> adminIds) {
            this.adminIds = adminIds;
        }
    }

    /**
     * Bridge randomization configuration.
     */
    public static class Randomization {
        private boolean enabled = true;
        private int changeIntervalMinutes = 30;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public int getChangeIntervalMinutes() {
            return changeIntervalMinutes;
        }

        public void setChangeIntervalMinutes(int changeIntervalMinutes) {
            this.changeIntervalMinutes = changeIntervalMinutes;
        }
    }

    /**
     * Admin security configuration.
     */
    public static class Admin {
        private KeyRotation keyRotation = new KeyRotation();
        private FailedAttempts failedAttempts = new FailedAttempts();
        private Session session = new Session();
        private IpWhitelist ipWhitelist = new IpWhitelist();
        private DeactivationPolicy deactivationPolicy = new DeactivationPolicy();

        public KeyRotation getKeyRotation() {
            return keyRotation;
        }

        public void setKeyRotation(KeyRotation keyRotation) {
            this.keyRotation = keyRotation;
        }

        public FailedAttempts getFailedAttempts() {
            return failedAttempts;
        }

        public void setFailedAttempts(FailedAttempts failedAttempts) {
            this.failedAttempts = failedAttempts;
        }

        public Session getSession() {
            return session;
        }

        public void setSession(Session session) {
            this.session = session;
        }

        public IpWhitelist getIpWhitelist() {
            return ipWhitelist;
        }

        public void setIpWhitelist(IpWhitelist ipWhitelist) {
            this.ipWhitelist = ipWhitelist;
        }

        public DeactivationPolicy getDeactivationPolicy() {
            return deactivationPolicy;
        }

        public void setDeactivationPolicy(DeactivationPolicy deactivationPolicy) {
            this.deactivationPolicy = deactivationPolicy;
        }
    }

    /**
     * Admin deactivation policy.
     */
    public static class DeactivationPolicy {
        private int requiredApprovals = 2;
        private boolean notifyAllAdmins = true;
        private boolean requireReason = true;
        private int cooldownPeriodMinutes = 60;

        public int getRequiredApprovals() {
            return requiredApprovals;
        }

        public void setRequiredApprovals(int requiredApprovals) {
            this.requiredApprovals = requiredApprovals;
        }

        public boolean isNotifyAllAdmins() {
            return notifyAllAdmins;
        }

        public void setNotifyAllAdmins(boolean notifyAllAdmins) {
            this.notifyAllAdmins = notifyAllAdmins;
        }

        public boolean isRequireReason() {
            return requireReason;
        }

        public void setRequireReason(boolean requireReason) {
            this.requireReason = requireReason;
        }

        public int getCooldownPeriodMinutes() {
            return cooldownPeriodMinutes;
        }

        public void setCooldownPeriodMinutes(int cooldownPeriodMinutes) {
            this.cooldownPeriodMinutes = cooldownPeriodMinutes;
        }
    }

    /**
     * Key rotation configuration.
     */
    public static class KeyRotation {
        private boolean enabled = true;
        private String cron = "0 0 */4 * * ?"; // Every 4 hours

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public String getCron() {
            return cron;
        }

        public void setCron(String cron) {
            this.cron = cron;
        }
    }

    /**
     * Failed attempts configuration.
     */
    public static class FailedAttempts {
        private int max = 3;
        private int lockoutMinutes = 60;

        public int getMax() {
            return max;
        }

        public void setMax(int max) {
            this.max = max;
        }

        public int getLockoutMinutes() {
            return lockoutMinutes;
        }

        public void setLockoutMinutes(int lockoutMinutes) {
            this.lockoutMinutes = lockoutMinutes;
        }
    }

    /**
     * Session configuration.
     */
    public static class Session {
        private int maxConcurrent = 1;
        private int timeoutMinutes = 15;

        public int getMaxConcurrent() {
            return maxConcurrent;
        }

        public void setMaxConcurrent(int maxConcurrent) {
            this.maxConcurrent = maxConcurrent;
        }

        public int getTimeoutMinutes() {
            return timeoutMinutes;
        }

        public void setTimeoutMinutes(int timeoutMinutes) {
            this.timeoutMinutes = timeoutMinutes;
        }
    }

    /**
     * IP whitelist configuration.
     */
    public static class IpWhitelist {
        private boolean enabled = true;
        private List<String> addresses;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public List<String> getAddresses() {
            return addresses;
        }

        public void setAddresses(List<String> addresses) {
            this.addresses = addresses;
        }
    }

    /**
     * Biometric configuration.
     */
    public static class Biometric {
        private Verification verification = new Verification();
        private Storage storage = new Storage();
        private LivenessDetection livenessDetection = new LivenessDetection();
        private boolean multiFactorRequired = true;

        public Verification getVerification() {
            return verification;
        }

        public void setVerification(Verification verification) {
            this.verification = verification;
        }

        public Storage getStorage() {
            return storage;
        }

        public void setStorage(Storage storage) {
            this.storage = storage;
        }

        public LivenessDetection getLivenessDetection() {
            return livenessDetection;
        }

        public void setLivenessDetection(LivenessDetection livenessDetection) {
            this.livenessDetection = livenessDetection;
        }

        public boolean isMultiFactorRequired() {
            return multiFactorRequired;
        }

        public void setMultiFactorRequired(boolean multiFactorRequired) {
            this.multiFactorRequired = multiFactorRequired;
        }
    }

    /**
     * Biometric verification configuration.
     */
    public static class Verification {
        private int timeoutSeconds = 20;
        private double matchThreshold = 0.92;

        public int getTimeoutSeconds() {
            return timeoutSeconds;
        }

        public void setTimeoutSeconds(int timeoutSeconds) {
            this.timeoutSeconds = timeoutSeconds;
        }

        public double getMatchThreshold() {
            return matchThreshold;
        }

        public void setMatchThreshold(double matchThreshold) {
            this.matchThreshold = matchThreshold;
        }
    }

    /**
     * Biometric storage configuration.
     */
    public static class Storage {
        private boolean encryptionEnabled = true;
        private String encryptionAlgorithm = "AES-256-GCM";

        public boolean isEncryptionEnabled() {
            return encryptionEnabled;
        }

        public void setEncryptionEnabled(boolean encryptionEnabled) {
            this.encryptionEnabled = encryptionEnabled;
        }

        public String getEncryptionAlgorithm() {
            return encryptionAlgorithm;
        }

        public void setEncryptionAlgorithm(String encryptionAlgorithm) {
            this.encryptionAlgorithm = encryptionAlgorithm;
        }
    }

    /**
     * Biometric liveness detection configuration.
     */
    public static class LivenessDetection {
        private boolean required = true;
        private double confidenceThreshold = 0.95;

        public boolean isRequired() {
            return required;
        }

        public void setRequired(boolean required) {
            this.required = required;
        }

        public double getConfidenceThreshold() {
            return confidenceThreshold;
        }

        public void setConfidenceThreshold(double confidenceThreshold) {
            this.confidenceThreshold = confidenceThreshold;
        }
    }

    /**
     * Audit configuration.
     */
    public static class Audit {
        private boolean enabled = true;
        private int retentionDays = 3650; // 10 years
        private List<String> sensitiveActions;
        private boolean realTimeMonitoring = true;
        private boolean immutableStorage = true;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public int getRetentionDays() {
            return retentionDays;
        }

        public void setRetentionDays(int retentionDays) {
            this.retentionDays = retentionDays;
        }

        public List<String> getSensitiveActions() {
            return sensitiveActions;
        }

        public void setSensitiveActions(List<String> sensitiveActions) {
            this.sensitiveActions = sensitiveActions;
        }

        public boolean isRealTimeMonitoring() {
            return realTimeMonitoring;
        }

        public void setRealTimeMonitoring(boolean realTimeMonitoring) {
            this.realTimeMonitoring = realTimeMonitoring;
        }

        public boolean isImmutableStorage() {
            return immutableStorage;
        }

        public void setImmutableStorage(boolean immutableStorage) {
            this.immutableStorage = immutableStorage;
        }
    }

    /**
     * Alerts configuration.
     */
    public static class Alerts {
        private String email;
        private String sms;
        private boolean pushNotification = true;
        private String emergencyContact;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getSms() {
            return sms;
        }

        public void setSms(String sms) {
            this.sms = sms;
        }

        public boolean isPushNotification() {
            return pushNotification;
        }

        public void setPushNotification(boolean pushNotification) {
            this.pushNotification = pushNotification;
        }

        public String getEmergencyContact() {
            return emergencyContact;
        }

        public void setEmergencyContact(String emergencyContact) {
            this.emergencyContact = emergencyContact;
        }
    }

    /**
     * Emergency access configuration.
     */
    public static class EmergencyAccess {
        private boolean enabled = true;
        private List<String> triggerEvents;
        private int requiredApprovals = 2;
        private boolean notifyAllAdmins = true;
        private int accessDurationMinutes = 60;
        private boolean requireReason = true;

        public boolean isEnabled() {
            return enabled;
        }

        public void setEnabled(boolean enabled) {
            this.enabled = enabled;
        }

        public List<String> getTriggerEvents() {
            return triggerEvents;
        }

        public void setTriggerEvents(List<String> triggerEvents) {
            this.triggerEvents = triggerEvents;
        }

        public int getRequiredApprovals() {
            return requiredApprovals;
        }

        public void setRequiredApprovals(int requiredApprovals) {
            this.requiredApprovals = requiredApprovals;
        }

        public boolean isNotifyAllAdmins() {
            return notifyAllAdmins;
        }

        public void setNotifyAllAdmins(boolean notifyAllAdmins) {
            this.notifyAllAdmins = notifyAllAdmins;
        }

        public int getAccessDurationMinutes() {
            return accessDurationMinutes;
        }

        public void setAccessDurationMinutes(int accessDurationMinutes) {
            this.accessDurationMinutes = accessDurationMinutes;
        }

        public boolean isRequireReason() {
            return requireReason;
        }

        public void setRequireReason(boolean requireReason) {
            this.requireReason = requireReason;
        }
    }
}