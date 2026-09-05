package com.repairlink.backend.part.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record PartRequest(
        @NotBlank(message = "Part name is required.")
        @Size(max = 150, message = "Part name must be 150 characters or fewer.")
        String name,

        @NotBlank(message = "Brand is required.")
        @Size(max = 100, message = "Brand must be 100 characters or fewer.")
        String brand,

        @NotBlank(message = "Part number is required.")
        @Size(max = 30, message = "Part number must be 30 characters or fewer.")
        @Pattern(regexp = "^[A-Z]{2,4}-[A-Z]{2}-[A-Z0-9]{4,6}$", message = "Part number format is invalid.")
        String partNumber,

        @Size(max = 1000, message = "Description must be 1000 characters or fewer.")
        String description,

        @Size(max = 150, message = "Source must be 150 characters or fewer.")
        String source,

        @NotNull(message = "Warranty is required.")
        @PositiveOrZero(message = "Warranty must be 0 or greater.")
        Short warranty,

        @NotNull(message = "Price is required.")
        @DecimalMin(value = "0.01", message = "Price must be greater than 0.")
        BigDecimal price,

        @NotNull(message = "Stock is required.")
        @Min(value = 0, message = "Stock must be 0 or greater.")
        Integer stock,

        @NotNull(message = "Reorder level is required.")
        @Min(value = 0, message = "Reorder level must be 0 or greater.")
        Integer reorderLevel,

        String status
) {
}