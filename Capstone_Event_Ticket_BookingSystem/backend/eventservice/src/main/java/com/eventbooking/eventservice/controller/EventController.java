package com.eventbooking.eventservice.controller;

import com.eventbooking.eventservice.dto.EventRequest;
import com.eventbooking.eventservice.entity.Event;
import com.eventbooking.eventservice.service.EventService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

//use principal to automatically grab the user's email from the JWT token that Spring Security intercepted
import java.security.Principal;

@RestController
@RequestMapping("/api/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @PostMapping("/create")
    // principal.getName() extracts the email from the JWT token and passes it to
    // the service layer for event creation
    public ResponseEntity<Event> createEvent(@RequestBody EventRequest request, Principal principal) {
        Event createdEvent = eventService.createEvent(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    @PutMapping("/update/{id}")
    public ResponseEntity<Event> updateEvent(@PathVariable Long id, @RequestBody EventRequest request,
            Principal principal) {
        Event updatedEvent = eventService.updateEvent(id, request, principal.getName());
        return ResponseEntity.ok(updatedEvent);
    }

    // @RequestParam for the filter
    @GetMapping("/my-events")
    public ResponseEntity<List<Event>> getMyEvents(
            @RequestParam(required = false, defaultValue = "all") String filter,
            Principal principal) {
        List<Event> myEvents = eventService.getEventsByOrganizer(principal.getName(), filter);
        return ResponseEntity.ok(myEvents);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Event> getEventById(@PathVariable Long id) {
        Event event = eventService.getEventById(id);
        return ResponseEntity.ok(event);
    }

    @PutMapping("/cancel/{id}")
    public ResponseEntity<Event> cancelEvent(@PathVariable Long id, Principal principal) {
        Event cancelledEvent = eventService.cancelEvent(id, principal.getName());
        return ResponseEntity.ok(cancelledEvent);
    }

    // New endpoint to get all events for attendees to see
    @GetMapping
    public ResponseEntity<List<Event>> getAllEvents(
            @RequestParam(required = false, defaultValue = "upcoming") String filter) {
        List<Event> events = eventService.getAllEvents(filter);
        return ResponseEntity.ok(events);
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchEvents(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String timeframe) {
        try {
            List<Event> filteredEvents = eventService.searchAndFilterActiveEvents(keyword, category, timeframe);
            return ResponseEntity.ok(filteredEvents);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("{\"error\": \"Search failed\"}");
        }
    }
}
