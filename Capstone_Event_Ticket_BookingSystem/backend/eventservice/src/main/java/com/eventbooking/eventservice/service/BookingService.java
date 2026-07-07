package com.eventbooking.eventservice.service;

import com.eventbooking.eventservice.dto.BookingRequest;
import com.eventbooking.eventservice.entity.Booking;
import com.eventbooking.eventservice.entity.Event;
import com.eventbooking.eventservice.repository.BookingRepository;
import com.eventbooking.eventservice.repository.EventRepository;
import com.eventbooking.eventservice.exception.EventNotFoundException;
import com.eventbooking.eventservice.exception.InsufficientSeatsException;
import com.eventbooking.eventservice.exception.UnauthorizedAccessException;
import com.eventbooking.eventservice.exception.BookingCancellationDeadlineException;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private static final Logger logger = LoggerFactory.getLogger(BookingService.class);

    public BookingService(BookingRepository bookingRepository, EventRepository eventRepository) {
        this.bookingRepository = bookingRepository;
        this.eventRepository = eventRepository;
    }

    // Booking service function
    @Transactional
    public void processBooking(BookingRequest request, String userEmail) {
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new EventNotFoundException(
                        "Event with ID " + request.getEventId() + " could not be found."));

        if (event.getAvailableSeats() < request.getNumberOfTickets()) {
            throw new InsufficientSeatsException("Not enough seats available");
        }

        event.setAvailableSeats(event.getAvailableSeats() - request.getNumberOfTickets());
        eventRepository.save(event);

        Booking booking = new Booking();
        booking.setEventId(request.getEventId());
        booking.setUserEmail(userEmail);
        booking.setNumberOfTickets(request.getNumberOfTickets());
        booking.setTotalAmount(request.getTotalAmount());
        booking.setStatus(Booking.Status.CONFIRMED);
        booking.setBookingDate(LocalDateTime.now());

        bookingRepository.save(booking);
        logger.info("Booking Processed Successfully: BookingID={}, EventID={}, UserEmail={}, Tickets={}", 
                    booking.getId(), request.getEventId(), userEmail, request.getNumberOfTickets());
    }

    public List<Booking> getBookingsForEvent(Long eventId) {
        return bookingRepository.findByEventId(eventId);
    }

    public List<Booking> getMyBookings(String email) {
        return bookingRepository.findByUserEmail(email);
    }

    // Cancel booking function having 3 hr check and other checks
    @Transactional
    public void cancelBooking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (!booking.getUserEmail().equals(userEmail)) {
            throw new UnauthorizedAccessException("You are not authorized to cancel this booking");
        }
        if (booking.getStatus() == Booking.Status.CANCELLED) {
            throw new RuntimeException("Booking is already cancelled.");
        }
        Event event = eventRepository.findById(booking.getEventId())
                .orElseThrow(() -> new EventNotFoundException("Event not found"));

        LocalDateTime cancellationDeadline = event.getEventDateTime().minusHours(3);
        if (LocalDateTime.now().isAfter(cancellationDeadline)) {
            throw new BookingCancellationDeadlineException(
                    "Tickets cannot be cancelled within 3 hours of the event start time.");
        }

        event.setAvailableSeats(event.getAvailableSeats() + booking.getNumberOfTickets());
        eventRepository.save(event);
        booking.setStatus(Booking.Status.CANCELLED);
        bookingRepository.save(booking);

        logger.info("Booking Cancelled Successfully: BookingID={}, EventID={}, UserEmail={}, Tickets={}", 
                    booking.getId(), booking.getEventId(), userEmail, booking.getNumberOfTickets());
    }
}