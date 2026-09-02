package com.repairlink.backend.vehicle.dto;

import java.time.Instant;

public record PlateHistoryResponse(
        String licensePlate,
        Instant changedAt,
        boolean current
) {
}
