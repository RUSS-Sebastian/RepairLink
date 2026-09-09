import { useState, useEffect, useCallback, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  CarFront,
  User,
  Mail,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  XCircle,
  X,
  ExternalLink,
  CalendarClock,
  Search,
  RefreshCw,
  Truck,
  Wrench,
  AlertTriangle,
  Info,
} from "lucide-react";
import {
  getStaffAppointments,
  getStaffAppointmentCounts,
  getStaffAppointmentDetail,
  getStaffScheduleWindow,
  markAppointmentArrived,
  markAppointmentNoShow,
} from "../../features/appointments/staffAppointmentApi";
import { ROUTES } from "../../constants/routes";

function pad2(n) {
  return String(n).padStart(2, "0");
}

function toLocalDateStr(date) {
  return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  const [y, m, d] = dateStr.split("-").map(Number);
  // Noon (12:00:00) avoids daylight savings and timezone boundary date shifts
  return new Date(y, m - 1, d, 12, 0, 0);
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatShortDate(dateStr) {
  if (!dateStr) return "";
  try {
    const d = parseLocalDate(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function addDays(dateStr, days) {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + days);
  return toLocalDateStr(d);
}

function formatTime12h(timeStr) {
  if (!timeStr) return "";
  const parts = timeStr.trim().split(":");
  if (parts.length < 2) return timeStr;
  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes} ${ampm}`;
}

export default function StaffAppointmentsPage() {
  const navigate = useNavigate();

  // Schedule window state
  const [scheduleWindow, setScheduleWindow] = useState(null);
  const [windowLoading, setWindowLoading] = useState(true);

  // Selected date (pure YYYY-MM-DD local string)
  const [selectedDate, setSelectedDate] = useState(() => {
    return toLocalDateStr(new Date());
  });

  // Appointments data (only confirmed and arrived appointments)
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [appointmentCounts, setAppointmentCounts] = useState({});

  // Filtering and search
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Detail Modal State
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Action feedback / toasts
  const [actionNotice, setActionNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [rescheduleTooltipId, setRescheduleTooltipId] = useState(null);

  // No-Show confirm modal state
  const [noShowConfirmApt, setNoShowConfirmApt] = useState(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  // Load schedule configuration window (full config range for staff)
  useEffect(() => {
    async function loadWindow() {
      try {
        setWindowLoading(true);
        const win = await getStaffScheduleWindow();
        setScheduleWindow(win);

        // Adjust selectedDate if outside window range
        if (win?.startDate && win?.endDate) {
          const todayStr = toLocalDateStr(new Date());
          if (todayStr >= win.startDate && todayStr <= win.endDate) {
            setSelectedDate(todayStr);
          } else {
            setSelectedDate(win.startDate);
          }
        }
      } catch (err) {
        console.error("Failed to load schedule window:", err);
      } finally {
        setWindowLoading(false);
      }
    }
    loadWindow();
  }, []);

  // Fetch appointments for selected date
  const fetchAppointments = useCallback(
    async (showSpinner = true) => {
      if (!selectedDate) return;
      if (showSpinner) setLoading(true);
      setError("");
      try {
        const data = await getStaffAppointments(selectedDate);
        // Only keep confirmed and arrived appointments
        const confirmedOnly = (data || []).filter(
          (apt) => apt.status === "CONFIRMED" || apt.status === "ARRIVED"
        );
        setAppointments(confirmedOnly);
      } catch (err) {
        if (showSpinner) {
          setError(err.message || "Failed to load appointments.");
        }
      } finally {
        if (showSpinner) setLoading(false);
      }
    },
    [selectedDate]
  );

  // Fetch range counts across current window
  const fetchCounts = useCallback(async () => {
    if (!scheduleWindow?.startDate || !scheduleWindow?.endDate) return;
    try {
      const counts = await getStaffAppointmentCounts(
        scheduleWindow.startDate,
        scheduleWindow.endDate
      );
      setAppointmentCounts(counts || {});
    } catch (err) {
      console.warn("Could not load appointment counts:", err);
    }
  }, [scheduleWindow]);

  useEffect(() => {
    fetchAppointments(true);
  }, [fetchAppointments]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  // Real-time synchronization
  useEffect(() => {
    const handleNotification = (event) => {
      const noti = event.detail;
      if (
        noti?.type === "APPOINTMENT_CONFIRMED" ||
        noti?.type === "APPOINTMENT_CANCELLED" ||
        noti?.type === "APPOINTMENT_ARRIVED" ||
        noti?.type === "APPOINTMENT_UPDATED" ||
        noti?.type === "SERVICE_REQUEST_CANCELLED"
      ) {
        // Silently reload appointments and counts without screen flicker
        fetchAppointments(false);
        fetchCounts();
      }
    };

    window.addEventListener("repairlink_staff_notification_received", handleNotification);
    return () => {
      window.removeEventListener("repairlink_staff_notification_received", handleNotification);
    };
  }, [fetchAppointments, fetchCounts]);

  // Handle Mark Arrived
  const handleMarkArrived = async (apt) => {
    setIsProcessingAction(true);
    setActionError("");
    try {
      const updated = await markAppointmentArrived(apt.appointmentId);
      setAppointments((prev) =>
        prev.map((item) =>
          item.appointmentId === apt.appointmentId ? updated : item
        )
      );
      if (selectedAppointment?.appointmentId === apt.appointmentId) {
        setSelectedAppointment(updated);
      }
      setActionNotice(
        `Vehicle marked as arrived for ${apt.appointmentCode} (${apt.vehicle?.licensePlate || ""}). Customer can no longer cancel.`
      );
      setTimeout(() => setActionNotice(""), 5000);
      fetchCounts();
    } catch (err) {
      setActionError(err.message || "Failed to mark vehicle as arrived.");
      setTimeout(() => setActionError(""), 5000);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // Handle Mark No-Show (removes from confirmed appointments list)
  const handleMarkNoShow = async () => {
    if (!noShowConfirmApt) return;
    setIsProcessingAction(true);
    setActionError("");
    try {
      await markAppointmentNoShow(noShowConfirmApt.appointmentId);
      // Remove from confirmed appointments list
      setAppointments((prev) =>
        prev.filter((item) => item.appointmentId !== noShowConfirmApt.appointmentId)
      );
      if (selectedAppointment?.appointmentId === noShowConfirmApt.appointmentId) {
        setSelectedAppointment(null);
      }
      const removedCode = noShowConfirmApt.appointmentCode;
      setNoShowConfirmApt(null);
      setActionNotice(
        `Appointment ${removedCode} marked as No-Show. The appointment and service request have been cancelled and removed.`
      );
      setTimeout(() => setActionNotice(""), 5000);
      fetchCounts();
    } catch (err) {
      setActionError(err.message || "Failed to mark appointment as no-show.");
      setTimeout(() => setActionError(""), 5000);
    } finally {
      setIsProcessingAction(false);
    }
  };

  // View Appointment Details
  const handleViewDetails = async (apt) => {
    setSelectedAppointment(apt);
    setDetailLoading(true);
    try {
      const fullDetail = await getStaffAppointmentDetail(apt.appointmentId);
      setSelectedAppointment(fullDetail);
    } catch {
      // Fallback to existing summary in row
    } finally {
      setDetailLoading(false);
    }
  };

  // Date navigation helpers using pure local date math
  const handlePrevDay = () => {
    if (!selectedDate) return;
    const prevStr = addDays(selectedDate, -1);
    if (scheduleWindow?.startDate && prevStr < scheduleWindow.startDate) return;
    setSelectedDate(prevStr);
  };

  const handleNextDay = () => {
    if (!selectedDate) return;
    const nextStr = addDays(selectedDate, 1);
    if (scheduleWindow?.endDate && nextStr > scheduleWindow.endDate) return;
    setSelectedDate(nextStr);
  };

  const handleToday = () => {
    const todayStr = toLocalDateStr(new Date());
    if (scheduleWindow?.startDate && scheduleWindow?.endDate) {
      if (todayStr >= scheduleWindow.startDate && todayStr <= scheduleWindow.endDate) {
        setSelectedDate(todayStr);
      } else {
        setSelectedDate(scheduleWindow.startDate);
      }
    } else {
      setSelectedDate(todayStr);
    }
  };

  // Date strip generation for current config (pure local YYYY-MM-DD strings)
  const dateStripList = useMemo(() => {
    if (!scheduleWindow?.startDate || !scheduleWindow?.endDate) return [];
    const list = [];
    let curr = parseLocalDate(scheduleWindow.startDate);
    const end = parseLocalDate(scheduleWindow.endDate);
    const todayStr = toLocalDateStr(new Date());

    while (curr <= end) {
      const iso = toLocalDateStr(curr);
      list.push({
        dateStr: iso,
        dayOfWeek: curr.toLocaleDateString("en-US", { weekday: "short" }),
        dayNumber: curr.getDate(),
        isToday: iso === todayStr,
      });
      curr.setDate(curr.getDate() + 1);
    }
    return list;
  }, [scheduleWindow]);

  // Status badge styling helper
  const getStatusInfo = (status) => {
    switch (status) {
      case "CONFIRMED":
        return {
          label: "Vehicle Waiting",
          bg: "bg-amber-50 text-amber-800 border-amber-200",
          dot: "bg-amber-500",
        };
      case "ARRIVED":
        return {
          label: "Vehicle Arrived",
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dot: "bg-emerald-500",
        };
      default:
        return {
          label: status || "Confirmed",
          bg: "bg-blue-50 text-blue-800 border-blue-200",
          dot: "bg-blue-500",
        };
    }
  };

  // Filtered confirmed appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      // Exclude any cancelled or no-show
      if (apt.status === "CANCELLED" || apt.status === "NO_SHOW") return false;

      // Status filter
      if (statusFilter === "WAITING" && apt.status !== "CONFIRMED") return false;
      if (statusFilter === "ARRIVED" && apt.status !== "ARRIVED") return false;

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const code = apt.appointmentCode?.toLowerCase() || "";
        const customer = apt.customer?.fullName?.toLowerCase() || "";
        const plate = apt.vehicle?.licensePlate?.toLowerCase() || "";
        const make = apt.vehicle?.make?.toLowerCase() || "";
        const model = apt.vehicle?.model?.toLowerCase() || "";
        const reqCode = apt.requestCode?.toLowerCase() || "";
        return (
          code.includes(q) ||
          customer.includes(q) ||
          plate.includes(q) ||
          make.includes(q) ||
          model.includes(q) ||
          reqCode.includes(q)
        );
      }

      return true;
    });
  }, [appointments, statusFilter, searchQuery]);

  // Counts for confirmed appointments
  const counts = useMemo(() => {
    let waiting = 0;
    let arrived = 0;
    for (const apt of appointments) {
      if (apt.status === "CONFIRMED") waiting++;
      else if (apt.status === "ARRIVED") arrived++;
    }
    return {
      total: waiting + arrived,
      waiting,
      arrived,
    };
  }, [appointments]);

  const isMinDate =
    scheduleWindow?.startDate && selectedDate <= scheduleWindow.startDate;
  const isMaxDate =
    scheduleWindow?.endDate && selectedDate >= scheduleWindow.endDate;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16 pt-4 text-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Top Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#0261F3] ring-1 ring-inset ring-blue-700/10">
                <CalendarDays size={13} />
                Staff Workshop Portal
              </span>
              {scheduleWindow && (
                <span className="hidden items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 sm:inline-flex">
                  Config Window: {scheduleWindow.configurationName || "Active Window"} (
                  {formatShortDate(scheduleWindow.startDate)} –{" "}
                  {formatShortDate(scheduleWindow.endDate)})
                </span>
              )}
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Appointments Schedule
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage confirmed customer appointments, vehicle check-ins, and workshop arrivals in real time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                fetchAppointments(true);
                fetchCounts();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <Link
              to={ROUTES.STAFF_SERVICE_REQUESTS}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
            >
              <Wrench size={14} />
              Service Requests
            </Link>
          </div>
        </div>

        {/* Action feedback notifications */}
        {actionNotice && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 shadow-sm animate-in fade-in duration-200">
            <CheckCircle2 size={18} className="mt-0.5 shrink-0 text-emerald-600" />
            <span className="font-medium">{actionNotice}</span>
          </div>
        )}

        {actionError && (
          <div className="mb-4 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm animate-in fade-in duration-200">
            <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-600" />
            <span className="font-medium">{actionError}</span>
          </div>
        )}

        {/* Date Navigation & Calendar Strip Card */}
        <div className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          {/* Controls Bar */}
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Prev / Current / Next Date Controller */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 p-0.5 shadow-sm">
                <button
                  onClick={handlePrevDay}
                  disabled={isMinDate}
                  title="Previous Day"
                  className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronLeft size={18} />
                </button>
                <div className="px-3 py-1 text-center font-semibold text-slate-900 sm:min-w-[220px]">
                  <span className="text-sm sm:text-base">
                    {formatDisplayDate(selectedDate)}
                  </span>
                </div>
                <button
                  onClick={handleNextDay}
                  disabled={isMaxDate}
                  title="Next Day"
                  className="rounded-lg p-1.5 text-slate-600 transition hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:hover:bg-transparent"
                >
                  <ChevronRight size={18} />
                </button>
              </div>

              <button
                onClick={handleToday}
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
              >
                Today
              </button>

              {/* Native Date Picker bound to configuration window (pure YYYY-MM-DD matching) */}
              <div className="relative">
                <input
                  type="date"
                  min={scheduleWindow?.startDate || undefined}
                  max={scheduleWindow?.endDate || undefined}
                  value={selectedDate}
                  onChange={(e) => {
                    if (e.target.value) setSelectedDate(e.target.value);
                  }}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 focus:border-[#0261F3] focus:outline-none focus:ring-1 focus:ring-[#0261F3]"
                />
              </div>
            </div>

            {/* Daily Total Summary Badge - ONLY CONFIRMED APPOINTMENTS */}
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-blue-50/70 border border-blue-200/60 px-4 py-2 text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                  Confirmed Appointments on this Date
                </p>
                <p className="text-xl font-black text-slate-900">
                  {loading ? "..." : counts.total}{" "}
                  <span className="text-sm font-normal text-slate-500">
                    {counts.total === 1 ? "Confirmed Appointment" : "Confirmed Appointments"}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Date Strip */}
          {dateStripList.length > 0 && (
            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">
                  Config window dates ({scheduleWindow?.configurationName}):
                </span>
                <span className="text-xs text-slate-400">
                  Click any day to inspect confirmed appointments
                </span>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 pt-1 scrollbar-thin">
                {dateStripList.map((item) => {
                  const isSelected = item.dateStr === selectedDate;
                  const dayCount = appointmentCounts[item.dateStr] || 0;
                  return (
                    <button
                      key={item.dateStr}
                      onClick={() => setSelectedDate(item.dateStr)}
                      className={`relative flex min-w-[62px] shrink-0 flex-col items-center rounded-xl p-2.5 transition ${
                        isSelected
                          ? "bg-[#0261F3] text-white shadow-md shadow-blue-500/25"
                          : "border border-slate-200 bg-slate-50/50 text-slate-700 hover:border-slate-300 hover:bg-white"
                      }`}
                    >
                      <span
                        className={`text-[11px] font-semibold uppercase ${
                          isSelected ? "text-blue-100" : "text-slate-500"
                        }`}
                      >
                        {item.dayOfWeek}
                      </span>
                      <span className="mt-0.5 text-base font-bold">
                        {item.dayNumber}
                      </span>

                      {/* Appointment badge indicator */}
                      {dayCount > 0 ? (
                        <span
                          className={`mt-1.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-extrabold ${
                            isSelected
                              ? "bg-white text-[#0261F3]"
                              : "bg-blue-600 text-white"
                          }`}
                        >
                          {dayCount}
                        </span>
                      ) : (
                        <span className="mt-1.5 h-4 text-[10px] opacity-0">-</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Filter and Search Bar - ONLY CONFIRMED APPOINTMENTS */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Status Tabs */}
          <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setStatusFilter("ALL")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === "ALL"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              All Confirmed ({counts.total})
            </button>
            <button
              onClick={() => setStatusFilter("WAITING")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === "WAITING"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Vehicle Waiting ({counts.waiting})
            </button>
            <button
              onClick={() => setStatusFilter("ARRIVED")}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === "ARRIVED"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              Vehicle Arrived ({counts.arrived})
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-full sm:w-72">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search code, customer, car..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-[#0261F3] focus:outline-none focus:ring-1 focus:ring-[#0261F3]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Confirmed Appointments List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white py-16 text-center shadow-sm">
            <RefreshCw size={28} className="animate-spin text-blue-600" />
            <p className="mt-3 text-sm font-semibold text-slate-800">
              Loading confirmed appointments for {formatDisplayDate(selectedDate)}...
            </p>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700 shadow-sm">
            <AlertCircle size={24} className="mx-auto mb-2 text-red-500" />
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => fetchAppointments(true)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700"
            >
              <RefreshCw size={13} />
              Try Again
            </button>
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CalendarDays size={26} />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">
              No Confirmed Appointments on {formatDisplayDate(selectedDate)}
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
              {statusFilter !== "ALL" || searchQuery
                ? "No confirmed appointments match your current status filter or search term."
                : "There are no confirmed appointments scheduled for this workshop date."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredAppointments.map((apt) => {
              const statusInfo = getStatusInfo(apt.status);
              const isConfirmed = apt.status === "CONFIRMED";
              const isArrived = apt.status === "ARRIVED";
              const isPickup = apt.handoverMethod === "PICKUP";

              return (
                <div
                  key={apt.appointmentId}
                  className={`group relative rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5 ${
                    isArrived
                      ? "border-emerald-200/80 bg-emerald-50/10"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    {/* Left: Time, Code, Customer & Vehicle info */}
                    <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                      {/* Starting Time & Duration Box */}
                      <div className="flex shrink-0 items-center gap-3 sm:flex-col sm:items-start sm:border-r sm:border-slate-100 sm:pr-5">
                        <div className="flex items-center gap-1.5 text-sm font-black text-slate-900 sm:text-base">
                          <Clock size={16} className="text-[#0261F3]" />
                          <span>{formatTime12h(apt.startTime) || apt.timeSlot}</span>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {apt.durationMinutes || 60} mins
                        </span>
                      </div>

                      {/* Details Column */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-xs font-bold tracking-tight text-[#0261F3]">
                            {apt.appointmentCode}
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="text-xs font-semibold text-slate-900">
                            {apt.customer?.fullName || "Customer"}
                          </span>

                          {/* Handover Method Badge */}
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              isPickup
                                ? "bg-purple-50 text-purple-700 border border-purple-200"
                                : "bg-slate-100 text-slate-600 border border-slate-200"
                            }`}
                          >
                            {isPickup ? (
                              <>
                                <Truck size={12} />
                                Pick-up
                              </>
                            ) : (
                              <>
                                <CarFront size={12} />
                                Drop-off
                              </>
                            )}
                          </span>

                          {/* Status Badge - Default is Vehicle Waiting */}
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusInfo.bg}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${statusInfo.dot}`} />
                            {statusInfo.label}
                          </span>
                        </div>

                        {/* Vehicle Information */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                          <span className="font-medium text-slate-900">
                            {apt.vehicle?.year} {apt.vehicle?.make} {apt.vehicle?.model}
                          </span>
                          {apt.vehicle?.licensePlate && (
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[11px] font-semibold text-slate-700">
                              {apt.vehicle.licensePlate}
                            </span>
                          )}
                          {apt.vehicle?.color && (
                            <span className="text-slate-400">
                              ({apt.vehicle.color})
                            </span>
                          )}
                          {apt.requestCode && (
                            <span className="text-slate-400">
                              • Ref: {apt.requestCode}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 sm:justify-end">
                      {/* Clickable Reschedule Icon (placeholder) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => {
                            setRescheduleTooltipId(
                              rescheduleTooltipId === apt.appointmentId
                                ? null
                                : apt.appointmentId
                            );
                          }}
                          title="Reschedule appointment"
                          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/50 hover:text-[#0261F3]"
                        >
                          <CalendarClock size={16} />
                        </button>
                        {rescheduleTooltipId === apt.appointmentId && (
                          <div className="absolute right-0 top-11 z-20 w-52 rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-700 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                            <div className="flex items-center justify-between pb-1 font-bold text-slate-900">
                              <span>Reschedule</span>
                              <button
                                onClick={() => setRescheduleTooltipId(null)}
                                className="text-slate-400 hover:text-slate-600"
                              >
                                <X size={12} />
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-500">
                              Reschedule slot functionality will be enabled in upcoming slot management update.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Mark Arrived Action */}
                      {isConfirmed && (
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => handleMarkArrived(apt)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 shadow-sm transition hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                        >
                          <CheckCircle2 size={14} className="text-emerald-600" />
                          Mark Arrived
                        </button>
                      )}

                      {/* Mark No-Show Action */}
                      {isConfirmed && (
                        <button
                          type="button"
                          disabled={isProcessingAction}
                          onClick={() => setNoShowConfirmApt(apt)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50 hover:text-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/30"
                        >
                          <XCircle size={14} />
                          Mark No-Show
                        </button>
                      )}

                      {/* Already Arrived Badge */}
                      {isArrived && (
                        <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-100 px-3 py-2 text-xs font-semibold text-emerald-800">
                          <CheckCircle2 size={14} />
                          Vehicle Checked In
                        </span>
                      )}

                      {/* View Details Button */}
                      <button
                        type="button"
                        onClick={() => handleViewDetails(apt)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 hover:text-slate-900"
                      >
                        <span>View</span>
                        <ExternalLink size={13} className="text-slate-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Appointment Detail Modal */}
        {selectedAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0261F3]">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-slate-900">
                        {selectedAppointment.appointmentCode}
                      </h3>
                      {(() => {
                        const sInfo = getStatusInfo(selectedAppointment.status);
                        return (
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${sInfo.bg}`}
                          >
                            <span className={`h-1.5 w-1.5 rounded-full ${sInfo.dot}`} />
                            {sInfo.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-xs text-slate-500">
                      Confirmed appointment details and workshop schedule
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedAppointment(null)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body - Scrollable */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {detailLoading && (
                  <div className="flex items-center justify-center py-4 text-xs font-semibold text-blue-600">
                    <RefreshCw size={14} className="mr-2 animate-spin" />
                    Refreshing details...
                  </div>
                )}

                {/* Schedule & Handover Grid */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Date &amp; Time
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {formatDisplayDate(selectedAppointment.appointmentDate)}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                      <Clock size={13} className="text-[#0261F3]" />
                      <span>
                        Starting: {formatTime12h(selectedAppointment.startTime) || selectedAppointment.timeSlot}
                      </span>
                      <span>•</span>
                      <span>Duration: {selectedAppointment.durationMinutes || 60} mins</span>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Handover Method
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {selectedAppointment.handoverMethod === "PICKUP"
                        ? "Vehicle Pick-up"
                        : "Customer Drop-off"}
                    </p>
                    {selectedAppointment.pickupLocation && (
                      <div className="mt-1 flex items-start gap-1 text-xs text-slate-600">
                        <MapPin size={13} className="mt-0.5 shrink-0 text-purple-600" />
                        <span>{selectedAppointment.pickupLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Service Request Link Banner */}
                {selectedAppointment.requestCode && (
                  <div className="flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-blue-700">
                        Associated Service Request
                      </p>
                      <p className="text-sm font-semibold text-slate-900">
                        Request Code:{" "}
                        <span className="font-mono font-bold text-[#0261F3]">
                          {selectedAppointment.requestCode}
                        </span>
                      </p>
                    </div>
                    {selectedAppointment.serviceRequestId ? (
                      <Link
                        to={`/staff/service-requests/${selectedAppointment.serviceRequestId}`}
                        className="inline-flex items-center gap-1.5 rounded-xl bg-[#0261F3] px-3.5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-blue-700"
                      >
                        <span>View Request Details</span>
                        <ExternalLink size={13} />
                      </Link>
                    ) : (
                      <span className="font-mono text-xs font-bold text-slate-500">
                        {selectedAppointment.requestCode}
                      </span>
                    )}
                  </div>
                )}

                {/* Customer Information */}
                <div className="rounded-2xl border border-slate-200 p-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Customer Information
                  </h4>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div>
                      <span className="text-[11px] text-slate-400">Full Name</span>
                      <p className="font-semibold text-slate-900">
                        {selectedAppointment.customer?.fullName || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Email</span>
                      <p className="text-xs font-medium text-slate-700">
                        {selectedAppointment.customer?.email || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Phone</span>
                      <p className="text-xs font-medium text-slate-700">
                        {selectedAppointment.customer?.phone || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Vehicle Information */}
                <div className="rounded-2xl border border-slate-200 p-4">
                  <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Vehicle Details
                  </h4>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div>
                      <span className="text-[11px] text-slate-400">Make &amp; Model</span>
                      <p className="font-semibold text-slate-900">
                        {selectedAppointment.vehicle?.make} {selectedAppointment.vehicle?.model}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Year</span>
                      <p className="font-semibold text-slate-900">
                        {selectedAppointment.vehicle?.year || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">License Plate</span>
                      <p className="font-mono font-bold text-slate-900">
                        {selectedAppointment.vehicle?.licensePlate || "—"}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400">Color</span>
                      <p className="font-semibold text-slate-900">
                        {selectedAppointment.vehicle?.color || "—"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Problem Description if provided */}
                {selectedAppointment.problemDescription && (
                  <div className="rounded-2xl border border-slate-200 p-4">
                    <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                      Problem Reported by Customer
                    </h4>
                    <p className="text-xs leading-relaxed text-slate-700">
                      {selectedAppointment.problemDescription}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4 rounded-b-3xl">
                <div className="text-xs text-slate-500">
                  {selectedAppointment.status === "ARRIVED" && (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 size={14} /> Vehicle has arrived. Customer cancellation is locked.
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {selectedAppointment.status === "CONFIRMED" && (
                    <>
                      <button
                        type="button"
                        disabled={isProcessingAction}
                        onClick={() => handleMarkArrived(selectedAppointment)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-50"
                      >
                        <CheckCircle2 size={14} />
                        Mark Arrived
                      </button>

                      <button
                        type="button"
                        disabled={isProcessingAction}
                        onClick={() => setNoShowConfirmApt(selectedAppointment)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3.5 py-2 text-xs font-semibold text-rose-600 shadow-sm transition hover:bg-rose-50"
                      >
                        <XCircle size={14} />
                        Mark No-Show
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() => setSelectedAppointment(null)}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* No-Show Confirmation Modal */}
        {noShowConfirmApt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-150">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                <AlertTriangle size={24} />
              </div>
              <h3 className="mt-4 text-center text-lg font-bold text-slate-900">
                Mark as No-Show?
              </h3>
              <p className="mt-2 text-center text-xs leading-relaxed text-slate-600">
                Are you sure you want to mark appointment{" "}
                <span className="font-bold text-slate-900">
                  {noShowConfirmApt.appointmentCode}
                </span>{" "}
                as No-Show?
              </p>
              <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                <strong>Important:</strong> Marking as No-Show will cancel this appointment,
                cancel the associated service request, release the slot hold, and notify the customer.
                It will be removed from the confirmed appointments list.
              </div>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={isProcessingAction}
                  onClick={() => setNoShowConfirmApt(null)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessingAction}
                  onClick={handleMarkNoShow}
                  className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-rose-700 disabled:opacity-50"
                >
                  {isProcessingAction ? "Updating..." : "Confirm No-Show"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
