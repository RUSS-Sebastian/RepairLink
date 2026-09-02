package com.repairlink.backend.security.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record UpdateCustomerProfileRequest(
        @Size(max = 150, message = "Full name must not exceed 150 characters.")
        String fullName,

        @Email(message = "Email must be valid.")
        @Size(max = 254, message = "Email must not exceed 254 characters.")
        String email,

        @Pattern(
                regexp = "^\\+\\d{1,3}\\d{10}$",
                message = "Phone must include a valid country code and exactly 10 digits after it."
        )
        String phone
) {
}
