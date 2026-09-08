package com.repairlink.backend.schedule.controller;

import com.repairlink.backend.schedule.dto.DailySlotsResponse;
import com.repairlink.backend.schedule.service.ScheduleService;
import com.repairlink.backend.schedule.dto.ScheduleWindowResponse;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/schedule")
public class CustomerScheduleController {

    private final ScheduleService scheduleService;

    public CustomerScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/slots")
    public ResponseEntity<DailySlotsResponse> getSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(scheduleService.getDailySlots(date));
    }

    @GetMapping("/current-window")
    public ResponseEntity<ScheduleWindowResponse> getCurrentWindow() {
        return ResponseEntity.ok(scheduleService.getCurrentWindow());
    }
}

