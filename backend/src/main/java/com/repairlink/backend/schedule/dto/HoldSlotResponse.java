package com.repairlink.backend.schedule.dto;

import java.time.Instant;
import java.time.LocalDate;

public record HoldSlotResponse(
        LocalDate date,
        String timeSlot,
        Instant expiresAt,
        long secondsLeft,
        String message
) {}

