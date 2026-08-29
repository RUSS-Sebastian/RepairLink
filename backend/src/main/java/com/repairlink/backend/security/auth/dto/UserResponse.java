package com.repairlink.backend.security.auth.dto;

import com.repairlink.backend.common.enums.RoleCode;

import java.util.UUID;

public record UserResponse(
        UUID id,
        String fullName,
        String email,
        RoleCode role
) {
}