package com.eventbooking.eventservice.controller;

import com.eventbooking.eventservice.dto.BookingRequest;
import com.eventbooking.eventservice.security.JwtUtil;
import com.eventbooking.eventservice.service.BookingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.doThrow;
import static org.springframework.http.MediaType.APPLICATION_JSON;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = BookingController.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    @WithMockUser(username = "user@gmail.com", authorities = {"ROLE_CUSTOMER"})
    void createBookingShouldReturnOkOnSuccess() throws Exception {
        BookingRequest request = new BookingRequest();
        request.setEventId(1L);
        request.setNumberOfTickets(2);
        request.setTotalAmount(200);
        doNothing().when(bookingService).processBooking(any(BookingRequest.class), eq("user@gmail.com"));

        mockMvc.perform(post("/api/bookings/create")
                        .with(csrf())
                        .contentType(APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@gmail.com", authorities = {"ROLE_CUSTOMER"})
    void cancelBookingShouldReturnBadRequestOnServiceError() throws Exception {
        doThrow(new RuntimeException("failed")).when(bookingService).cancelBooking(4L, "user@gmail.com");

        mockMvc.perform(delete("/api/bookings/cancel/4").with(csrf()))
                .andExpect(status().isBadRequest());
    }
}
