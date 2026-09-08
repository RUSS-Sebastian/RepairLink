package com.repairlink.backend.admin.dashboard.controller;

import com.repairlink.backend.admin.dashboard.dto.AdminDashboardSummaryResponse;
import com.repairlink.backend.admin.dashboard.service.AdminDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService service;

    public AdminDashboardController(AdminDashboardService service) {
        this.service = service;
    }

    @GetMapping("/summary")
    public ResponseEntity<AdminDashboardSummaryResponse> summary() {
        return ResponseEntity.ok(service.getSummary());
    }
}