package com.repairlink.backend.schedule.dto;

import java.time.LocalDate;

public record HoldSlotRequest(
        LocalDate date,
        String timeSlot
) {}

