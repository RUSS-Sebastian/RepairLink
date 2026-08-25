package com.repairlink.backend.security.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SignupRequest(

        @NotBlank(message = "Full name is required.")
        @Size(max = 150, message = "Full name must not exceed 150 characters.")
        String fullName,

        @NotBlank(message = "Email is required.")
        @Email(message = "Email must be valid.")
        @Size(max = 254, message = "Email must not exceed 254 characters.")
        String email,

        @NotBlank(message = "Phone is required.")
        @Pattern(
                regexp = "^\\+[1-9]\\d{7,14}$",
                message = "Phone must use international format, for example +959123456789."
        )
        String phone,

        @NotBlank(message = "Password is required.")
        @Size(
                min = 8,
                max = 72,
                message = "Password must contain between 8 and 72 characters."
        )
        String password
) {
}