package com.assignment.user_management_system.service;

import com.assignment.user_management_system.component.UserValidatorComponent;
import com.assignment.user_management_system.exception.UserNotFoundException;
import com.assignment.user_management_system.model.User;
import com.assignment.user_management_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserValidatorComponent userValidatorComponent;
    private final UserRepository userRepository;

    //constructor injection is used here to guarantee the service cannot be created without a repository to prevent null pointer exceptions later
    public UserService(UserRepository userRepository, UserValidatorComponent userValidatorComponent) {
        this.userRepository = userRepository;
        this.userValidatorComponent = userValidatorComponent;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    
    public List<User> searchUsers(String name, Integer age, String role) {
        return userRepository.findAll().stream()
            //using ignorecase for strings to handle case insensitive input
            .filter(u -> name == null || u.getName().equalsIgnoreCase(name))
            .filter(u -> age == null || u.getAge().equals(age))
            .filter(u -> role == null || u.getRole().equalsIgnoreCase(role))
            .collect(Collectors.toList());
    }

    public User submitUser(User user) {

        userValidatorComponent.validateForSubmit(user);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        User user = userRepository.findById(id)
            .orElseThrow(() -> new UserNotFoundException("no user exists with id: " + id));
        userRepository.delete(user);
    }
}