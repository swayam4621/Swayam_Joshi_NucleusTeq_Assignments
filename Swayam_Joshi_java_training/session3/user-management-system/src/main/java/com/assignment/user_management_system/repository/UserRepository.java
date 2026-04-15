package com.assignment.user_management_system.repository;

import com.assignment.user_management_system.model.User;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Repository
public class UserRepository {

    private final List<User> users = new ArrayList<>();
    private long currentId = 1;

    public UserRepository() {
        users.add(new User(currentId++, "Priya", 30, "USER"));
        users.add(new User(currentId++, "Amit", 25, "ADMIN"));
        users.add(new User(currentId++, "Rahul", 30, "MANAGER"));
        users.add(new User(currentId++, "Neha", 28, "USER"));
        users.add(new User(currentId++, "Priya", 22, "GUEST"));
        users.add(new User(currentId++, "Swayam", 21, "ADMIN"));
    }

    public List<User> findAll() {
        return new ArrayList<>(users);
    }

    public Optional<User> findById(Long id) {
        return users.stream()
            .filter(u -> u.getId().equals(id))
            .findFirst();
    }

    public User save(User user) {
        user.setId(currentId++);
        users.add(user);
        return user;
    }

    public void delete(User user) {
        users.remove(user);
    }
}