package com.repairlink.backend.serviceRequest.controller;

import com.repairlink.backend.serviceRequest.dto.StaffServiceRequestDetailResponse;
import com.repairlink.backend.serviceRequest.dto.StaffServiceRequestSummaryResponse;
import com.repairlink.backend.serviceRequest.service.ServiceRequestService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff/service-requests")
public class StaffServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    public StaffServiceRequestController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @GetMapping
    public ResponseEntity<List<StaffServiceRequestSummaryResponse>> listAll() {
        return ResponseEntity.ok(serviceRequestService.getAllServiceRequestsForStaff());
    }

    @GetMapping("/{id}")
    public ResponseEntity<StaffServiceRequestDetailResponse> getDetail(@PathVariable UUID id) {
        return ResponseEntity.ok(serviceRequestService.getServiceRequestDetailForStaff(id));
    }
}
