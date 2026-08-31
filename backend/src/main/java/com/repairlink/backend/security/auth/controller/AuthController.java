package com.repairlink.backend.security.auth.controller;

import com.repairlink.backend.security.auth.dto.CustomerProfileResponse;
import com.repairlink.backend.security.auth.dto.LoginRequest;
import com.repairlink.backend.security.auth.dto.LoginResponse;
import com.repairlink.backend.security.auth.dto.SignupRequest;
import com.repairlink.backend.security.auth.dto.UpdateCustomerProfileRequest;
import com.repairlink.backend.security.auth.dto.UserResponse;
import com.repairlink.backend.security.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public ResponseEntity<UserResponse> signup(
            @Valid @RequestBody SignupRequest request
    ) {
        UserResponse response = authService.signup(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginResponse response = authService.authenticate(request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me(
            Authentication authentication
    ) {
        UUID userId = UUID.fromString(
                authentication.getName()
        );

        UserResponse response =
                authService.getCurrentUser(userId);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/customers/profile")
    public ResponseEntity<CustomerProfileResponse> customerProfile(
            Authentication authentication
    ) {
        UUID userId = UUID.fromString(authentication.getName());

        CustomerProfileResponse response =
                authService.getCurrentCustomerProfile(userId);

        return ResponseEntity.ok(response);
    }

    @PutMapping("/customers/profile")
    public ResponseEntity<CustomerProfileResponse> updateCustomerProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateCustomerProfileRequest request
    ) {
        UUID userId = UUID.fromString(authentication.getName());

        CustomerProfileResponse response =
                authService.updateCurrentCustomerProfile(userId, request);

        return ResponseEntity.ok(response);
    }
}