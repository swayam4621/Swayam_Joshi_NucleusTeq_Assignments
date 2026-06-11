package com.eventbooking.eventservice.service;

import com.eventbooking.eventservice.dto.BookingRequest;
import com.eventbooking.eventservice.entity.Booking;
import com.eventbooking.eventservice.entity.Event;
import com.eventbooking.eventservice.exception.BookingCancellationDeadlineException;
import com.eventbooking.eventservice.exception.EventNotFoundException;
import com.eventbooking.eventservice.exception.InsufficientSeatsException;
import com.eventbooking.eventservice.exception.UnauthorizedAccessException;
import com.eventbooking.eventservice.repository.BookingRepository;
import com.eventbooking.eventservice.repository.EventRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private BookingService bookingService;

    @Test
    void processBookingShouldThrowForMissingEvent() {
        BookingRequest request = request(1L, 2, 200);
        when(eventRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EventNotFoundException.class, () -> bookingService.processBooking(request, "user@gmail.com"));
    }

    @Test
    void processBookingShouldThrowWhenSeatsInsufficient() {
        Event event = new Event();
        event.setAvailableSeats(1);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        assertThrows(InsufficientSeatsException.class,
                () -> bookingService.processBooking(request(1L, 2, 200), "user@gmail.com"));
    }

    @Test
    void processBookingShouldSaveEventAndBooking() {
        Event event = new Event();
        event.setAvailableSeats(10);
        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));

        bookingService.processBooking(request(1L, 2, 200), "user@gmail.com");

        assertEquals(8, event.getAvailableSeats());
        verify(eventRepository).save(event);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void cancelBookingShouldRejectWrongUser() {
        Booking booking = new Booking();
        booking.setUserEmail("owner@gmail.com");
        when(bookingRepository.findById(3L)).thenReturn(Optional.of(booking));

        assertThrows(UnauthorizedAccessException.class, () -> bookingService.cancelBooking(3L, "other@gmail.com"));
    }

    @Test
    void cancelBookingShouldRejectLateCancellation() {
        Booking booking = new Booking();
        booking.setUserEmail("owner@gmail.com");
        booking.setStatus(Booking.Status.CONFIRMED);
        booking.setEventId(11L);
        when(bookingRepository.findById(3L)).thenReturn(Optional.of(booking));

        Event event = new Event();
        event.setEventDateTime(LocalDateTime.now().plusHours(2));
        when(eventRepository.findById(11L)).thenReturn(Optional.of(event));

        assertThrows(BookingCancellationDeadlineException.class, () -> bookingService.cancelBooking(3L, "owner@gmail.com"));
    }

    @Test
    void cancelBookingShouldRestoreSeatsAndMarkCancelled() {
        Booking booking = new Booking();
        booking.setUserEmail("owner@gmail.com");
        booking.setStatus(Booking.Status.CONFIRMED);
        booking.setEventId(11L);
        booking.setNumberOfTickets(3);
        when(bookingRepository.findById(3L)).thenReturn(Optional.of(booking));

        Event event = new Event();
        event.setEventDateTime(LocalDateTime.now().plusDays(1));
        event.setAvailableSeats(5);
        when(eventRepository.findById(11L)).thenReturn(Optional.of(event));

        bookingService.cancelBooking(3L, "owner@gmail.com");

        assertEquals(8, event.getAvailableSeats());
        assertEquals(Booking.Status.CANCELLED, booking.getStatus());
        verify(eventRepository).save(event);
        verify(bookingRepository).save(booking);
    }

    private BookingRequest request(Long eventId, int tickets, double amount) {
        BookingRequest request = new BookingRequest();
        request.setEventId(eventId);
        request.setNumberOfTickets(tickets);
        request.setTotalAmount(amount);
        return request;
    }
}
