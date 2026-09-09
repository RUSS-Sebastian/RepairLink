import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Clock3,
  ExternalLink,
  Eye,
  Filter,
  Gauge,
  LoaderCircle,
  Sparkles,
  XCircle,
} from "lucide-react";
import {
  getStaffNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../features/notifications/staffNotificationApi";

export default function StaffNotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL"); // ALL or UNREAD
  const [markingId, setMarkingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = async () => {
    try {
      const data = await getStaffNotifications();
      setNotifications(data.notifications || []);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id) => {
    setMarkingId(id);
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.notificationId === id ? { ...n, isRead: true } : n))
      );
    } catch {
      // Ignore
    } finally {
      setMarkingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    setMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // Ignore
    } finally {
      setMarkingAll(false);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now - date) / 1000);

    if (diffSec < 60) return "Just now";
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Center Notifications
            </h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center rounded-full bg-[#0261F3] px-2.5 py-0.5 text-xs font-bold text-white shadow-sm">
                {unreadCount} unread
              </span>
            )}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Real-time activity alerts and customer service request notifications.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={handleMarkAllRead}
            disabled={markingAll}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
          >
            {markingAll ? (
              <LoaderCircle size={16} className="animate-spin text-slate-500" />
            ) : (
              <CheckCheck size={16} className="text-[#0261F3]" />
            )}
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          type="button"
          onClick={() => setFilter("ALL")}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
            filter === "ALL"
              ? "bg-[#EAF3FF] text-[#0261F3]"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter("UNREAD")}
          className={`rounded-lg px-3.5 py-1.5 text-sm font-semibold transition ${
            filter === "UNREAD"
              ? "bg-[#EAF3FF] text-[#0261F3]"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <LoaderCircle size={28} className="animate-spin text-[#0261F3]" />
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0261F3]">
            <Bell size={26} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">
            {filter === "UNREAD" ? "No unread notifications" : "No notifications yet"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {filter === "UNREAD"
              ? "You're all caught up! New requests will appear here automatically."
              : "Notifications for new service requests and appointments will appear here."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((noti) => {
            const isCancelled = noti.type === "SERVICE_REQUEST_CANCELLED";
            return (
              <article
                key={noti.notificationId}
                className={`flex flex-col gap-4 rounded-2xl border p-5 transition sm:flex-row sm:items-center sm:justify-between ${
                  noti.isRead
                    ? "border-slate-200 bg-white text-slate-700"
                    : isCancelled
                      ? "border-red-200 bg-red-50/40 shadow-sm"
                      : "border-blue-200 bg-blue-50/40 shadow-sm"
                }`}
              >
                <div className="flex min-w-0 items-start gap-4">
                  <div
                    className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                      noti.isRead
                        ? "bg-slate-100 text-slate-500"
                        : isCancelled
                          ? "bg-red-100 text-red-600"
                          : "bg-[#EAF3FF] text-[#0261F3]"
                    }`}
                  >
                    {isCancelled ? <XCircle size={20} /> : <Gauge size={20} />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {noti.title}
                      </span>
                      {noti.referenceCode && (
                        <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                          {noti.referenceCode}
                        </span>
                      )}
                      {isCancelled && (
                        <span className="inline-flex items-center rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                          Cancelled
                        </span>
                      )}
                      {!noti.isRead && (
                        <span
                          className={`h-2 w-2 rounded-full ${
                            isCancelled ? "bg-red-500" : "bg-[#0261F3]"
                          }`}
                          title="Unread"
                        />
                      )}
                    </div>

                    <p className="mt-1 text-sm text-slate-600">
                      {noti.message}
                    </p>

                    <span className="mt-1.5 inline-flex items-center gap-1 text-xs text-slate-400">
                      <Clock3 size={12} />
                      {formatTime(noti.createdAt)}
                    </span>
                  </div>
                </div>

              <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                {!noti.isRead && (
                  <button
                    type="button"
                    onClick={() => handleMarkRead(noti.notificationId)}
                    disabled={markingId === noti.notificationId}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                  >
                    {markingId === noti.notificationId ? (
                      <LoaderCircle size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} className="text-[#0261F3]" />
                    )}
                    Mark read
                  </button>
                )}

                {noti.referenceId && (
                  <Link
                    to={`/staff/service-requests/${noti.referenceId}`}
                    onClick={() => {
                      if (!noti.isRead) {
                        handleMarkRead(noti.notificationId);
                      }
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-[#0261F3] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0256D6]"
                  >
                    <Eye size={14} />
                    View Details
                  </Link>
                )}
              </div>
            </article>
          );
        })}
        </div>
      )}
    </div>
  );
}
