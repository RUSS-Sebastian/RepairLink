package com.repairlink.backend.vehicle.dto;

import com.repairlink.backend.common.enums.FuelType;
import com.repairlink.backend.common.enums.TransmissionType;
import com.repairlink.backend.common.enums.VehicleType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

public record CreateVehicleRequest(
        @Size(max = 100, message = "Nickname must contain at most 100 characters.")
        String nickname,

        @NotBlank(message = "Make is required.")
        @Size(max = 100, message = "Make must contain at most 100 characters.")
        String make,

        @NotBlank(message = "Model is required.")
        @Size(max = 100, message = "Model must contain at most 100 characters.")
        String model,

        @NotNull(message = "Year is required.")
        @Min(value = 1900, message = "Year must be 1900 or later.")
        Integer year,

        @NotBlank(message = "License plate is required.")
        @Size(max = 50, message = "License plate must contain at most 50 characters.")
        @Pattern(
                regexp = "^[A-Za-z0-9 -]+$",
                message = "License plate may contain only English letters, numbers, spaces, and hyphens."
        )
        String licensePlate,

        @NotNull(message = "Vehicle type is required.")
        VehicleType vehicleType,

        FuelType fuelType,

        TransmissionType transmission,

        @NotBlank(message = "Color is required.")
        @Size(max = 50, message = "Color must contain at most 50 characters.")
        String color,

        @PositiveOrZero(message = "Current mileage cannot be negative.")
        Long currentMileage
) {
}
