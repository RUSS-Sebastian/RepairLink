package com.repairlink.backend.schedule.dto;

import java.time.LocalDate;
import java.util.UUID;

public record ScheduleBlockedDateResponse(
        UUID blockedDateId,
        UUID configurationId,
        LocalDate blockedDate,
        String reason
) {
}

