package com.eventbooking.eventservice.controller;

import com.eventbooking.eventservice.dto.EventRequest;
import com.eventbooking.eventservice.entity.Event;
import com.eventbooking.eventservice.security.JwtUtil;
import com.eventbooking.eventservice.service.EventService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(EventController.class)
class EventControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private EventService eventService;

    @MockBean
    private JwtUtil jwtUtil;

    @Test
    @WithMockUser(authorities = {"ROLE_CUSTOMER"})
    void searchEventsReturnsFilteredData() throws Exception {
        Event e1 = new Event();
        e1.setName("Rock Show");

        when(eventService.searchAndFilterActiveEvents("Rock", null, null))
                .thenReturn(List.of(e1));

        mockMvc.perform(get("/api/events/search").param("keyword", "Rock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Rock Show"));
    }

    @Test
    void createEventWithoutAuthReturnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/events/create")
                .with(csrf())
                .contentType("application/json")
                .content("{\"name\": \"Sneaky Event\"}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "org@gmail.com", authorities = {"ROLE_ORGANIZER"})
    void createEventWithOrganizerReturnsCreated() throws Exception {
        EventRequest request = new EventRequest();
        request.setTitle("Rock Show");
        request.setDescription("Desc");
        request.setEventDate(LocalDateTime.now().plusDays(3));
        request.setLocation("Arena");
        request.setPrice(100);
        request.setTotalTickets(100);

        Event response = new Event();
        response.setName("Rock Show");
        when(eventService.createEvent(any(EventRequest.class), eq("org@gmail.com"))).thenReturn(response);

        mockMvc.perform(post("/api/events/create")
                        .with(csrf())
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Rock Show"));
    }
}