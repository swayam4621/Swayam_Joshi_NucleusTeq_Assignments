package com.eventbooking.eventservice.service;

import com.eventbooking.eventservice.dto.EventRequest;
import com.eventbooking.eventservice.entity.Event;
import com.eventbooking.eventservice.exception.EventNotFoundException;
import com.eventbooking.eventservice.exception.PastEventCreationException;
import com.eventbooking.eventservice.exception.UnauthorizedAccessException;
import com.eventbooking.eventservice.repository.EventRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @InjectMocks
    private EventService eventService;

    private EventRequest validRequest;
    private Event existingEvent;
    private final String ORGANIZER_EMAIL = "organizer@gmail.com";

    @BeforeEach
    void setUp() {
        validRequest = new EventRequest();
        validRequest.setTitle("Test Event");
        validRequest.setDescription("Description");
        validRequest.setEventDate(LocalDateTime.now().plusDays(5)); 
        validRequest.setLocation("Stadium");
        validRequest.setPrice(100.0);
        validRequest.setTotalTickets(500);
        validRequest.setImageUrl("url");
        validRequest.setArtistName("Artist");
        validRequest.setCategory("Music");

        existingEvent = new Event();
        existingEvent.setId(1L);
        existingEvent.setName("Old Event");
        existingEvent.setEventDateTime(LocalDateTime.now().plusDays(5));
        existingEvent.setOrganizerEmail(ORGANIZER_EMAIL);
        existingEvent.setStatus(Event.EventStatus.ACTIVE);
    }

    @Test
    void testCreateEvent_Success() {
        when(eventRepository.save(any(Event.class))).thenAnswer(i -> i.getArguments()[0]);

        Event result = eventService.createEvent(validRequest, ORGANIZER_EMAIL);

        assertNotNull(result);
        assertEquals("Test Event", result.getName());
        assertEquals(ORGANIZER_EMAIL, result.getOrganizerEmail());
        verify(eventRepository, times(1)).save(any(Event.class));
    }

    @Test
    void testCreateEvent_PastDate_ThrowsException() {
        validRequest.setEventDate(LocalDateTime.now().minusDays(1));

        assertThrows(PastEventCreationException.class, () -> 
            eventService.createEvent(validRequest, ORGANIZER_EMAIL)
        );
        verify(eventRepository, never()).save(any());
    }


    @Test
    void testUpdateEvent_Success() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existingEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(i -> i.getArguments()[0]);

        Event result = eventService.updateEvent(1L, validRequest, ORGANIZER_EMAIL);

        assertEquals("Test Event", result.getName()); 
        verify(eventRepository, times(1)).save(existingEvent);
    }

    @Test
    void testUpdateEvent_NotFound_ThrowsException() {
        when(eventRepository.findById(1L)).thenReturn(Optional.empty());

        assertThrows(EventNotFoundException.class, () -> 
            eventService.updateEvent(1L, validRequest, ORGANIZER_EMAIL)
        );
    }

    @Test
    void testUpdateEvent_PastDate_ThrowsException() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existingEvent));
        validRequest.setEventDate(LocalDateTime.now().minusDays(1));

        assertThrows(PastEventCreationException.class, () -> 
            eventService.updateEvent(1L, validRequest, ORGANIZER_EMAIL)
        );
    }

    @Test
    void testUpdateEvent_Unauthorized_ThrowsException() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existingEvent));

        assertThrows(UnauthorizedAccessException.class, () -> 
            eventService.updateEvent(1L, validRequest, "hacker@gmail.com")
        );
    }

    @Test
    void testGetEventsByOrganizer_Upcoming() {
        eventService.getEventsByOrganizer(ORGANIZER_EMAIL, "upcoming");
        verify(eventRepository).findByOrganizerEmailAndStatusAndEventDateTimeAfterOrderByEventDateTimeAsc(
                eq(ORGANIZER_EMAIL), eq(Event.EventStatus.ACTIVE), any(LocalDateTime.class));
    }

    @Test
    void testGetEventsByOrganizer_Past() {
        eventService.getEventsByOrganizer(ORGANIZER_EMAIL, "past");
        verify(eventRepository).findByOrganizerEmailAndStatusAndEventDateTimeBeforeOrderByEventDateTimeDesc(
                eq(ORGANIZER_EMAIL), eq(Event.EventStatus.ACTIVE), any(LocalDateTime.class));
    }

    @Test
    void testGetEventsByOrganizer_Cancelled() {
        eventService.getEventsByOrganizer(ORGANIZER_EMAIL, "cancelled");
        verify(eventRepository).findByOrganizerEmailAndStatusOrderByEventDateTimeDesc(
                eq(ORGANIZER_EMAIL), eq(Event.EventStatus.CANCELLED_BY_ORGANIZER));
    }

    @Test
    void testGetEventsByOrganizer_Fallback() {
        eventService.getEventsByOrganizer(ORGANIZER_EMAIL, "unknown");
        verify(eventRepository).findByOrganizerEmail(ORGANIZER_EMAIL);
    }

    @Test
    void testGetAllEvents_Upcoming() {
        eventService.getAllEvents("upcoming");
        verify(eventRepository).findByStatusAndEventDateTimeAfterOrderByEventDateTimeAsc(
                eq(Event.EventStatus.ACTIVE), any(LocalDateTime.class));
    }

    @Test
    void testGetAllEvents_Past() {
        eventService.getAllEvents("past");
        verify(eventRepository).findByStatusAndEventDateTimeBeforeOrderByEventDateTimeDesc(
                eq(Event.EventStatus.ACTIVE), any(LocalDateTime.class));
    }

    @Test
    void testGetAllEvents_Artists() {
        eventService.getAllEvents("artists");
        verify(eventRepository).findByStatusAndEventDateTimeAfterAndArtistNameIsNotNullAndArtistNameNotOrderByEventDateTimeAsc(
                eq(Event.EventStatus.ACTIVE), any(LocalDateTime.class), eq(""));
    }

    @Test
    void testGetAllEvents_Fallback() {
        eventService.getAllEvents("all");
        verify(eventRepository).findAll();
    }

    @Test
    void testGetEventById_Success() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existingEvent));
        Event result = eventService.getEventById(1L);
        assertEquals(existingEvent, result);
    }

    @Test
    void testGetEventById_NotFound() {
        when(eventRepository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(EventNotFoundException.class, () -> eventService.getEventById(1L));
    }

    @Test
    void testCancelEvent_Success() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existingEvent));
        when(eventRepository.save(any(Event.class))).thenAnswer(i -> i.getArguments()[0]);

        Event result = eventService.cancelEvent(1L, ORGANIZER_EMAIL);

        assertEquals(Event.EventStatus.CANCELLED_BY_ORGANIZER, result.getStatus());
    }

    @Test
    void testCancelEvent_Unauthorized() {
        when(eventRepository.findById(1L)).thenReturn(Optional.of(existingEvent));
        assertThrows(UnauthorizedAccessException.class, () -> eventService.cancelEvent(1L, "wrong@gmail.com"));
    }

    @Test
    void testSearchAndFilter_TimeframeToday() {
        existingEvent.setEventDateTime(LocalDateTime.now().plusHours(1)); 
        when(eventRepository.findByStatus(Event.EventStatus.ACTIVE)).thenReturn(Collections.singletonList(existingEvent));

        assertEquals(1, eventService.searchAndFilterActiveEvents(null, null, "Today").size());
        assertEquals(0, eventService.searchAndFilterActiveEvents(null, null, "Tomorrow").size());
    }

    @Test
    void testSearchAndFilter_TimeframeTomorrow() {
        existingEvent.setEventDateTime(LocalDateTime.now().plusDays(1)); 
        when(eventRepository.findByStatus(Event.EventStatus.ACTIVE)).thenReturn(Collections.singletonList(existingEvent));

        assertEquals(1, eventService.searchAndFilterActiveEvents(null, null, "Tomorrow").size());
        assertEquals(0, eventService.searchAndFilterActiveEvents(null, null, "Today").size());
    }

    @Test
    void testSearchAndFilter_TimeframeThisWeekend() {
        LocalDateTime nextSaturday = LocalDateTime.now();
        while (nextSaturday.getDayOfWeek() != DayOfWeek.SATURDAY) {
            nextSaturday = nextSaturday.plusDays(1);
        }
        
        existingEvent.setEventDateTime(nextSaturday);
        when(eventRepository.findByStatus(Event.EventStatus.ACTIVE)).thenReturn(Collections.singletonList(existingEvent));

        assertEquals(1, eventService.searchAndFilterActiveEvents(null, null, "This Weekend").size());
        
        LocalDateTime nextWednesday = LocalDateTime.now();
        while (nextWednesday.getDayOfWeek() != DayOfWeek.WEDNESDAY) {
            nextWednesday = nextWednesday.plusDays(1);
        }
        existingEvent.setEventDateTime(nextWednesday);
        assertEquals(0, eventService.searchAndFilterActiveEvents(null, null, "This Weekend").size());
    }
}