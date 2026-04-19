package com.assignment.todo.client;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class NotificationServiceClient {

    private static final Logger log = LoggerFactory.getLogger(NotificationServiceClient.class);

    public void sendNotification(String message) {
        // Simulating a call to an external service like email or sms
        log.info("🔔 [EXTERNAL SERVICE SIMULATION] {}", message);
    }
}
