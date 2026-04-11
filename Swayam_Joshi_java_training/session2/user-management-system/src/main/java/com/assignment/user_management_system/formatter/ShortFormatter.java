package com.assignment.user_management_system.formatter;
import org.springframework.stereotype.Component;

@Component("SHORT")
public class ShortFormatter implements MessageFormatter {
    public String format(String name) { return "Hi, " + name; }
}