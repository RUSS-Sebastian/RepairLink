package com.repairlink.backend.staff.controller;

import com.repairlink.backend.common.enums.RoleCode;
import com.repairlink.backend.staff.dto.CreateStaffAccountRequest;
import com.repairlink.backend.staff.dto.StaffAccountResponse;
import com.repairlink.backend.staff.dto.UpdateStaffAccountRequest;
import com.repairlink.backend.staff.service.StaffAccountService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/staff")
public class AdminStaffController {

    private final StaffAccountService staffAccountService;

    public AdminStaffController(StaffAccountService staffAccountService) {
        this.staffAccountService = staffAccountService;
    }

    @PostMapping
    public ResponseEntity<StaffAccountResponse> createStaffAccount(
            @Valid @RequestBody CreateStaffAccountRequest request
    ) {
        StaffAccountResponse response = staffAccountService.createStaffAccount(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<StaffAccountResponse>> listStaffAccounts(
            @RequestParam(required = false) RoleCode role,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(staffAccountService.listStaffAccounts(role, search));
    }

    @PutMapping("/{id}")
    public ResponseEntity<StaffAccountResponse> updateStaffAccount(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStaffAccountRequest request
    ) {
        return ResponseEntity.ok(staffAccountService.updateStaffAccount(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteStaffAccount(@PathVariable UUID id) {
        staffAccountService.deleteStaffAccount(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<StaffAccountResponse> toggleStaffStatus(@PathVariable UUID id) {
        return ResponseEntity.ok(staffAccountService.toggleStaffStatus(id));
    }
}

