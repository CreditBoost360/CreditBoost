package com.creditboost.security.config;

/**
 * Exception thrown when there is an issue with the security configuration.
 */
public class SecurityConfigurationException extends RuntimeException {

    /**
     * Constructs a new security configuration exception with the specified detail message.
     * 
     * @param message the detail message
     */
    public SecurityConfigurationException(String message) {
        super(message);
    }

    /**
     * Constructs a new security configuration exception with the specified detail message and cause.
     * 
     * @param message the detail message
     * @param cause the cause
     */
    public SecurityConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
}