package com.repairlink.backend.serviceRequest.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record StaffServiceRequestDetailResponse(
        UUID serviceRequestId,
        String requestCode,
        String status,
        CustomerProfileDto customer,
        VehicleDetailDto vehicle,
        String problemDescription,
        LocalDate preferredDate,
        String preferredTimeSlot,
        String handoverMethod,
        String pickupLocation,
        List<ServiceItemDto> additionalServices,
        List<PhotoItemDto> photos,
        ServiceLifecycleDto lifecycle,
        Instant createdAt,
        Instant updatedAt
) {
    public record CustomerProfileDto(
            UUID userId,
            String fullName,
            String email,
            String phone,
            String memberSince
    ) {}

    public record VehicleDetailDto(
            UUID vehicleId,
            String nickname,
            String make,
            String model,
            Integer year,
            String licensePlate,
            String vehicleType,
            String fuelType,
            String transmission,
            String color,
            Long currentMileage,
            String mileageUnit
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
            long fileSize,
            String contentType
    ) {}

    public record ServiceLifecycleDto(
            LifecycleStepDto requestCreated,
            LifecycleStepDto appointmentScheduled,
            LifecycleStepDto serviceCompleted
    ) {}

    public record LifecycleStepDto(
            String name,
            boolean isCompleted,
            boolean isPending,
            Instant timestamp
    ) {}
}
