package com.repairlink.backend.schedule.dto;

import com.repairlink.backend.schedule.entity.ScheduleStatus;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

public record ScheduleConfigurationDetailResponse(
        UUID configurationId,
        String name,
        LocalDate startDate,
        LocalDate endDate,
        Integer bookingWindowDays,
        LocalTime openingTime,
        LocalTime closingTime,
        Integer slotDurationMinutes,
        Integer slotCapacity,
        Integer holdDurationMinutes,
        Integer cancellationNoticeHours,
        List<String> operatingDays,
        ScheduleStatus status,
        boolean canEditBlockedDates,
        List<ScheduleBreakDto> breaks,
        List<ScheduleBlockedDateResponse> blockedDates
) {
}

