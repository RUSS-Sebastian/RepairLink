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
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class StaffNotificationWebSocketHandler extends TextWebSocketHandler {

    private static final Logger log = LoggerFactory.getLogger(StaffNotificationWebSocketHandler.class);

    private final Set<WebSocketSession> sessions = ConcurrentHashMap.newKeySet();

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        sessions.add(session);
        log.info("Staff WebSocket client connected: {}", session.getId());
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session);
        log.info("Staff WebSocket client disconnected: {} (status: {})", session.getId(), status);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.warn("Staff WebSocket transport error on session {}: {}", session.getId(), exception.getMessage());
        sessions.remove(session);
    }

    public void broadcast(NotificationResponse notification) {
        if (sessions.isEmpty() || notification == null) {
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
                        log.error("Failed to send WebSocket message to session {}: {}", session.getId(), e.getMessage());
                    }
                }
            }
        } catch (Exception e) {
            log.error("Failed to serialize WebSocket message payload: {}", e.getMessage());
        }
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
