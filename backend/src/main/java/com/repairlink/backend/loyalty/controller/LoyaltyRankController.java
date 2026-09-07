package com.repairlink.backend.loyalty.controller;

import com.repairlink.backend.loyalty.dto.CreateLoyaltyRankRequest;
import com.repairlink.backend.loyalty.dto.LoyaltyRankListResponse;
import com.repairlink.backend.loyalty.dto.LoyaltyRankResponse;
import com.repairlink.backend.loyalty.dto.UpdateLoyaltyRankRequest;
import com.repairlink.backend.loyalty.service.LoyaltyRankService;
import jakarta.validation.Valid;
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
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/loyalty-ranks")
public class LoyaltyRankController {

    private final LoyaltyRankService service;

    public LoyaltyRankController(LoyaltyRankService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<LoyaltyRankListResponse> list() {
        return ResponseEntity.ok(service.list());
    }

    @PostMapping
    public ResponseEntity<LoyaltyRankResponse> create(
            Authentication authentication,
            @Valid @RequestBody CreateLoyaltyRankRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(service.create(currentUserId(authentication), request));
    }

    @PutMapping("/{rankId}")
    public ResponseEntity<LoyaltyRankResponse> update(
            Authentication authentication,
            @PathVariable UUID rankId,
            @Valid @RequestBody UpdateLoyaltyRankRequest request
    ) {
        return ResponseEntity.ok(service.update(currentUserId(authentication), rankId, request));
    }

    @PatchMapping("/{rankId}/activate")
    public ResponseEntity<LoyaltyRankResponse> activate(
            Authentication authentication,
            @PathVariable UUID rankId
    ) {
        return ResponseEntity.ok(service.changeActive(currentUserId(authentication), rankId, true));
    }

    @PatchMapping("/{rankId}/deactivate")
    public ResponseEntity<LoyaltyRankResponse> deactivate(
            Authentication authentication,
            @PathVariable UUID rankId
    ) {
        return ResponseEntity.ok(service.changeActive(currentUserId(authentication), rankId, false));
    }

    private UUID currentUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }
}
