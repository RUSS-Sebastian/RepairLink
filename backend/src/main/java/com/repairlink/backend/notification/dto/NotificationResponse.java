package com.repairlink.backend.notification.dto;

import com.repairlink.backend.notification.entity.NotificationType;

import java.time.Instant;
import java.util.UUID;

public record NotificationResponse(
        UUID notificationId,
        String title,
        String message,
        NotificationType type,
        UUID referenceId,
        String referenceCode,
        boolean isRead,
        Instant readAt,
        Instant createdAt
) {
}
