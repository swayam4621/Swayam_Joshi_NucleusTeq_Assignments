package com.eventbooking.eventservice.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void shouldMapEventNotFoundTo404() {
        ResponseEntity<Map<String, String>> response =
                handler.handleEventNotFound(new EventNotFoundException("missing"));

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("missing", response.getBody().get("error"));
    }

    @Test
    void shouldMapUnauthorizedTo403() {
        ResponseEntity<Map<String, String>> response =
                handler.handleUnauthorizedAccess(new UnauthorizedAccessException("denied"));

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertEquals("denied", response.getBody().get("error"));
    }
}
