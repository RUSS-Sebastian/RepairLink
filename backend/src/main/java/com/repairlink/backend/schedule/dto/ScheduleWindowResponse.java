package com.repairlink.backend.schedule.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record ScheduleWindowResponse(
        String configurationName,
        LocalDate startDate,
        LocalDate endDate,
        List<String> operatingDays,
        LocalTime openingTime,
        LocalTime closingTime,
        Integer slotDurationMinutes
) {
    public static ScheduleWindowResponse empty() {
        return new ScheduleWindowResponse(null, null, null, List.of(), null, null, null);
    }
}
