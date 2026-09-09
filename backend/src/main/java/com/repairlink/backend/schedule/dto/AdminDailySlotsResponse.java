package com.repairlink.backend.schedule.dto;

import java.time.LocalDate;
import java.util.List;

public record AdminDailySlotsResponse(
        LocalDate date,
        String dayOfWeek,
        boolean isOpen,
        boolean isBlocked,
        String blockedReason,
        Integer slotDurationMinutes,
        Integer slotCapacity,
        List<AdminSlotDto> slots
) {}

