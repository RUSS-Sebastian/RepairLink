package com.repairlink.backend.schedule.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record SimulateScheduleResponse(
        LocalDate calculatedEndDate,
        Map<String, List<SlotDto>> slotsByDay
) {
}

