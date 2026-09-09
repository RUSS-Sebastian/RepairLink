package com.repairlink.backend.schedule.dto;

import java.time.LocalTime;

public record AdminSlotDto(
        LocalTime startTime,
        LocalTime endTime,
        String label,
        boolean isBreak,
        int totalCapacity,
        int bookedCapacity,
        int remainingCapacity,
        String status
) {}

