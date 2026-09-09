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
    private final com.repairlink.backend.notification.websocket.CustomerNotificationWebSocketHandler customerWebSocketHandler;

    public NotificationService(
            NotificationRepository notificationRepository,
            StaffNotificationWebSocketHandler webSocketHandler,
            com.repairlink.backend.notification.websocket.CustomerNotificationWebSocketHandler customerWebSocketHandler
    ) {
        this.notificationRepository = notificationRepository;
        this.webSocketHandler = webSocketHandler;
        this.customerWebSocketHandler = customerWebSocketHandler;
    }

    @Transactional
    public NotificationResponse createAndSendCustomerNotification(
            com.repairlink.backend.security.auth.entity.UserAccount customer,
            String title,
            String message,
            NotificationType type,
            UUID referenceId,
            String referenceCode
    ) {
        Notification notification = new Notification();
        notification.setRecipientRole("CUSTOMER");
        notification.setRecipientUser(customer);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setType(type);
        notification.setReferenceId(referenceId);
        notification.setReferenceCode(referenceCode);
        notification.setRead(false);

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = toResponse(saved);

        // Broadcast real-time over WebSocket to the customer's active sessions
        if (customer != null && customer.getUserId() != null) {
            customerWebSocketHandler.sendToCustomer(customer.getUserId(), response);
        }

        return response;
    }

    @Transactional(readOnly = true)
    public NotificationListResponse getCustomerNotifications(UUID customerId) {
        List<Notification> notifications = notificationRepository.findByRecipientUser_UserIdOrderByCreatedAtDesc(customerId);
        long unreadCount = notificationRepository.countByRecipientUser_UserIdAndReadFalse(customerId);

        List<NotificationResponse> list = notifications.stream()
                .map(this::toResponse)
                .toList();

        return new NotificationListResponse(list, unreadCount);
    }

    @Transactional
    public NotificationResponse markAsReadForCustomer(UUID customerId, UUID notificationId) {
        Notification notification = notificationRepository.findByNotificationIdAndRecipientUser_UserId(notificationId, customerId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found: " + notificationId));

        notification.setRead(true);
        notification.setReadAt(Instant.now());
        Notification saved = notificationRepository.save(notification);

        return toResponse(saved);
    }

    @Transactional
    public void markAllAsReadForCustomer(UUID customerId) {
        notificationRepository.markAllAsReadForUser(customerId, Instant.now());
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
