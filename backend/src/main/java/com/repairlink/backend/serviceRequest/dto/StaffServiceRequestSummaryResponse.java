package com.repairlink.backend.serviceRequest.dto;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record StaffServiceRequestSummaryResponse(
        UUID serviceRequestId,
        String requestCode,
        String status,
        String customerName,
        String customerEmail,
        String customerPhone,
        String vehicleName,
        String vehicleLicensePlate,
        String problemSummary,
        LocalDate preferredDate,
        String preferredTimeSlot,
        String handoverMethod,
        int photoCount,
        List<String> additionalServiceNames,
        Instant createdAt,
        String cancellationReason,
        String cancelledBy
) {
}
