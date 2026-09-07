package com.repairlink.backend.additionalWork.dto;

import com.repairlink.backend.additionalWork.entity.AdditionalServiceStatus;
import com.repairlink.backend.additionalWork.entity.ServiceApplicability;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateAdditionalServiceRequest(
        @NotBlank(message = "Service name is required.")
        @Size(max = 100, message = "Service name must be 100 characters or fewer.")
        String name,

        @Size(max = 500, message = "Description must be 500 characters or fewer.")
        String description,

        @NotNull(message = "Price is required.")
        @DecimalMin(value = "0.00", message = "Price cannot be negative.")
        @Digits(integer = 13, fraction = 2, message = "Price must have at most 13 whole-number digits and 2 decimal places.")
        BigDecimal price,

        @NotNull(message = "Service applicability is required.")
        ServiceApplicability applicability,

        @NotNull(message = "Status is required when editing a service.")
        AdditionalServiceStatus status
) {
}
