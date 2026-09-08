package com.repairlink.backend.serviceRequest.controller;

import com.repairlink.backend.serviceRequest.dto.CustomerServiceRequestDetailResponse;
import com.repairlink.backend.serviceRequest.dto.ServiceRequestResponse;
import com.repairlink.backend.serviceRequest.entity.HandoverMethod;
import com.repairlink.backend.serviceRequest.service.ServiceRequestService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customer/service-requests")
public class CustomerServiceRequestController {

    private final ServiceRequestService serviceRequestService;

    public CustomerServiceRequestController(ServiceRequestService serviceRequestService) {
        this.serviceRequestService = serviceRequestService;
    }

    @GetMapping
    public ResponseEntity<List<CustomerServiceRequestDetailResponse>> list(Authentication authentication) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(serviceRequestService.getCustomerServiceRequests(customerId));
    }

    @GetMapping("/active-vehicle-ids")
    public ResponseEntity<List<UUID>> getActiveVehicleIds(Authentication authentication) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(serviceRequestService.getActiveVehicleIdsForCustomer(customerId));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ServiceRequestResponse> create(
            Authentication authentication,
            @RequestParam UUID vehicleId,
            @RequestParam String problem,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) LocalDate preferredDate,
            @RequestParam String timeSlot,
            @RequestParam HandoverMethod handoverMethod,
            @RequestParam(required = false) String pickupLocation,
            @RequestParam(required = false) List<UUID> additionalServiceIds,
            @RequestParam(value = "photos", required = false) List<MultipartFile> photos
    ) {
        UUID customerId = UUID.fromString(authentication.getName());

        ServiceRequestResponse response = serviceRequestService.createServiceRequest(
                customerId, vehicleId, problem, preferredDate, timeSlot,
                handoverMethod, pickupLocation, additionalServiceIds, photos
        );

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            Authentication authentication,
            @PathVariable UUID id
    ) {
        UUID customerId = UUID.fromString(authentication.getName());
        serviceRequestService.deleteServiceRequest(customerId, id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<Void> cancel(
            Authentication authentication,
            @PathVariable UUID id
    ) {
        UUID customerId = UUID.fromString(authentication.getName());
        serviceRequestService.cancelServiceRequest(customerId, id);
        return ResponseEntity.noContent().build();
    }
}
