package com.repairlink.backend.serviceRequest.dto;

import java.util.UUID;

public record ActiveVehicleStatusDto(
        UUID vehicleId,
        String status,
        String requestCode
) {
}
