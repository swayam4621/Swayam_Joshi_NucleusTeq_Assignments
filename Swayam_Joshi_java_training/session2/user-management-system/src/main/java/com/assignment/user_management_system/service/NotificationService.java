package com.assignment.user_management_system.service;

import com.assignment.user_management_system.component.NotificationComponent;
import org.springframework.stereotype.Service;


@Service
public class NotificationService {

    private final NotificationComponent notificationComponent;

    public NotificationService(NotificationComponent notificationComponent) {
        this.notificationComponent = notificationComponent;
    }

    // Task: Service calls a NotificationComponent
    public String sendSystemNotification() {
        return notificationComponent.send();
    }
}
