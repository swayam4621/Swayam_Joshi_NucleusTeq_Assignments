package com.eventbooking.eventservice.exception;

public class PastEventCreationException extends RuntimeException {
    public PastEventCreationException(String message) {
        super(message);
    }
}
