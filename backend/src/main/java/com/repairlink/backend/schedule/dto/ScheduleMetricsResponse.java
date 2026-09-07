package com.repairlink.backend.schedule.dto;

import java.time.LocalDate;

public record ScheduleMetricsResponse(
        long totalConfigurations,
        String currentWindowName,
        LocalDate nextOpeningDate
) {
}

