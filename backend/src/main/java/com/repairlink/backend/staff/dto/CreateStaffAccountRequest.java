package com.repairlink.backend.staff.dto;

import com.repairlink.backend.common.enums.RoleCode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateStaffAccountRequest(
        @NotBlank(message = "Username is required.")
        @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters.")
        String username,

        String fullName,

        @NotBlank(message = "Email is required.")
        @Email(message = "Please provide a valid email address.")
        String email,

        String phone,

        @NotNull(message = "Role is required.")
        RoleCode role,

        @NotBlank(message = "Password is required.")
        @Size(min = 8, message = "Password must be at least 8 characters long.")
        String password
) {}

