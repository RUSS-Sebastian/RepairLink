package com.repairlink.backend.notification.controller;

import com.repairlink.backend.notification.dto.NotificationListResponse;
import com.repairlink.backend.notification.dto.NotificationResponse;
import com.repairlink.backend.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/customer/notifications")
public class CustomerNotificationController {

    private final NotificationService notificationService;

    public CustomerNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<NotificationListResponse> getNotifications(Authentication authentication) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(notificationService.getCustomerNotifications(customerId));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(
            @PathVariable UUID id,
            Authentication authentication
    ) {
        UUID customerId = UUID.fromString(authentication.getName());
        return ResponseEntity.ok(notificationService.markAsReadForCustomer(customerId, id));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
        UUID customerId = UUID.fromString(authentication.getName());
        notificationService.markAllAsReadForCustomer(customerId);
        return ResponseEntity.noContent().build();
    }
}
