package com.repairlink.backend.schedule.controller;

import com.repairlink.backend.schedule.dto.DailySlotsResponse;
import com.repairlink.backend.schedule.dto.HoldSlotRequest;
import com.repairlink.backend.schedule.dto.HoldSlotResponse;
import com.repairlink.backend.schedule.dto.ScheduleWindowResponse;
import com.repairlink.backend.schedule.service.ScheduleService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/schedule")
public class CustomerScheduleController {

    private final ScheduleService scheduleService;

    public CustomerScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping("/slots")
    public ResponseEntity<DailySlotsResponse> getSlots(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            Authentication authentication
    ) {
        UUID customerId = null;
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            try {
                customerId = UUID.fromString(authentication.getName());
            } catch (IllegalArgumentException ignored) {}
        }
        return ResponseEntity.ok(scheduleService.getDailySlots(date, customerId));
    }

    @GetMapping("/current-window")
    public ResponseEntity<ScheduleWindowResponse> getCurrentWindow() {
        return ResponseEntity.ok(scheduleService.getCurrentWindow());
    }

    @PostMapping("/slots/hold")
    public ResponseEntity<HoldSlotResponse> holdSlot(
            Authentication authentication,
            @RequestBody HoldSlotRequest request
    ) {
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        UUID customerId = UUID.fromString(authentication.getName());
        HoldSlotResponse response = scheduleService.holdSlot(customerId, request.date(), request.timeSlot());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/slots/hold")
    public ResponseEntity<Void> releaseHold(Authentication authentication) {
        if (authentication != null && authentication.isAuthenticated() && !"anonymousUser".equals(authentication.getPrincipal())) {
            try {
                UUID customerId = UUID.fromString(authentication.getName());
                scheduleService.releaseHold(customerId);
            } catch (IllegalArgumentException ignored) {}
        }
        return ResponseEntity.noContent().build();
    }
}


