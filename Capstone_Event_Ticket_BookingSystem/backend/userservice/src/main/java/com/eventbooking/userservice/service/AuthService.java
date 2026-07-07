package com.eventbooking.userservice.service;

import com.eventbooking.userservice.dto.AuthResponse;
import com.eventbooking.userservice.dto.LoginRequest;
import com.eventbooking.userservice.dto.RegisterRequest;
import com.eventbooking.userservice.entity.User;
import com.eventbooking.userservice.exception.InvalidCredentialsException;
import com.eventbooking.userservice.exception.UserAlreadyExistsException;
import com.eventbooking.userservice.repository.UserRepository;
import com.eventbooking.userservice.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AuthService {

    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Email is already registered: " + request.getEmail());
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());

        userRepository.save(user);
        logger.info("New user registered successfully: {}", user.getEmail());

        return new AuthResponse(null, user.getEmail(), user.getRole().name(), "Registration successful! Please login.");
    }

    public AuthResponse login(LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty() || !passwordEncoder.matches(request.getPassword(), userOpt.get().getPassword())) {
            logger.warn("Failed login attempt for email: {}", request.getEmail());
            throw new InvalidCredentialsException("Invalid email or password");
        }

        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        logger.info("User logged in successfully: {}", user.getEmail());

        return new AuthResponse(token, user.getEmail(), user.getRole().name(), "Login successful");
    }
}