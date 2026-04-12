package com.assignment.user_management_system.service;

import com.assignment.user_management_system.formatter.MessageFormatter;
import org.springframework.stereotype.Service;
import java.util.Map;

@Service
public class MessageService {

    private final Map<String, MessageFormatter> formatters;

    public MessageService(Map<String, MessageFormatter> formatters) {
        this.formatters = formatters;
    }

    public String formatMessage(String type, String name) {
        
        // Decision logic
        MessageFormatter formatter = formatters.get(type.toUpperCase());

        if (formatter == null) {
            throw new IllegalArgumentException("Invalid format type: " + type);
        }

        return formatter.format(name);
    }
}