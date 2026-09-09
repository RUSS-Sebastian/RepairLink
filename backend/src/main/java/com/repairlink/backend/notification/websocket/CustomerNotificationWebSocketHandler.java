package com.repairlink.backend.notification.websocket;

import com.repairlink.backend.notification.dto.NotificationResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.net.URI;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class CustomerNotificationWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(CustomerNotificationWebSocketHandler.class);

    private final Map<UUID, Set<WebSocketSession>> userSessions = new ConcurrentHashMap<>();
    private final Set<WebSocketSession> allSessions = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        allSessions.add(session);
        UUID userId = extractUserId(session);
        if (userId != null) {
            userSessions.computeIfAbsent(userId, k -> ConcurrentHashMap.newKeySet()).add(session);
            log.info("Customer WebSocket client connected for user {}: {}", userId, session.getId());
        } else {
            log.info("Anonymous customer WebSocket client connected: {}", session.getId());
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        allSessions.remove(session);
        UUID userId = extractUserId(session);
        if (userId != null) {
            Set<WebSocketSession> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId);
                }
            }
        }
        log.info("Customer WebSocket client disconnected: {} (status: {})", session.getId(), status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.warn("Customer WebSocket transport error on session {}: {}", session.getId(), exception.getMessage());
        allSessions.remove(session);
        UUID userId = extractUserId(session);
        if (userId != null) {
            Set<WebSocketSession> sessions = userSessions.get(userId);
            if (sessions != null) {
                sessions.remove(session);
                if (sessions.isEmpty()) {
                    userSessions.remove(userId);
                }
            }
        }
    }

    public void sendToCustomer(UUID customerId, NotificationResponse notification) {
        if (customerId == null || notification == null) {
            return;
        }

        Set<WebSocketSession> sessions = userSessions.get(customerId);
        if (sessions == null || sessions.isEmpty()) {
            log.debug("No active WebSocket sessions found for customer {}", customerId);
            return;
        }

        try {
            String json = serializeToJson(notification);
            TextMessage message = new TextMessage(json);

            for (WebSocketSession session : sessions) {
                if (session.isOpen()) {
                    try {
                        session.sendMessage(message);
                    } catch (IOException e) {
                        log.error("Failed to send WebSocket message to customer session {}: {}", session.getId(), e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to serialize WebSocket message payload for customer: {}", e.getMessage());
        }
    }

    private UUID extractUserId(WebSocketSession session) {
        try {
            URI uri = session.getUri();
            if (uri != null && uri.getQuery() != null) {
                String query = uri.getQuery();
                for (String param : query.split("&")) {
                    String[] pair = param.split("=");
                    if (pair.length == 2 && ("userId".equalsIgnoreCase(pair[0]) || "customerId".equalsIgnoreCase(pair[0]))) {
                        return UUID.fromString(pair[1]);
                    }
                }
            }
        } catch (Exception e) {
            log.warn("Could not extract userId from WebSocket URI: {}", e.getMessage());
        }
        return null;
    }

    private String serializeToJson(NotificationResponse n) {
        return "{" +
                "\"notificationId\":\"" + n.notificationId() + "\"," +
                "\"title\":\"" + escapeJson(n.title()) + "\"," +
                "\"message\":\"" + escapeJson(n.message()) + "\"," +
                "\"type\":\"" + n.type() + "\"," +
                "\"referenceId\":" + (n.referenceId() != null ? "\"" + n.referenceId() + "\"" : "null") + "," +
                "\"referenceCode\":" + (n.referenceCode() != null ? "\"" + escapeJson(n.referenceCode()) + "\"" : "null") + "," +
                "\"isRead\":" + n.isRead() + "," +
                "\"readAt\":" + (n.readAt() != null ? "\"" + n.readAt() + "\"" : "null") + "," +
                "\"createdAt\":\"" + n.createdAt() + "\"" +
                "}";
    }

    private String escapeJson(String raw) {
        if (raw == null) return "";
        return raw.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\b", "\\b")
                .replace("\f", "\\f")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }
}
