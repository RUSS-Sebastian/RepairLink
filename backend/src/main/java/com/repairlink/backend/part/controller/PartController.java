package com.repairlink.backend.part.controller;

import com.repairlink.backend.part.dto.PartRequest;
import com.repairlink.backend.part.dto.PartPageResponse;
import com.repairlink.backend.part.dto.PartResponse;
import com.repairlink.backend.part.service.PartService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/parts")
public class PartController {

    private final PartService partService;

    public PartController(PartService partService) {
        this.partService = partService;
    }

    @GetMapping
    public ResponseEntity<PartPageResponse> listParts(
            @RequestParam(defaultValue = "") String search,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(defaultValue = "false") boolean lowStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(partService.listParts(
                search, status, lowStock, page, size
        ));
    }

    @PostMapping
    public ResponseEntity<PartResponse> createPart(
            Authentication authentication,
            @Valid @RequestBody PartRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(
                partService.createPart(currentUserId(authentication), request)
        );
    }

    @PutMapping("/{partId}")
    public ResponseEntity<PartResponse> updatePart(
            Authentication authentication,
            @PathVariable UUID partId,
            @Valid @RequestBody PartRequest request
    ) {
        return ResponseEntity.ok(partService.updatePart(
                currentUserId(authentication), partId, request
        ));
    }

    @PatchMapping("/{partId}/status")
    public ResponseEntity<PartResponse> updateStatus(
            Authentication authentication,
            @PathVariable UUID partId,
            @RequestBody StatusRequest request
    ) {
        return ResponseEntity.ok(partService.updateStatus(
                currentUserId(authentication), partId, request.status()
        ));
    }

    private UUID currentUserId(Authentication authentication) {
        return UUID.fromString(authentication.getName());
    }

    private record StatusRequest(String status) {
    }
}