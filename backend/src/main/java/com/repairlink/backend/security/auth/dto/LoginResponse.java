package com.repairlink.backend.security.auth.dto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        UserResponse user
) {
}