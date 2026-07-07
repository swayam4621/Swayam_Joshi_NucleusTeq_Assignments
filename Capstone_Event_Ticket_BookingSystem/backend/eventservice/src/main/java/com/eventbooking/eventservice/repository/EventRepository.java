package com.eventbooking.eventservice.repository;

import com.eventbooking.eventservice.entity.Event;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

        List<Event> findByStatus(Event.EventStatus status);

    //this gets all events 
    List<Event> findByOrganizerEmail(String organizerEmail);
    //Upcoming
    List<Event> findByOrganizerEmailAndStatusAndEventDateTimeAfterOrderByEventDateTimeAsc(
            String organizerEmail, Event.EventStatus status, LocalDateTime now);
    //Past
    List<Event> findByOrganizerEmailAndStatusAndEventDateTimeBeforeOrderByEventDateTimeDesc(
            String organizerEmail, Event.EventStatus status, LocalDateTime now);
    //Cancelled
    List<Event> findByOrganizerEmailAndStatusOrderByEventDateTimeDesc(
            String organizerEmail, Event.EventStatus status);
    
    //Customer view upcoming events
    List<Event> findByStatusAndEventDateTimeAfterOrderByEventDateTimeAsc(
            Event.EventStatus status, LocalDateTime now);

    //Customer view past events
    List<Event> findByStatusAndEventDateTimeBeforeOrderByEventDateTimeDesc(
            Event.EventStatus status, LocalDateTime now);

    //Events with artists for public display
    List<Event> findByStatusAndEventDateTimeAfterAndArtistNameIsNotNullAndArtistNameNotOrderByEventDateTimeAsc(
            Event.EventStatus status, LocalDateTime now, String empty);
}
