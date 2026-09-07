package com.repairlink.backend.schedule.dto;

import java.util.List;

public record SchedulePageResponse(
        ScheduleMetricsResponse metrics,
        List<ScheduleConfigurationResponse> content,
        int pageNumber,
        int pageSize,
        long totalElements,
        int totalPages,
        boolean isLast
) {
}

