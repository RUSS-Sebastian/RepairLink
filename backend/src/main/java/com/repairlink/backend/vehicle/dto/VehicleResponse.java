package com.repairlink.backend.vehicle.dto;

import com.repairlink.backend.common.enums.FuelType;
import com.repairlink.backend.common.enums.MileageUnit;
import com.repairlink.backend.common.enums.TransmissionType;
import com.repairlink.backend.common.enums.VehicleType;

import java.util.UUID;

public record VehicleResponse(
        UUID id,
        String nickname,
        String make,
        String model,
        Integer year,
        String licensePlate,
        VehicleType vehicleType,
        FuelType fuelType,
        TransmissionType transmission,
        String color,
        Long currentMileage,
        MileageUnit mileageUnit
) {
}
