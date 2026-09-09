package com.repairlink.backend.appointment.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record AppointmentDetailResponse(
        UUID appointmentId,
        String appointmentCode,
        UUID serviceRequestId,
        String requestCode,
        String status,
        LocalDate appointmentDate,
        String timeSlot,
        String startTime,
        Integer durationMinutes,
        String handoverMethod,
        String pickupLocation,
        String problemDescription,
        VehicleSummaryDto vehicle,
        CustomerSummaryDto customer,
        List<ServiceItemDto> additionalServices,
        List<PhotoItemDto> photos,
        String cancellationReason,
        String cancelledBy,
        Instant cancelledAt,
        String confirmedBy,
        Instant createdAt,
        Instant updatedAt
) {
    public record VehicleSummaryDto(
            UUID vehicleId,
            String nickname,
            String make,
            String model,
            Integer year,
            String licensePlate,
            String color,
            String vehicleType,
            Long currentMileage,
            String mileageUnit
    ) {
    }

    public record CustomerSummaryDto(
            UUID customerId,
            String fullName,
            String email,
            String phone
    ) {
    }

    public record ServiceItemDto(
            UUID id,
            String name,
            BigDecimal price
    ) {
    }

    public record PhotoItemDto(
            UUID photoId,
            String originalFileName,
            String storedFileName,
            String url,
            long fileSize,
            String contentType
    ) {
    }
}
