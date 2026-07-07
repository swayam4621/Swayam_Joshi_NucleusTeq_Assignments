package com.eventbooking.eventservice.controller;

import com.eventbooking.eventservice.dto.EventRequest;
import com.eventbooking.eventservice.entity.Event;
import com.eventbooking.eventservice.service.EventService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;

import java.security.Principal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventControllerUnitTest {

    @Mock
    private EventService eventService;

    @InjectMocks
    private EventController eventController;

    @Test
    void searchEventsShouldReturn500OnServiceError() {
        when(eventService.searchAndFilterActiveEvents("x", null, null)).thenThrow(new RuntimeException("oops"));

        var response = eventController.searchEvents("x", null, null);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
    }

    @Test
    void getAllEventsShouldReturnOk() {
        when(eventService.getAllEvents("upcoming")).thenReturn(List.of(new Event()));
        var response = eventController.getAllEvents("upcoming");
        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void createUpdateCancelShouldReturnExpectedStatusCodes() {
        Principal principal = () -> "org@gmail.com";
        Event event = new Event();
        when(eventService.createEvent(org.mockito.ArgumentMatchers.any(EventRequest.class), org.mockito.ArgumentMatchers.eq("org@gmail.com")))
                .thenReturn(event);
        when(eventService.updateEvent(org.mockito.ArgumentMatchers.eq(1L), org.mockito.ArgumentMatchers.any(EventRequest.class), org.mockito.ArgumentMatchers.eq("org@gmail.com")))
                .thenReturn(event);
        when(eventService.cancelEvent(1L, "org@gmail.com")).thenReturn(event);

        assertEquals(HttpStatus.CREATED, eventController.createEvent(new EventRequest(), principal).getStatusCode());
        assertEquals(HttpStatus.OK, eventController.updateEvent(1L, new EventRequest(), principal).getStatusCode());
        assertEquals(HttpStatus.OK, eventController.cancelEvent(1L, principal).getStatusCode());
    }
}
