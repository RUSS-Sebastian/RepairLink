package com.repairlink.backend.part.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

public record PartResponse(
        UUID id,
        String name,
        String brand,
        String partNumber,
        String description,
        String source,
        Short warranty,
        BigDecimal price,
        Integer stock,
        Integer reorderLevel,
        String status,
        String effectiveStatus,
        Instant createdAt,
        Instant updatedAt
) {
}