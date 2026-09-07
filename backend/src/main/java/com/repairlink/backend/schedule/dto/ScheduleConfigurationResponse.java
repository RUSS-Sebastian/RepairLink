package com.repairlink.backend.schedule.dto;

import com.repairlink.backend.schedule.entity.ScheduleStatus;
import java.time.LocalDate;
import java.util.UUID;

public record ScheduleConfigurationResponse(
        UUID configurationId,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        ScheduleStatus status,
        int operatingDaysCount,
        int slotDurationMinutes,
        int slotCapacity
) {
}

