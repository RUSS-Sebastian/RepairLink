package com.repairlink.backend.schedule.controller;

import com.repairlink.backend.schedule.dto.*;
import com.repairlink.backend.schedule.service.ScheduleService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/schedule-configurations")
public class AdminScheduleController {

    private final ScheduleService scheduleService;

    public AdminScheduleController(ScheduleService scheduleService) {
        this.scheduleService = scheduleService;
    }

    @GetMapping
    public ResponseEntity<SchedulePageResponse> listConfigurations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "4") int size
    ) {
        return ResponseEntity.ok(scheduleService.listConfigurations(dateFrom, dateTo, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ScheduleConfigurationDetailResponse> getConfiguration(@PathVariable UUID id) {
        return ResponseEntity.ok(scheduleService.getConfiguration(id));
    }

    @PostMapping
    public ResponseEntity<ScheduleConfigurationDetailResponse> createConfiguration(
            Authentication authentication,
            @Valid @RequestBody CreateScheduleConfigurationRequest request
    ) {
        UUID adminId = authentication != null && authentication.getName() != null && !authentication.getName().isBlank()
                ? UUID.fromString(authentication.getName())
                : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.createConfiguration(adminId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteConfiguration(@PathVariable UUID id) {
        scheduleService.deleteConfiguration(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/blocked-dates")
    public ResponseEntity<ScheduleBlockedDateResponse> addBlockedDate(
            Authentication authentication,
            @PathVariable UUID id,
            @Valid @RequestBody ScheduleBlockedDateRequest request
    ) {
        UUID adminId = authentication != null && authentication.getName() != null && !authentication.getName().isBlank()
                ? UUID.fromString(authentication.getName())
                : null;
        return ResponseEntity.status(HttpStatus.CREATED).body(scheduleService.addBlockedDate(adminId, id, request));
    }

    @DeleteMapping("/{id}/blocked-dates/{blockedDateId}")
    public ResponseEntity<Void> removeBlockedDate(
            @PathVariable UUID id,
            @PathVariable UUID blockedDateId
    ) {
        scheduleService.removeBlockedDate(id, blockedDateId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/simulate")
    public ResponseEntity<SimulateScheduleResponse> simulateSchedule(
            @Valid @RequestBody SimulateScheduleRequest request
    ) {
        return ResponseEntity.ok(scheduleService.simulateSchedule(request));
    }
}

