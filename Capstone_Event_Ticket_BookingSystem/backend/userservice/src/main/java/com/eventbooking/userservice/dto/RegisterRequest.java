package com.eventbooking.userservice.dto;

import com.eventbooking.userservice.entity.User.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    @Pattern(regexp = "^[a-zA-Z ]{2,}$", message = "Name must be at least 2 characters and contain only alphabets")
    private String name;

    @NotBlank(message = "Email is required")
    @Pattern(regexp = "^[a-zA-Z0-9._%+-]+@gmail\\.com$", message = "Email must end with @gmail.com")
    private String email;

    @NotBlank(message = "Password is required")
    @Pattern(regexp = "^(?=.*[A-Z])(?=.*[@#$%^&+=!]).{8,12}$", message = "Password must be 8-12 characters, include at least one uppercase letter and one special character")
    private String password;

    @NotBlank(message = "Phone number is required")
    @Pattern(regexp = "^\\d{10}$", message = "Phone must be exactly 10 digits")
    private String phone;

    @NotNull(message = "Role is required")
    private Role role;
}