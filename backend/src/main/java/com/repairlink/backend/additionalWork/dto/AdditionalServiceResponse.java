package com.repairlink.backend.additionalWork.dto;

import com.repairlink.backend.additionalWork.entity.AdditionalServiceStatus;
import com.repairlink.backend.additionalWork.entity.ServiceApplicability;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record AdditionalServiceResponse(
        UUID id,
        String name,
        String description,
        BigDecimal price,
        ServiceApplicability applicability,
        AdditionalServiceStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
