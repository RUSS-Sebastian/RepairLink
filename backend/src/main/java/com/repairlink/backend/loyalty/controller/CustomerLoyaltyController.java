package com.repairlink.backend.loyalty.controller;

import com.repairlink.backend.loyalty.dto.CustomerLoyaltyResponse;
import com.repairlink.backend.loyalty.service.CustomerLoyaltyService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/customers/loyalty")
public class CustomerLoyaltyController {

    private final CustomerLoyaltyService service;

    public CustomerLoyaltyController(CustomerLoyaltyService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<CustomerLoyaltyResponse> current(Authentication authentication) {
        UUID userId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(service.getCurrentCustomerLoyalty(userId));
    }
}
