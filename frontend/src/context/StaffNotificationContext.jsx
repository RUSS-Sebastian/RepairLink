import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  getStaffNotifications,
  markNotificationAsRead as apiMarkAsRead,
  markAllNotificationsAsRead as apiMarkAllAsRead,
} from "../features/notifications/staffNotificationApi";
import { getStoredAuthSession } from "../utils/auth";

const StaffNotificationContext = createContext(null);

export function StaffNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [latestToast, setLatestToast] = useState(null);
  const [isStaff, setIsStaff] = useState(() => {
    const session = getStoredAuthSession();
    const role = session.user?.role;
    return role === "STAFF" || role === "CENTER_STAFF";
  });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  // Sync auth state
  useEffect(() => {
    const handleAuthUpdate = () => {
      const session = getStoredAuthSession();
      const role = session.user?.role;
      setIsStaff(role === "STAFF" || role === "CENTER_STAFF");
    };

    window.addEventListener("repairlink_auth_updated", handleAuthUpdate);
    return () => {
      window.removeEventListener("repairlink_auth_updated", handleAuthUpdate);
    };
  }, []);

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

  const fetchNotifications = useCallback(async () => {
    if (!isStaff) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    try {
      const data = await getStaffNotifications();
      const notis = data.notifications || [];
      setNotifications(notis);
      const computedUnread =
        data.unreadCount !== undefined
          ? data.unreadCount
          : notis.filter((n) => !n.isRead).length;
      setUnreadCount(computedUnread);
    } catch {
      // Ignore initial load error
    } finally {
      setLoading(false);
    }
  }, [isStaff]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // WebSocket Connection
  useEffect(() => {
    if (!isStaff) return;

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

          // Update notifications list immediately (prevent duplicate IDs)
          setNotifications((prev) => {
            if (
              prev.some(
                (n) => n.notificationId === notification.notificationId
              )
            ) {
              return prev;
            }
            return [notification, ...prev];
          });

          // Increment unread count immediately
          setUnreadCount((prev) => prev + 1);

          // Trigger toast
          setLatestToast(notification);

          // Play notification audio chime
          playNotificationSound();

          // Dispatch custom event so pages like StaffServiceRequestsPage and StaffServiceRequestDetailPage can update in real-time
          window.dispatchEvent(
            new CustomEvent("repairlink_staff_notification_received", {
              detail: notification,
            })
          );
        } catch {
          // Ignore parse errors
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
  }, [isStaff, playNotificationSound]);

  const dismissToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationId) return;

    // Optimistically update notifications & unreadCount
    setNotifications((prev) =>
      prev.map((n) =>
        n.notificationId === notificationId ? { ...n, isRead: true } : n
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));

    try {
      await apiMarkAsRead(notificationId);
    } catch {
      // Ignore failure
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistically mark all as read
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await apiMarkAllAsRead();
    } catch {
      // Ignore failure
    }
  }, []);

  // Mark all notifications referencing a specific service request as read
  // (e.g. when staff visits the detail page or clicks "View Request")
  const markReferenceAsRead = useCallback(async (referenceId) => {
    if (!referenceId) return;

    setNotifications((prev) => {
      const matchingUnread = prev.filter(
        (n) => n.referenceId === referenceId && !n.isRead
      );

      if (matchingUnread.length === 0) return prev;

      // Deduct unread count immediately
      setUnreadCount((count) => Math.max(0, count - matchingUnread.length));

      // Call API for each matching unread notification in background
      matchingUnread.forEach((item) => {
        apiMarkAsRead(item.notificationId).catch(() => {});
      });

      return prev.map((n) =>
        n.referenceId === referenceId ? { ...n, isRead: true } : n
      );
    });
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    latestToast,
    dismissToast,
    markAsRead,
    markAllAsRead,
    markReferenceAsRead,
    refreshNotifications: fetchNotifications,
  };

  return (
    <StaffNotificationContext.Provider value={value}>
      {children}
    </StaffNotificationContext.Provider>
  );
}

export function useStaffNotificationContext() {
  const context = useContext(StaffNotificationContext);
  if (!context) {
    throw new Error(
      "useStaffNotificationContext must be used within a StaffNotificationProvider"
    );
  }
  return context;
}
