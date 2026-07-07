package com.eventbooking.userservice.security;

import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtUtilTest {

    @Test
    void shouldGenerateAndValidateToken() {
        JwtUtil jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secretKey", "this-is-a-long-secret-key-for-jwt-tests-123456");
        ReflectionTestUtils.setField(jwtUtil, "jwtExpiration", 60_000L);

        String token = jwtUtil.generateToken("user@gmail.com", "CUSTOMER");

        assertEquals("user@gmail.com", jwtUtil.extractEmail(token));
        assertEquals("CUSTOMER", jwtUtil.extractRole(token));
        assertTrue(jwtUtil.isTokenValid(token, "user@gmail.com"));
        assertFalse(jwtUtil.isTokenValid(token, "other@gmail.com"));
    }
}
