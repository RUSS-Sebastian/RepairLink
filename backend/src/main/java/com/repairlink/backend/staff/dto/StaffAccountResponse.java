package com.repairlink.backend.staff.dto;

import com.repairlink.backend.common.enums.AccountStatus;
import com.repairlink.backend.common.enums.RoleCode;

import java.time.Instant;
import java.util.UUID;

public record StaffAccountResponse(
        UUID userId,
        String username,
        String fullName,
        String email,
        String phone,
        RoleCode role,
        String roleName,
        AccountStatus accountStatus,
        Instant createdAt
) {}

