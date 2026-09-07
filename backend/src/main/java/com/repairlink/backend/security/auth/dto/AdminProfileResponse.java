package com.repairlink.backend.security.auth.dto;

public record AdminProfileResponse(
        String fullName,
        String email,
        String phone,
        String memberSince
) {
}