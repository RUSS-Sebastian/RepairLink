package com.repairlink.backend.schedule.dto;

import java.time.LocalDate;
import java.util.List;

public record DailySlotsResponse(
        LocalDate date,
        String dayOfWeek,
        boolean isOpen,
        boolean isBlocked,
        String blockedReason,
        Integer slotDurationMinutes,
        List<SlotDto> slots
) {
}

