package com.repairlink.backend.serviceRequest.controller;

import com.repairlink.backend.appointment.service.AppointmentService;
import com.repairlink.backend.serviceRequest.dto.StaffServiceRequestDetailResponse;
import com.repairlink.backend.serviceRequest.dto.StaffServiceRequestSummaryResponse;
import com.repairlink.backend.serviceRequest.service.ServiceRequestService;
import com.repairlink.backend.serviceRequest.dto.StaffRejectServiceRequestRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/service-requests")
public class StaffServiceRequestController {

    private final ServiceRequestService serviceRequestService;
    private final AppointmentService appointmentService;

    public StaffServiceRequestController(
            ServiceRequestService serviceRequestService,
            AppointmentService appointmentService
    ) {
        this.serviceRequestService = serviceRequestService;
        this.appointmentService = appointmentService;
    }

    @GetMapping
    public ResponseEntity<List<StaffServiceRequestSummaryResponse>> listAll() {
        return ResponseEntity.ok(serviceRequestService.getAllServiceRequestsForStaff());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffServiceRequestDetailResponse> getDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestDetailForStaff(id));
    }

    @PatchMapping("/{id}/reject")
    public ResponseEntity<StaffServiceRequestDetailResponse> rejectRequest(
            @PathVariable UUID id,
            @Valid @RequestBody StaffRejectServiceRequestRequest body
    ) {
        return ResponseEntity.ok(serviceRequestService.rejectServiceRequestByStaff(id, body.reason()));
    }

    @PostMapping("/{id}/confirm-appointment")
    public ResponseEntity<StaffServiceRequestDetailResponse> confirmAppointment(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        String staffUsername = authentication != null ? authentication.getName() : "STAFF";
        appointmentService.confirmAppointmentByStaff(id, staffUsername);
        return ResponseEntity.ok(serviceRequestService.getServiceRequestDetailForStaff(id));
    }
}
