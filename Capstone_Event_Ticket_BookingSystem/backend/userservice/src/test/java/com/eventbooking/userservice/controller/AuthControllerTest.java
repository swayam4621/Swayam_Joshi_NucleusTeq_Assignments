package com.eventbooking.userservice.controller;

import com.eventbooking.userservice.dto.AuthResponse;
import com.eventbooking.userservice.dto.LoginRequest;
import com.eventbooking.userservice.dto.RegisterRequest;
import com.eventbooking.userservice.service.AuthService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @Test
    void registerShouldReturnCreated() {
        RegisterRequest request = new RegisterRequest();
        AuthResponse authResponse = new AuthResponse(null, "user@gmail.com", "CUSTOMER", "ok");
        when(authService.register(request)).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.register(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals("user@gmail.com", response.getBody().getEmail());
    }

    @Test
    void loginShouldReturnOk() {
        LoginRequest request = new LoginRequest();
        AuthResponse authResponse = new AuthResponse("token", "user@gmail.com", "ORGANIZER", "ok");
        when(authService.login(request)).thenReturn(authResponse);

        ResponseEntity<AuthResponse> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("token", response.getBody().getToken());
    }
}
