package com.repairlink.backend.serviceRequest.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record CustomerServiceRequestDetailResponse(
        UUID id,
        String status,
        VehicleSummaryDto vehicle,
        String problemDescription,
        LocalDate preferredDate,
        String preferredTimeSlot,
        String handoverMethod,
        String pickupLocation,
        List<ServiceItemDto> additionalServices,
        List<PhotoItemDto> photos,
        Instant createdAt,
        Instant updatedAt
) {
    public record VehicleSummaryDto(
            UUID id,
            String nickname,
            String make,
            String model,
            Integer year,
            String licensePlate,
            String vehicleType
    ) {}

    public record ServiceItemDto(
            UUID id,
            String name,
            BigDecimal price
    ) {}

    public record PhotoItemDto(
            UUID photoId,
            String originalFileName,
            String storedFileName,
            String url,
            Long fileSize,
            String contentType
    ) {}
}

