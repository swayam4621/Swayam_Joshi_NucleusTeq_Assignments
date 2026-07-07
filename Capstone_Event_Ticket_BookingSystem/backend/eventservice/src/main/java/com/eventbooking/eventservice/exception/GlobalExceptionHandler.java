package com.eventbooking.eventservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import com.eventbooking.eventservice.exception.EventNotFoundException;
import com.eventbooking.eventservice.exception.UnauthorizedAccessException; 
import com.eventbooking.eventservice.exception.InsufficientSeatsException;
import com.eventbooking.eventservice.exception.BookingCancellationDeadlineException;
import com.eventbooking.eventservice.exception.PastEventCreationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleAllUncaughtExceptions(Exception ex) {
        logger.error("An unexpected error occurred in the system: ", ex);
        
        Map<String, String> response = new HashMap<>();
        response.put("error", "An internal error occurred. Please try again later.");
        
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequests(IllegalArgumentException ex) {
        logger.warn("Invalid input received: {}", ex.getMessage());
        
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    @ExceptionHandler(EventNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleEventNotFound(EventNotFoundException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        //returns 404 Not Found
        logger.warn("Event not found: {}", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND); 
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<Map<String, String>> handleUnauthorizedAccess(UnauthorizedAccessException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        //returns 403 Forbidden
        logger.warn("Unauthorized access attempt: {}", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.FORBIDDEN); 
    }

    @ExceptionHandler(InsufficientSeatsException.class)
    public ResponseEntity<Map<String, String>> handleInsufficientSeats(InsufficientSeatsException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        //returns 400 Bad Request
        logger.warn("Insufficient seats: {}", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(BookingCancellationDeadlineException.class)
    public ResponseEntity<Map<String, String>> handleBookingCancellationDeadline(BookingCancellationDeadlineException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        //returns 400 Bad Request
        logger.warn("Booking cancellation deadline exceeded: {}", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }   

    @ExceptionHandler(PastEventCreationException.class)
    public ResponseEntity<Map<String, String>> handlePastEventCreation(PastEventCreationException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        //returns 400 Bad Request
        logger.warn("Past event creation attempted: {}", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(EventUpdateDeadlineException.class)
    public ResponseEntity<Map<String, String>> handleEventUpdateDeadline(EventUpdateDeadlineException ex) {
        Map<String, String> response = new HashMap<>();
        response.put("error", ex.getMessage());
        //returns 400 Bad Request
        logger.warn("Event update deadline exceeded: {}", ex.getMessage());
        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}