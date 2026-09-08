package com.repairlink.backend.schedule.dto;

import java.time.LocalTime;

public record SlotDto(
        LocalTime startTime,
        LocalTime endTime,
        String label,
        boolean isBreak,
        boolean isSelectable,
        boolean isHeld,
        boolean isHeldByCurrentUser,
        String holdStatusMessage,
        Integer totalCapacity,
        Integer availableCapacity
) {
    public SlotDto(LocalTime startTime, LocalTime endTime, String label, boolean isBreak, boolean isSelectable) {
        this(startTime, endTime, label, isBreak, isSelectable, false, false, null, null, null);
    }

    public SlotDto(LocalTime startTime, LocalTime endTime, String label, boolean isBreak, boolean isSelectable,
                   boolean isHeld, boolean isHeldByCurrentUser, String holdStatusMessage) {
        this(startTime, endTime, label, isBreak, isSelectable, isHeld, isHeldByCurrentUser, holdStatusMessage, null, null);
    }
}

