package com.eventbooking.eventservice.repository;

import com.eventbooking.eventservice.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {

    // For showing a customer all the tickets they have bought
    List<Booking> findByUserEmail(String userEmail);

    // For showing an organizer all the bookings for their events
    List<Booking> findByEventId(Long eventId);
}