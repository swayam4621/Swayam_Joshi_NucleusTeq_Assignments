package com.eventbooking.userservice.service;

import com.eventbooking.userservice.dto.AuthResponse;
import com.eventbooking.userservice.dto.LoginRequest;
import com.eventbooking.userservice.dto.RegisterRequest;
import com.eventbooking.userservice.entity.User;
import com.eventbooking.userservice.exception.InvalidCredentialsException;
import com.eventbooking.userservice.exception.UserAlreadyExistsException;
import com.eventbooking.userservice.repository.UserRepository;
import com.eventbooking.userservice.security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerShouldThrowWhenEmailAlreadyExists() {
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@gmail.com");

        when(userRepository.existsByEmail("test@gmail.com")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> authService.register(request));
    }

    @Test
    void registerShouldSaveUserAndReturnResponse() {
        RegisterRequest request = new RegisterRequest();
        request.setName("Test User");
        request.setEmail("test@gmail.com");
        request.setPassword("Password@1");
        request.setPhone("9876543210");
        request.setRole(User.Role.CUSTOMER);

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encoded-password");

        AuthResponse response = authService.register(request);

        assertEquals("test@gmail.com", response.getEmail());
        assertEquals("CUSTOMER", response.getRole());
        assertEquals("Registration successful! Please login.", response.getMessage());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void loginShouldThrowForMissingUser() {
        LoginRequest request = new LoginRequest();
        request.setEmail("missing@gmail.com");
        request.setPassword("Password@1");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void loginShouldThrowForInvalidPassword() {
        User user = new User();
        user.setEmail("user@gmail.com");
        user.setPassword("stored");

        LoginRequest request = new LoginRequest();
        request.setEmail("user@gmail.com");
        request.setPassword("wrong");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrong", "stored")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> authService.login(request));
    }

    @Test
    void loginShouldReturnTokenForValidCredentials() {
        User user = new User();
        user.setEmail("user@gmail.com");
        user.setPassword("stored");
        user.setRole(User.Role.ORGANIZER);

        LoginRequest request = new LoginRequest();
        request.setEmail("user@gmail.com");
        request.setPassword("Password@1");

        when(userRepository.findByEmail(request.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("Password@1", "stored")).thenReturn(true);
        when(jwtUtil.generateToken("user@gmail.com", "ORGANIZER")).thenReturn("jwt-token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("ORGANIZER", response.getRole());
        assertEquals("Login successful", response.getMessage());
    }
}
