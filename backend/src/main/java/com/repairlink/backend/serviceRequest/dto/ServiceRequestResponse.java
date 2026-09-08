package com.repairlink.backend.serviceRequest.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record ServiceRequestResponse(
        UUID id,
        String status,
        String vehicleName,
        String problemSummary,
        LocalDate preferredDate,
        String timeSlot,
        String handoverMethod,
        int photoCount,
        List<String> additionalServices,
        Instant createdAt
) {}
