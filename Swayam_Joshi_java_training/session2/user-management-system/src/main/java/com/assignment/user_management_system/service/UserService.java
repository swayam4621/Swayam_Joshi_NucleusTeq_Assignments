package com.assignment.user_management_system.service;

import com.assignment.user_management_system.model.User;
import com.assignment.user_management_system.repository.UserRepository;
import com.assignment.user_management_system.component.NotificationComponent;
import com.assignment.user_management_system.formatter.MessageFormatter;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final NotificationComponent notificationComponent;
    private final Map<String, MessageFormatter> formatters;

    // Strict Constructor Injection
    public UserService(UserRepository userRepository, 
                       NotificationComponent notificationComponent, 
                       Map<String, MessageFormatter> formatters) {
        this.userRepository = userRepository;
        this.notificationComponent = notificationComponent;
        this.formatters = formatters;
    }

    //get all users
    public List<User> getAllUsers() { 
        return userRepository.findAll(); 
    }

    //get user by Id 
    public User getUser(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }


    //add user
    public String addUser(User user) {
        userRepository.save(user);
        return notificationComponent.send(); // Triggers notification on create
    }

    public String getFormattedWelcome(Long id, String type) {
        User user = getUser(id);
        MessageFormatter formatter = formatters.get(type.toUpperCase());
        if (formatter == null) throw new IllegalArgumentException("Invalid format type");
        return formatter.format(user.getName());
    }

    // Update user 
public User updateUser(Long id, User userDetails) {
    //check if user exists 
    User existingUser = getUser(id); 
    
    //update the fields
    existingUser.setName(userDetails.getName());
    existingUser.setEmail(userDetails.getEmail());
    
    //save the changes 
    userRepository.update(existingUser);
    
    return existingUser;
}

//delete user 
public String deleteUser(Long id) {
    // Check if user exists first
    getUser(id); 
    
    userRepository.delete(id);
    return "User with ID " + id + " has been deleted successfully.";
}
}