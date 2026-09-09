package com.repairlink.backend.config;

import com.repairlink.backend.notification.websocket.StaffNotificationWebSocketHandler;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    private final StaffNotificationWebSocketHandler staffNotificationWebSocketHandler;

    public WebSocketConfig(StaffNotificationWebSocketHandler staffNotificationWebSocketHandler) {
        this.staffNotificationWebSocketHandler = staffNotificationWebSocketHandler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(staffNotificationWebSocketHandler, "/ws/staff-notifications")
                .setAllowedOrigins(
                        "http://localhost:5173",
                        "http://127.0.0.1:5173"
                );
    }
}
