import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Info,
  LoaderCircle,
  MapPin,
  Plus,
  RefreshCw,
  Sparkles,
  Truck,
  Wrench,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import {
  getActiveAppointments,
  cancelCustomerAppointment,
} from "../../features/appointments/customerAppointmentApi";
import { ROUTES } from "../../constants/routes";

const QUICK_CANCEL_REASONS = [
  "Schedule conflict",
  "Vehicle issue resolved elsewhere",
  "Need to reschedule for another date",
  "Unexpected personal emergency",
  "Vehicle no longer operational / towed",
];

export default function AppointmentsPage() {
  const [searchParams] = useSearchParams();
  const highlightedAppointmentId = searchParams.get("id");

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionFeedback, setActionFeedback] = useState("");

  // Cancel modal state
  const [cancellingAppointment, setCancellingAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [pointDeductionAcknowledged, setPointDeductionAcknowledged] = useState(false);

  const fetchAppointments = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const data = await getActiveAppointments();
      setAppointments(data || []);
    } catch (err) {
      if (showSpinner) {
        setError(err.message || "Failed to load active appointments.");
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments(true);

    // Real-time synchronization
    const handleNotification = (event) => {
      const noti = event.detail;
      if (
        noti?.type === "APPOINTMENT_CONFIRMED" ||
        noti?.type === "APPOINTMENT_ARRIVED" ||
        noti?.type === "APPOINTMENT_UPDATED" ||
        noti?.type === "APPOINTMENT_CANCELLED"
      ) {
        // Silently reload active appointments
        fetchAppointments(false);
      }
    };

    window.addEventListener(
      "repairlink_customer_notification_received",
      handleNotification
    );
    return () => {
      window.removeEventListener(
        "repairlink_customer_notification_received",
        handleNotification
      );
    };
  }, [fetchAppointments]);

  const handleOpenCancelModal = (apt) => {
    setCancellingAppointment(apt);
    setCancelReason("");
    setCancelError("");
    setPointDeductionAcknowledged(false);
  };

  const handleCloseCancelModal = () => {
    if (isSubmittingCancel) return;
    setCancellingAppointment(null);
    setCancelReason("");
    setCancelError("");
    setPointDeductionAcknowledged(false);
  };

  const handleConfirmCancel = async () => {
    if (!cancellingAppointment) return;

    if (!cancelReason.trim() || cancelReason.trim().length < 5) {
      setCancelError("Please provide a reason with at least 5 characters.");
      return;
    }

    if (!pointDeductionAcknowledged) {
      setCancelError("Please acknowledge the 20 loyalty point deduction fee.");
      return;
    }

    setIsSubmittingCancel(true);
    setCancelError("");

    try {
      await cancelCustomerAppointment(
        cancellingAppointment.appointmentId,
        cancelReason.trim()
      );

      // Instantly remove appointment from state without reloading
      setAppointments((prev) =>
        prev.filter((a) => a.appointmentId !== cancellingAppointment.appointmentId)
      );

      // Notify other views (Active Service page, Loyalty page) without reload
      window.dispatchEvent(
        new CustomEvent("repairlink_appointment_cancelled_by_customer", {
          detail: {
            appointmentId: cancellingAppointment.appointmentId,
            appointmentCode: cancellingAppointment.appointmentCode,
          },
        })
      );

      setActionFeedback(
        `Appointment ${cancellingAppointment.appointmentCode} has been cancelled. 20 loyalty points were deducted from your account.`
      );
      setCancellingAppointment(null);
      setTimeout(() => setActionFeedback(""), 8000);
    } catch (err) {
      setCancelError(err.message || "Failed to cancel appointment.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return "Date TBD";
    try {
      if (Array.isArray(dateInput)) {
        const [y, m, d] = dateInput;
        const dt = new Date(y, m - 1, d);
        return dt.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      const dateString = String(dateInput);
      const parts = dateString.split("-");
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
        });
      }
      return dateString;
    } catch {
      return String(dateInput || "");
    }
  };

  return (
    <div className="min-h-full bg-[#F3F8FF] pb-16">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ─── Hero Header ─── */}
        <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-8">
          <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border-[24px] border-blue-500/20" />
          <div className="absolute -bottom-10 right-32 h-36 w-36 rounded-full border-[16px] border-emerald-500/10" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">
                <CalendarDays size={13} className="text-emerald-400" />
                Active Service Appointments
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Confirmed Appointments
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Your confirmed service bookings and technician reservations.
                Review time slots, vehicle handover details, and status updates.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => fetchAppointments(true)}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                Refresh
              </button>
              <Link
                to={ROUTES.SERVICE_REQUEST}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition hover:bg-[#0256D6]"
              >
                <Plus size={14} />
                New Service Request
              </Link>
            </div>
          </div>
        </header>

        {/* ─── Feedback Banner ─── */}
        {actionFeedback && (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={18} />
              </div>
              <span className="font-medium">{actionFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setActionFeedback("")}
              className="text-emerald-500 hover:text-emerald-800"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ─── Error Alert ─── */}
        {error && (
          <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900 shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle size={20} className="text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              type="button"
              onClick={() => setError("")}
              className="text-red-500 hover:text-red-800"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* ─── Main Content ─── */}
        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <LoaderCircle size={36} className="animate-spin text-[#0261F3]" />
              <p className="text-sm font-semibold text-slate-600">
                Loading your active appointments...
              </p>
            </div>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex min-h-[380px] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-xs">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0261F3] shadow-inner">
              <CalendarDays size={32} />
            </div>
            <h3 className="mt-5 text-lg font-bold text-slate-900">
              No Active Appointments
            </h3>
            <p className="mt-2 max-w-md text-sm text-slate-500 leading-relaxed">
              You do not have any confirmed appointments right now. Once our workshop team confirms your submitted service request, your scheduled slot and vehicle details will appear here.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                to={ROUTES.ACTIVE_SERVICE}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                View Pending Requests
              </Link>
              <Link
                to={ROUTES.SERVICE_REQUEST}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#0256D6]"
              >
                <Plus size={14} />
                Book Service Request
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between px-1">
              <p className="text-sm font-bold text-slate-700">
                {appointments.length} active scheduled {appointments.length === 1 ? "appointment" : "appointments"}
              </p>
              <span className="text-xs text-slate-400">
                Live synchronization active
              </span>
            </div>

            {appointments.map((apt) => {
              const v = apt.vehicle;
              const isEv = v?.vehicleType === "EV";
              const VehicleIcon = isEv ? Zap : CarFront;
              const isHighlighted = highlightedAppointmentId === apt.appointmentId;

              return (
                <article
                  key={apt.appointmentId}
                  id={`apt-${apt.appointmentId}`}
                  className={`overflow-hidden rounded-3xl border bg-white shadow-sm transition hover:shadow-md ${
                    isHighlighted
                      ? "border-[#0261F3] ring-2 ring-blue-500/20"
                      : "border-slate-200"
                  }`}
                >
                  {/* Card Header Bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/70 px-6 py-4">
                    <div className="flex flex-wrap items-center gap-3">
                      {/* Unique Appointment Code */}
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-300 bg-blue-50 px-3.5 py-1 font-mono text-xs font-extrabold text-[#0261F3] shadow-xs">
                        <span className="text-[10px] font-bold text-blue-400">#</span>
                        {apt.appointmentCode}
                      </span>

                      {/* Status Badge */}
                      {apt.status === "ARRIVED" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300 bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800 shadow-xs">
                          <CheckCircle2 size={13} strokeWidth={2.5} className="text-emerald-700" />
                          Vehicle Checked In (Arrived)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 shadow-xs">
                          <Check size={13} strokeWidth={2.5} className="text-emerald-600" />
                          Confirmed &amp; Scheduled
                        </span>
                      )}

                      {/* Linked Service Request */}
                      {apt.serviceRequestCode && (
                        <span className="text-xs font-medium text-slate-500">
                          Ref: <span className="font-mono font-semibold text-slate-700">{apt.serviceRequestCode}</span>
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] font-medium text-slate-400">
                      Confirmed by: <span className="font-semibold text-slate-600">{apt.confirmedBy || "Workshop Staff"}</span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-6 space-y-6">
                    {/* Primary Highlight Grid: Date, Time Slot & Handover */}
                    <div className="grid gap-4 sm:grid-cols-3">
                      {/* Appointment Date */}
                      <div className="flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0261F3] text-white shadow-sm">
                          <Calendar size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-blue-700">
                            Appointment Date
                          </p>
                          <p className="truncate text-sm font-bold text-slate-900 mt-0.5">
                            {formatDate(apt.appointmentDate)}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {Array.isArray(apt.appointmentDate) ? apt.appointmentDate.join("-") : String(apt.appointmentDate || "")}
                          </p>
                        </div>
                      </div>

                      {/* Time Slot Range */}
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                          <Clock size={20} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Reserved Time Slot
                          </p>
                          <p className="truncate text-sm font-bold text-slate-900 mt-0.5">
                            {apt.timeSlot || "Standard Workshop Slot"}
                          </p>
                          <p className="text-[11px] text-emerald-600 font-medium">
                            Technician slot locked
                          </p>
                        </div>
                      </div>

                      {/* Handover Method & Location */}
                      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700">
                          {apt.handoverMethod === "CONCIERGE_PICKUP" || apt.handoverMethod === "PICKUP" ? (
                            <Truck size={20} />
                          ) : (
                            <MapPin size={20} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            Handover Method
                          </p>
                          <p className="truncate text-sm font-bold text-slate-900 mt-0.5">
                            {apt.handoverMethod === "CONCIERGE_PICKUP" || apt.handoverMethod === "PICKUP"
                              ? "Concierge Valet Pickup"
                              : "Customer Drop-off"}
                          </p>
                          <p className="truncate text-[11px] text-slate-500">
                            {apt.handoverMethod === "CONCIERGE_PICKUP" || apt.handoverMethod === "PICKUP"
                              ? (apt.pickupLocation || "Address on record")
                              : "RepairLink Workshop Main Branch"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Vehicle Details Card */}
                    {v && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-[#0261F3]">
                              <VehicleIcon size={18} />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900">
                                {v.nickname || `${v.year} ${v.make} ${v.model}`}
                              </h4>
                              <p className="text-xs text-slate-500">
                                Registered vehicle details for this appointment
                              </p>
                            </div>
                          </div>

                          <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1 font-mono text-xs font-bold text-slate-800">
                            {v.licensePlate || "NO PLATE"}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5 text-xs">
                          <div className="rounded-xl bg-slate-50 p-2.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Brand</span>
                            <span className="font-bold text-slate-800">{v.make || "N/A"}</span>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-2.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Model</span>
                            <span className="font-bold text-slate-800">{v.model || "N/A"}</span>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-2.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Year</span>
                            <span className="font-bold text-slate-800">{v.year || "N/A"}</span>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-2.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Color</span>
                            <span className="font-bold text-slate-800">{v.color || "N/A"}</span>
                          </div>
                          <div className="rounded-xl bg-slate-50 p-2.5">
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">Type</span>
                            <span className="font-bold text-slate-800">{v.vehicleType || "Passenger Car"}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Symptoms & Additional Services */}
                    {(apt.problemDescription || (apt.additionalServices && apt.additionalServices.length > 0)) && (
                      <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3">
                        {apt.problemDescription && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Reported Vehicle Symptoms
                            </p>
                            <p className="mt-1 text-xs leading-relaxed text-slate-700">
                              {apt.problemDescription}
                            </p>
                          </div>
                        )}

                        {apt.additionalServices && apt.additionalServices.length > 0 && (
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                              Requested Additional Services
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {apt.additionalServices.map((svc) => (
                                <span
                                  key={svc.id}
                                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 shadow-2xs"
                                >
                                  <Sparkles size={12} className="text-amber-500" />
                                  {svc.name}
                                  {svc.price && (
                                    <span className="text-slate-400">
                                      ({Number(svc.price).toLocaleString()} MMK)
                                    </span>
                                  )}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-6 py-4">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Info size={14} className="text-slate-400 shrink-0" />
                      <span>
                        {apt.status === "ARRIVED"
                          ? "Your vehicle has arrived at the service workshop. This appointment is now locked and cannot be cancelled."
                          : "Need to change plans? You can cancel your appointment below."}
                      </span>
                    </div>

                    {apt.status === "ARRIVED" ? (
                      <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-500 cursor-not-allowed">
                        <CheckCircle2 size={14} className="text-emerald-600" />
                        Vehicle Arrived (Locked)
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenCancelModal(apt)}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-sm transition hover:border-red-300 hover:bg-red-50"
                      >
                        <XCircle size={15} />
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {/* ─── Cancel Appointment Modal with Loyalty Deduction Warning ─── */}
        {cancellingAppointment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-lg max-h-[90vh] flex flex-col rounded-3xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
              {/* Modal Header */}
              <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-600">
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      Cancel Appointment
                    </h3>
                    <p className="text-xs text-slate-500">
                      Code: <span className="font-mono font-semibold text-slate-700">{cancellingAppointment.appointmentCode}</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleCloseCancelModal}
                  disabled={isSubmittingCancel}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Modal Body */}
              <div className="space-y-4 px-6 py-5 overflow-y-auto flex-1">
                {/* 20 Loyalty Point Deduction Alert Banner */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs text-amber-950 leading-relaxed shadow-2xs">
                  <div className="flex items-center gap-2 font-bold text-amber-900 mb-1 text-sm">
                    <AlertCircle size={17} className="text-amber-600 shrink-0" />
                    Up to 20 Loyalty Points will be deducted
                  </div>
                  Because technician bays and time slots are reserved specifically for this vehicle, cancelling a confirmed appointment incurs up to a <span className="font-bold text-red-700">20 loyalty points penalty</span> (loyalty balance cannot drop below 0). This transaction will appear in your Point History.
                </div>

                {/* Appointment details summary */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Vehicle:</span>
                    <span className="font-bold text-slate-800">
                      {cancellingAppointment.vehicle?.year} {cancellingAppointment.vehicle?.make} {cancellingAppointment.vehicle?.model}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Scheduled Date:</span>
                    <span className="font-bold text-slate-800">
                      {formatDate(cancellingAppointment.appointmentDate)} ({cancellingAppointment.timeSlot})
                    </span>
                  </div>
                </div>

                {/* Quick Reason Chips */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                    Select Quick Reason
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_CANCEL_REASONS.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => {
                          setCancelReason(r);
                          if (cancelError) setCancelError("");
                        }}
                        className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                          cancelReason === r
                            ? "border-[#0261F3] bg-blue-50 text-[#0261F3]"
                            : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Cancellation Reason Textarea */}
                <div>
                  <label
                    htmlFor="cancelReason"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                  >
                    Cancellation Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="cancelReason"
                    rows={3}
                    value={cancelReason}
                    onChange={(e) => {
                      setCancelReason(e.target.value);
                      if (cancelError) setCancelError("");
                    }}
                    placeholder="Please explain why you need to cancel this appointment (workshop staff will be notified)..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0261F3] focus:outline-none focus:ring-2 focus:ring-blue-100"
                  />
                  <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Minimum 5 characters required</span>
                    <span>{cancelReason.length} chars</span>
                  </div>
                </div>

                {/* Acknowledgment Checkbox */}
                <label className="flex items-start gap-2.5 rounded-xl border border-slate-200 bg-slate-50/60 p-3 text-xs cursor-pointer hover:bg-slate-50">
                  <input
                    type="checkbox"
                    checked={pointDeductionAcknowledged}
                    onChange={(e) => {
                      setPointDeductionAcknowledged(e.target.checked);
                      if (cancelError) setCancelError("");
                    }}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#0261F3] focus:ring-blue-500"
                  />
                  <span className="text-slate-700 leading-snug">
                    I acknowledge that cancelling this confirmed appointment will apply a loyalty penalty of up to <strong className="text-red-600 font-bold">20 points</strong> and release my reserved slot.
                  </span>
                </label>

                {cancelError && (
                  <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200 animate-in fade-in">
                    <AlertCircle size={15} className="shrink-0" />
                    <span>{cancelError}</span>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
                <button
                  type="button"
                  onClick={handleCloseCancelModal}
                  disabled={isSubmittingCancel}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Keep Appointment
                </button>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  disabled={isSubmittingCancel}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {isSubmittingCancel ? (
                    <>
                      <LoaderCircle size={16} className="animate-spin" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <XCircle size={16} />
                      Confirm Cancellation (-20 pts)
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
