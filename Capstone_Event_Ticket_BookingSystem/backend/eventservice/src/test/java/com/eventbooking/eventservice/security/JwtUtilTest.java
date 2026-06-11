package com.eventbooking.eventservice.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtUtilTest {

    @Test
    void shouldExtractClaimsAndValidateToken() {
        JwtUtil jwtUtil = new JwtUtil();
        String secret = "event-service-jwt-secret-key-for-tests-123456";
        ReflectionTestUtils.setField(jwtUtil, "secretKey", secret);

        String token = Jwts.builder()
                .subject("organizer@gmail.com")
                .claim("role", "ORGANIZER")
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + 60_000))
                .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
                .compact();

        assertEquals("organizer@gmail.com", jwtUtil.extractEmail(token));
        assertEquals("ORGANIZER", jwtUtil.extractRole(token));
        assertTrue(jwtUtil.isTokenValid(token, "organizer@gmail.com"));
        assertFalse(jwtUtil.isTokenValid(token, "other@gmail.com"));
    }
}
