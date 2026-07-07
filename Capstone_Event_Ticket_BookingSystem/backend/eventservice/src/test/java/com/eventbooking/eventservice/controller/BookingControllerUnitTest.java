package com.eventbooking.eventservice.controller;

import com.eventbooking.eventservice.dto.BookingRequest;
import com.eventbooking.eventservice.entity.Booking;
import com.eventbooking.eventservice.service.BookingService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.security.Principal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingControllerUnitTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingController bookingController;

    @Test
    void createBookingShouldReturnBadRequestOnRuntimeException() {
        Principal principal = () -> "user@gmail.com";
        BookingRequest request = new BookingRequest();
        doThrow(new RuntimeException("failed")).when(bookingService).processBooking(request, "user@gmail.com");

        var response = bookingController.createBooking(request, principal);
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getBookingsForEventShouldReturnInternalServerErrorOnException() {
        when(bookingService.getBookingsForEvent(1L)).thenThrow(new RuntimeException("error"));
        var response = bookingController.getBookingsForEvent(1L);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getMyBookingsShouldReturnOk() {
        Principal principal = () -> "user@gmail.com";
        when(bookingService.getMyBookings("user@gmail.com")).thenReturn(List.of(new Booking()));
        var response = bookingController.getMyBookings(principal);
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void cancelBookingShouldHandleBothSuccessAndFailure() {
        Principal principal = () -> "user@gmail.com";
        doNothing().when(bookingService).cancelBooking(2L, "user@gmail.com");
        assertEquals(HttpStatus.OK, bookingController.cancelBooking(2L, principal).getStatusCode());

        doThrow(new RuntimeException("cannot")).when(bookingService).cancelBooking(3L, "user@gmail.com");
        assertEquals(HttpStatus.BAD_REQUEST, bookingController.cancelBooking(3L, principal).getStatusCode());
    }
}
