package com.repairlink.backend.appointment.controller;

import com.repairlink.backend.appointment.dto.AppointmentDetailResponse;
import com.repairlink.backend.appointment.dto.CancelAppointmentRequest;
import com.repairlink.backend.appointment.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customer/appointments")
public class CustomerAppointmentController {

    private final AppointmentService appointmentService;

    public CustomerAppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    @GetMapping("/active")
    public ResponseEntity<List<AppointmentDetailResponse>> getActiveAppointments(Authentication authentication) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(appointmentService.getActiveAppointmentsForCustomer(customerId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AppointmentDetailResponse> getAppointmentDetail(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(appointmentService.getAppointmentDetail(id, customerId));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<AppointmentDetailResponse> cancelAppointment(
            @PathVariable UUID id,
            @Valid @RequestBody CancelAppointmentRequest request,
            Authentication authentication
    ) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(appointmentService.cancelAppointmentByCustomer(id, customerId, request.reason()));
    }
}
