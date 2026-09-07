package com.repairlink.backend.schedule.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public record ScheduleBlockedDateRequest(
        @NotNull LocalDate blockedDate,
        @NotBlank String reason
) {
}

