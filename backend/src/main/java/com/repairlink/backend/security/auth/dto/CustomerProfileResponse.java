package com.repairlink.backend.security.auth.dto;

public record CustomerProfileResponse(
        String fullName,
        String email,
        String phone,
        String memberSince
) {
}
