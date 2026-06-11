package com.eventbooking.eventservice.exception;

public class BookingCancellationDeadlineException extends RuntimeException {
    public BookingCancellationDeadlineException(String message) {
        super(message);
    }
}
