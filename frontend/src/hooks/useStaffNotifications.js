import { useEffect, useRef, useState, useCallback } from "react";
import {
  getStaffNotifications,
  markNotificationAsRead as apiMarkAsRead,
  markAllNotificationsAsRead as apiMarkAllAsRead,
} from "../features/notifications/staffNotificationApi";

export function useStaffNotifications(enabled = false) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [latestToast, setLatestToast] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  const playNotificationSound = useCallback(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Audio playback error or blocked by autoplay policy
    }
  }, []);

  const loadNotifications = useCallback(async () => {
    if (!enabled) return;
    try {
      const data = await getStaffNotifications();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {
      // Ignore initial load error if not logged in
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    loadNotifications();
  }, [enabled, loadNotifications]);

  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;

    function connectWebSocket() {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return;
      }

      const socketUrl = "ws://localhost:8080/ws/staff-notifications";
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);

          setNotifications((prev) => [notification, ...prev]);
          setUnreadCount((prev) => prev + 1);
          setLatestToast(notification);
          playNotificationSound();
        } catch {
          // Bad payload
        }
      };

      ws.onclose = () => {
        if (isMounted) {
          reconnectTimeoutRef.current = setTimeout(connectWebSocket, 4000);
        }
      };

      ws.onerror = () => {
        ws.close();
      };
    }

    connectWebSocket();

    return () => {
      isMounted = false;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [enabled, playNotificationSound]);

  const dismissToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await apiMarkAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((item) =>
          item.notificationId === notificationId
            ? { ...item, isRead: true }
            : item
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Failed to mark
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await apiMarkAllAsRead();
      setNotifications((prev) =>
        prev.map((item) => ({ ...item, isRead: true }))
      );
      setUnreadCount(0);
    } catch {
      // Failed to mark all
    }
  }, []);

  return {
    notifications,
    unreadCount,
    latestToast,
    dismissToast,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
}
