package com.repairlink.backend.notification.service;

import com.repairlink.backend.notification.dto.NotificationListResponse;
import com.repairlink.backend.notification.dto.NotificationResponse;
import com.repairlink.backend.notification.entity.Notification;
import com.repairlink.backend.notification.entity.NotificationType;
import com.repairlink.backend.notification.repository.NotificationRepository;
import com.repairlink.backend.notification.websocket.StaffNotificationWebSocketHandler;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final StaffNotificationWebSocketHandler webSocketHandler;

    public NotificationService(
            NotificationRepository notificationRepository,
            StaffNotificationWebSocketHandler webSocketHandler
    ) {
        this.notificationRepository = notificationRepository;
        this.webSocketHandler = webSocketHandler;
    }

    @Transactional
    public NotificationResponse createAndBroadcastStaffNotification(
            String title,
            String message,
            NotificationType type,
            UUID referenceId,
            String referenceCode
    ) {
        Notification notification = new Notification();
        notification.setRecipientRole("STAFF");
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setReferenceCode(referenceCode);
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = toResponse(saved);

        // Broadcast real-time over WebSocket to staff clients
        webSocketHandler.broadcast(response);

        return response;
    }

    @Transactional(readOnly = true)
    public NotificationListResponse getStaffNotifications() {
        List<Notification> notifications = notificationRepository.findByRecipientRoleOrderByCreatedAtDesc("STAFF");
        long unreadCount = notificationRepository.countByRecipientRoleAndReadFalse("STAFF");

        List<NotificationResponse> list = notifications.stream()
                .map(this::toResponse)
                .toList();

        return new NotificationListResponse(list, unreadCount);
    }

    @Transactional
    public NotificationResponse markAsRead(UUID notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));

        notification.setRead(true);
        notification.setReadAt(Instant.now());
        Notification saved = notificationRepository.save(notification);

        return toResponse(saved);
    }

    @Transactional
    public void markAllAsReadForStaff() {
        notificationRepository.markAllAsReadForRole("STAFF", Instant.now());
    }

    private NotificationResponse toResponse(Notification n) {
        return new NotificationResponse(
                n.getNotificationId(),
                n.getTitle(),
                n.getMessage(),
                n.getType(),
                n.getReferenceId(),
                n.getReferenceCode(),
                n.isRead(),
                n.getReadAt(),
                n.getCreatedAt()
        );
    }
}
