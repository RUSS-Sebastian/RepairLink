package com.repairlink.backend.schedule.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public record SimulateScheduleRequest(
        @NotNull LocalDate startDate,
        @NotNull @Min(1) Integer bookingWindowDays,
        @NotNull LocalTime openingTime,
        @NotNull LocalTime closingTime,
        @NotNull @Min(15) Integer slotDurationMinutes,
        @NotEmpty List<String> operatingDays,
        List<ScheduleBreakDto> breaks,
        List<ScheduleBlockedDateRequest> blockedDates
) {
}

