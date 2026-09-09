package com.repairlink.backend.appointment.controller;

import com.repairlink.backend.appointment.dto.AppointmentDetailResponse;
import com.repairlink.backend.appointment.service.AppointmentService;
import com.repairlink.backend.schedule.dto.ScheduleWindowResponse;
import com.repairlink.backend.schedule.service.ScheduleService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/appointments")
public class StaffAppointmentController {

    private final AppointmentService appointmentService;
    private final ScheduleService scheduleService;

    public StaffAppointmentController(
            AppointmentService appointmentService,
            ScheduleService scheduleService
    ) {
        this.appointmentService = appointmentService;
        this.scheduleService = scheduleService;
    }

    @GetMapping("/config-window")
    public ResponseEntity<ScheduleWindowResponse> getStaffScheduleWindow() {
        return ResponseEntity.ok(scheduleService.getStaffScheduleWindow());
    }

    @GetMapping
    public ResponseEntity<List<AppointmentDetailResponse>> getAppointments(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(appointmentService.getAppointmentsByDate(queryDate));
    }

    @GetMapping("/counts")
    public ResponseEntity<Map<LocalDate, Long>> getAppointmentCounts(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate
    ) {
        return ResponseEntity.ok(appointmentService.getAppointmentCountsByDateRange(startDate, endDate));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDetailResponse> getAppointmentDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(appointmentService.getAppointmentByIdForStaff(id));
    }

    @PatchMapping("/{id}/arrived")
    public ResponseEntity<AppointmentDetailResponse> markArrived(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String staffUsername = authentication != null ? authentication.getName() : "STAFF";
        return ResponseEntity.ok(appointmentService.markAppointmentArrived(id, staffUsername));
    }

    @PatchMapping("/{id}/no-show")
    public ResponseEntity<AppointmentDetailResponse> markNoShow(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String staffUsername = authentication != null ? authentication.getName() : "STAFF";
        return ResponseEntity.ok(appointmentService.markAppointmentNoShow(id, staffUsername));
    }
}
