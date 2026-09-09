import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import {
  getCustomerNotifications,
  markCustomerNotificationAsRead as apiMarkAsRead,
  markAllCustomerNotificationsAsRead as apiMarkAllAsRead,
} from "../features/notifications/customerNotificationApi";
import { getStoredAuthSession } from "../utils/auth";

const CustomerNotificationContext = createContext(null);

export function CustomerNotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [latestToast, setLatestToast] = useState(null);
  const [customerUser, setCustomerUser] = useState(() => {
    const session = getStoredAuthSession();
    return session.user?.role === "CUSTOMER" ? session.user : null;
  });

  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);

  useEffect(() => {
    const handleAuthUpdate = () => {
      const session = getStoredAuthSession();
      setCustomerUser(session.user?.role === "CUSTOMER" ? session.user : null);
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
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      // Ignore audio error
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    if (!customerUser) {
      setNotifications([]);
      setUnreadCount(0);
      setLoading(false);
      return;
    }
    try {
      const data = await getCustomerNotifications();
      const notis = data.notifications || [];
      setNotifications(notis);
      const computedUnread =
        data.unreadCount !== undefined
          ? data.unreadCount
          : notis.filter((n) => !n.isRead).length;
      setUnreadCount(computedUnread);
    } catch {
      // Ignore error
    } finally {
      setLoading(false);
    }
  }, [customerUser]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  // WebSocket Connection for Customer
  useEffect(() => {
    if (!customerUser || !customerUser.id) return;

    let isMounted = true;

    function connectWebSocket() {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        return;
      }

      const socketUrl = `ws://localhost:8080/ws/customer-notifications?userId=${customerUser.id}`;
      const ws = new WebSocket(socketUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);

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

          setUnreadCount((prev) => prev + 1);
          setLatestToast(notification);
          playNotificationSound();

          // Dispatch event so active pages (e.g. ActiveServicePage) react immediately without reload
          window.dispatchEvent(
            new CustomEvent("repairlink_customer_notification_received", {
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
  }, [customerUser, playNotificationSound]);

  const dismissToast = useCallback(() => {
    setLatestToast(null);
  }, []);

  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationId) return;

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
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);

    try {
      await apiMarkAllAsRead();
    } catch {
      // Ignore failure
    }
  }, []);

  const value = {
    notifications,
    unreadCount,
    loading,
    latestToast,
    dismissToast,
    markAsRead,
    markAllAsRead,
    refreshNotifications: fetchNotifications,
  };

  return (
    <CustomerNotificationContext.Provider value={value}>
      {children}
    </CustomerNotificationContext.Provider>
  );
}

export function useCustomerNotifications() {
  const context = useContext(CustomerNotificationContext);
  if (!context) {
    throw new Error(
      "useCustomerNotifications must be used within a CustomerNotificationProvider"
    );
  }
  return context;
}
