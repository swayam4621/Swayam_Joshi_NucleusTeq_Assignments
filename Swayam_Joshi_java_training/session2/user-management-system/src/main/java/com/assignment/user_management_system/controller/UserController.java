package com.assignment.user_management_system.controller;

import com.assignment.user_management_system.model.User;
import com.assignment.user_management_system.service.UserService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/users")
public class UserController {
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    //get all users
    @GetMapping
    public List<User> getAll() { return userService.getAllUsers(); }

    @PostMapping
    public String create(@RequestBody User user) {
        return userService.addUser(user);
    }

    //get user by id
    @GetMapping("/{id}")
    public User getById(@PathVariable Long id) {
        return userService.getUser(id);
    }

    @GetMapping("/message/{id}")
    public Map<String, String> getWelcomeMessage(@PathVariable Long id, @RequestParam String type) {
        return Map.of("message", userService.getFormattedWelcome(id, type));
    }

    //update user
    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User userDetails) {
        return ResponseEntity.ok(userService.updateUser(id, userDetails));
    }

    //delete user
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.deleteUser(id));
    }
}