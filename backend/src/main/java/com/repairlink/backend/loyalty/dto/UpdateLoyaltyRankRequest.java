package com.repairlink.backend.loyalty.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateLoyaltyRankRequest(
        @NotBlank(message = "Rank name is required.")
        @Size(max = 60, message = "Rank name must be 60 characters or fewer.")
        String rankName,

        @NotNull(message = "Minimum points are required.")
        @Min(value = 0, message = "Minimum points cannot be negative.")
        Long minimumPoints,

        @NotNull(message = "Maximum points are required.")
        @Min(value = 0, message = "Maximum points cannot be negative.")
        Long maximumPoints,

        @NotNull(message = "Discount percentage is required.")
        @DecimalMin(value = "0.00", message = "Discount percentage cannot be negative.")
        @DecimalMax(value = "100.00", message = "Discount percentage cannot exceed 100.")
        @Digits(integer = 3, fraction = 2, message = "Discount percentage may have at most 2 decimal places.")
        BigDecimal discountPercentage
) {
}
