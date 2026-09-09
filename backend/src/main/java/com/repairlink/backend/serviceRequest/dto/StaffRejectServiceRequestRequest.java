package com.repairlink.backend.serviceRequest.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record StaffRejectServiceRequestRequest(
        @NotBlank(message = "Cancellation reason is required")
        @Size(max = 1000, message = "Reason cannot exceed 1000 characters")
        String reason
) {}
