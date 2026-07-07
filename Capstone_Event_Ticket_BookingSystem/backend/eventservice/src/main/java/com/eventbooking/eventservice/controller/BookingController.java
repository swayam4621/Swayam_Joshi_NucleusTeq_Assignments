package com.eventbooking.eventservice.controller;

import com.eventbooking.eventservice.dto.BookingRequest;
import com.eventbooking.eventservice.entity.Booking;
import com.eventbooking.eventservice.service.BookingService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "*")
public class BookingController {

    private final BookingService bookingService;

    // Only inject the Service layer
    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/create")
    public ResponseEntity<?> createBooking(@RequestBody BookingRequest request, java.security.Principal principal) {
        try {
            bookingService.processBooking(request, principal.getName());
            return ResponseEntity.ok().body("{\"message\": \"Booking successful!\"}");
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("{\"error\": \"" + e.getMessage() + "\"}");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"An unexpected error occurred\"}");
        }
    }

    @GetMapping("/event/{eventId}")
    public ResponseEntity<?> getBookingsForEvent(@PathVariable Long eventId) {
        try {
            List<Booking> attendees = bookingService.getBookingsForEvent(eventId);
            return ResponseEntity.ok(attendees);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Could not fetch attendees\"}");
        }
    }

    @GetMapping("/my-bookings")
    public ResponseEntity<?> getMyBookings(java.security.Principal principal) {
        try {
            List<Booking> myBookings = bookingService.getMyBookings(principal.getName());
            return ResponseEntity.ok(myBookings);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("{\"error\": \"Could not fetch bookings\"}");
        }
    }

    @DeleteMapping("/cancel/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId, java.security.Principal principal) {
        try {
            bookingService.cancelBooking(bookingId, principal.getName());
            return ResponseEntity.ok().body("{\"message\": \"Booking cancelled successfully\"}");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("{\"error\": \"" + e.getMessage() + "\"}");
        }
    }
}