package com.assignment.user_management_system.exception;

public class UserNotFoundException extends RuntimeException {
    
    // I've created this custom exception to provide business-specific error tracking
    public UserNotFoundException(String message) {
        super(message);
    }
}