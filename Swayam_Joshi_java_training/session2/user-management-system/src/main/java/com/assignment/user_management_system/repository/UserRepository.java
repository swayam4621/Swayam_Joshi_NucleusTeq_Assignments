package com.assignment.user_management_system.repository;

import com.assignment.user_management_system.model.User;
import org.springframework.stereotype.Repository;
import java.util.*;

@Repository
public class UserRepository {
    private final List<User> users = new ArrayList<>(List.of(
        new User(1L, "swayam joshi", "swayamjoshi13@gmail.com"),
        new User(2L, "Akshat sharma", "akshat@gmail.com")
    ));

    public List<User> findAll() { return users; }
    
    public Optional<User> findById(Long id) {
        return users.stream().filter(u -> u.getId().equals(id)).findFirst();
    }

    public void save(User user) { users.add(user); }


public boolean delete(Long id) {
    return users.removeIf(user -> user.getId().equals(id));
}

public void update(User updatedUser) {
    for (int i = 0; i < users.size(); i++) {
        if (users.get(i).getId().equals(updatedUser.getId())) {
            users.set(i, updatedUser);
            return;
        }
    }
}
}
