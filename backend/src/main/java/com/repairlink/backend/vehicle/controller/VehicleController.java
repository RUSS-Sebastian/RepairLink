package com.repairlink.backend.vehicle.controller;

import com.repairlink.backend.vehicle.dto.CreateVehicleRequest;
import com.repairlink.backend.vehicle.dto.UpdateVehicleRequest;
import com.repairlink.backend.vehicle.dto.VehicleDetailResponse;
import com.repairlink.backend.vehicle.dto.VehicleResponse;
import com.repairlink.backend.vehicle.service.VehicleService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> listVehicles(
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                vehicleService.listVehicles(currentUserId(authentication))
        );
    }

    @GetMapping("/{vehicleId}")
    public ResponseEntity<VehicleDetailResponse> getVehicle(
            Authentication authentication,
            @PathVariable UUID vehicleId
    ) {
        return ResponseEntity.ok(
                vehicleService.getVehicle(
                        currentUserId(authentication),
                        vehicleId
                )
        );
    }

    @PostMapping
    public ResponseEntity<VehicleDetailResponse> createVehicle(
            Authentication authentication,
            @Valid @RequestBody CreateVehicleRequest request
    ) {
        VehicleDetailResponse response = vehicleService.createVehicle(
                currentUserId(authentication),
                request
        );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PatchMapping("/{vehicleId}")
    public ResponseEntity<VehicleDetailResponse> updateVehicle(
            Authentication authentication,
            @PathVariable UUID vehicleId,
            @Valid @RequestBody UpdateVehicleRequest request
    ) {
        return ResponseEntity.ok(
                vehicleService.updateVehicle(
                        currentUserId(authentication),
                        vehicleId,
                        request
                )
        );
    }

    @DeleteMapping("/{vehicleId}")
    public ResponseEntity<Void> deleteVehicle(
            Authentication authentication,
            @PathVariable UUID vehicleId
    ) {
        vehicleService.deleteVehicle(
                currentUserId(authentication),
                vehicleId
        );
        return ResponseEntity.noContent().build();
    }

    private UUID currentUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
