package com.repairlink.backend.notification.repository;

import com.repairlink.backend.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    List<Notification> findByRecipientRoleOrderByCreatedAtDesc(String recipientRole);

    long countByRecipientRoleAndReadFalse(String recipientRole);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :readAt WHERE n.recipientRole = :role AND n.read = false")
    int markAllAsReadForRole(String role, Instant readAt);

    List<Notification> findByRecipientUser_UserIdOrderByCreatedAtDesc(UUID userId);

    long countByRecipientUser_UserIdAndReadFalse(UUID userId);

    @Modifying
    @Query("UPDATE Notification n SET n.read = true, n.readAt = :readAt WHERE n.recipientUser.userId = :userId AND n.read = false")
    int markAllAsReadForUser(UUID userId, Instant readAt);

    java.util.Optional<Notification> findByNotificationIdAndRecipientUser_UserId(UUID notificationId, UUID userId);
}
