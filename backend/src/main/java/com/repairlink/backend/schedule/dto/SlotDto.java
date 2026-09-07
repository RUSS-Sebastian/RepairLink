package com.repairlink.backend.schedule.dto;

import java.time.LocalTime;

public record SlotDto(
        LocalTime startTime,
        LocalTime endTime,
        String label,
        boolean isBreak,
        boolean isSelectable
) {
}

