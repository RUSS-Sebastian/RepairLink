package com.repairlink.backend.notification.controller;

import com.repairlink.backend.notification.dto.NotificationListResponse;
import com.repairlink.backend.notification.dto.NotificationResponse;
import com.repairlink.backend.notification.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/staff/notifications")
public class StaffNotificationController {

    private final NotificationService notificationService;

    public StaffNotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<NotificationListResponse> getStaffNotifications() {
        return ResponseEntity.ok(notificationService.getStaffNotifications());
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<NotificationResponse> markAsRead(@PathVariable UUID id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        notificationService.markAllAsReadForStaff();
        return ResponseEntity.noContent().build();
    }
}
