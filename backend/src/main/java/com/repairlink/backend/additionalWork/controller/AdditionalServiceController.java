package com.repairlink.backend.additionalWork.controller;

import com.repairlink.backend.additionalWork.dto.AdditionalServicePageResponse;
import com.repairlink.backend.additionalWork.dto.AdditionalServiceResponse;
import com.repairlink.backend.additionalWork.dto.CreateAdditionalServiceRequest;
import com.repairlink.backend.additionalWork.dto.UpdateAdditionalServiceRequest;
import com.repairlink.backend.additionalWork.entity.AdditionalServiceStatus;
import com.repairlink.backend.additionalWork.service.AdditionalServiceService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/additional-services")
public class AdditionalServiceController {

    private final AdditionalServiceService service;

    public AdditionalServiceController(AdditionalServiceService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<AdditionalServicePageResponse> list(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "ALL") String applicability,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "25") int size
    ) {
        return ResponseEntity.ok(service.list(search, status, applicability, page, size));
    }

    @PostMapping
    public ResponseEntity<AdditionalServiceResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateAdditionalServiceRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(currentUserId(authentication), request));
    }

    @PutMapping("/{serviceId}")
    public ResponseEntity<AdditionalServiceResponse> update(
            Authentication authentication,
            @PathVariable UUID serviceId,
            @Valid @RequestBody UpdateAdditionalServiceRequest request
    ) {
        return ResponseEntity.ok(service.update(currentUserId(authentication), serviceId, request));
    }

    @PatchMapping("/{serviceId}/status")
    public ResponseEntity<AdditionalServiceResponse> changeStatus(
            Authentication authentication,
            @PathVariable UUID serviceId,
            @Valid @RequestBody StatusRequest request
    ) {
        return ResponseEntity.ok(service.changeStatus(
                currentUserId(authentication), serviceId, request.status()
        ));
    }

    private UUID currentUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    public record StatusRequest(
            @NotNull(message = "Status is required.")
            AdditionalServiceStatus status
    ) {
    }
}
