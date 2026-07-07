package com.eventbooking.userservice.exception;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void shouldHandleUserAlreadyExists() {
        ResponseEntity<Map<String, String>> response =
                handler.handleUserAlreadyExists(new UserAlreadyExistsException("exists"));

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("exists", response.getBody().get("error"));
    }

    @Test
    void shouldHandleInvalidCredentials() {
        ResponseEntity<Map<String, String>> response =
                handler.handleInvalidCredentials(new InvalidCredentialsException("invalid"));

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
        assertEquals("invalid", response.getBody().get("error"));
    }

    @Test
    void shouldHandleGenericException() {
        ResponseEntity<Map<String, String>> response =
                handler.handleGenericException(new RuntimeException("oops"));

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("An unexpected server error occurred. Please try again later.", response.getBody().get("error"));
    }

    @Test
    void shouldHandleValidationErrors() {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "request");
        bindingResult.addError(new FieldError("request", "email", "Email is required"));
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<Map<String, String>> response = handler.handleValidationExceptions(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Email is required", response.getBody().get("email"));
    }
}
