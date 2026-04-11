package com.assignment.user_management_system.controller;

import com.assignment.user_management_system.model.User;
import com.assignment.user_management_system.service.UserService;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<User> getAll() { return userService.getAllUsers(); }

    @PostMapping
    public String create(@RequestBody User user) {
        return userService.addUser(user);
    }

    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return userService.getUser(id);
    }

    // Required "Twist" API: /users/message/1?type=SHORT
    @GetMapping("/message/{id}")
    public Map<String, String> getWelcomeMessage(@PathVariable Long id, @RequestParam String type) {
        return Map.of("message", userService.getFormattedWelcome(id, type));
    }
}