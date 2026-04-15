package com.assignment.user_management_system.controller;

import com.assignment.user_management_system.model.User;
import com.assignment.user_management_system.service.UserService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @GetMapping("/users/search")
    public ResponseEntity<List<User>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Integer age,
            @RequestParam(required = false) String role) {
        
        List<User> results = userService.searchUsers(name, age, role);
        return ResponseEntity.ok(results);
    }

    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submit(@RequestBody User user) {
    
        User savedUser = userService.submitUser(user);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "user created successfully");
        response.put("user", savedUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Map<String, String>> deleteUser(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "false") boolean confirm) {
        
        Map<String, String> response = new HashMap<>();

        //this check at the controller level is to prevent data wipes
        if (!confirm) {
            response.put("error", "Confirmation required");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
        }

        try {
            userService.deleteUser(id);
            response.put("message", "user deleted successfully");
            return ResponseEntity.ok(response);
            
        } catch (RuntimeException ex) {
            response.put("error", ex.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(response);
        }
    }
}