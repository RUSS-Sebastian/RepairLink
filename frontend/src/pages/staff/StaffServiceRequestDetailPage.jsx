import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Camera,
  CarFront,
  Check,
  CheckCircle2,
  Clock3,
  CreditCard,
  ExternalLink,
  Fuel,
  Gauge,
  LoaderCircle,
  Mail,
  MapPin,
  Maximize2,
  Palette,
  Phone,
  Settings2,
  Sparkles,
  Trash2,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import {
  getStaffServiceRequestDetail,
  rejectStaffServiceRequest,
  confirmStaffAppointment,
} from "../../features/serviceRequests/staffServiceRequestApi";
import { useStaffNotifications } from "../../hooks/useStaffNotifications";
import { ROUTES } from "../../constants/routes";

const BACKEND_URL = "http://localhost:8080";

export default function StaffServiceRequestDetailPage() {
  const { id } = useParams();
  const { markReferenceAsRead } = useStaffNotifications();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [actionNotice, setActionNotice] = useState("");
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");
  const [confirmSuccessNotice, setConfirmSuccessNotice] = useState("");

  useEffect(() => {
    if (!id) return;

    // Immediately mark all notifications for this request as read so the red circle disappears
    markReferenceAsRead(id);

    setLoading(true);
    setError("");

    getStaffServiceRequestDetail(id)
      .then((data) => {
        setRequest(data);
      })
      .catch((err) => {
        setError(err.message || "Failed to load service request details.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, markReferenceAsRead]);

  // Listen for real-time updates (e.g. cancellation by customer while viewing)
  useEffect(() => {
    if (!id) return;

    const handleNotification = (event) => {
      const noti = event.detail;
      if (noti?.referenceId === id || noti?.referenceCode === request?.requestCode) {
        getStaffServiceRequestDetail(id)
          .then((data) => setRequest(data))
          .catch(() => {});
      }
    };

    window.addEventListener("repairlink_staff_notification_received", handleNotification);
    return () => {
      window.removeEventListener("repairlink_staff_notification_received", handleNotification);
    };
  }, [id]);

  const handleConfirmReject = async () => {
    if (!cancelReason.trim() || cancelReason.trim().length < 5) {
      setCancelError("Please enter a cancellation reason (minimum 5 characters).");
      return;
    }

    setIsSubmittingCancel(true);
    setCancelError("");

    try {
      const updated = await rejectStaffServiceRequest(id, cancelReason.trim());
      setRequest(updated);
      setShowCancelModal(false);
      setCancelReason("");
      setActionNotice(
        `Service request ${updated.requestCode} was declined and the customer was notified in real time.`
      );
      setTimeout(() => setActionNotice(""), 5000);
    } catch (err) {
      setCancelError(err.message || "Failed to reject service request.");
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  const handleConfirmAppointment = async () => {
    setIsSubmittingConfirm(true);
    setConfirmError("");
    try {
      const data = await confirmStaffAppointment(id);
      setRequest((prev) => ({
        ...prev,
        status: "APPOINTMENT_SCHEDULED",
        appointmentCode: data?.appointmentCode,
        appointmentId: data?.appointmentId,
        lifecycle: {
          ...prev?.lifecycle,
          appointmentScheduled: {
            isCompleted: true,
            timestamp: new Date().toISOString(),
          },
        },
      }));
      setShowConfirmModal(false);
      setConfirmSuccessNotice(
        `Appointment scheduled successfully! Unique Code: ${data?.appointmentCode || "Assigned"}. The customer has been notified.`
      );
      setTimeout(() => setConfirmSuccessNotice(""), 7000);
    } catch (err) {
      setConfirmError(err.message || "Failed to confirm appointment.");
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  const handleDisabledAction = (actionName) => {
    if (request?.status === "CANCELLED") {
      setActionNotice(
        `This service request was cancelled by the customer. "${actionName}" cannot be performed.`
      );
    } else if (request?.status === "REJECTED") {
      setActionNotice(
        `This service request has been rejected by staff. "${actionName}" cannot be performed.`
      );
    } else {
      setActionNotice(
        `"${actionName}" is configured as visual preview for next stages. No changes were applied.`
      );
    }
    setTimeout(() => setActionNotice(""), 4500);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "APPOINTMENT_SCHEDULED":
        return "bg-blue-50 text-[#0261F3] border-blue-200";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-slate-100 text-slate-700 border-slate-200";
      case "REJECTED":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-slate-50 text-slate-700 border-slate-200";
    }
  };

  const formatStatus = (status) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "Pending Review";
      case "APPOINTMENT_SCHEDULED":
        return "Scheduled";
      case "COMPLETED":
        return "Completed";
      case "CANCELLED":
        return "Cancelled by Customer";
      case "REJECTED":
        return "Rejected by Workshop";
      default:
        return status;
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle size={32} className="animate-spin text-[#0261F3]" />
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">
          <AlertCircle size={26} />
        </div>
        <h2 className="mt-4 text-xl font-bold text-slate-900">
          Service Request Not Found
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          {error || "Unable to find the requested service request record."}
        </p>
        <Link
          to={ROUTES.STAFF_SERVICE_REQUESTS}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#0256D6]"
        >
          <ArrowLeft size={16} /> Back to Service Requests
        </Link>
      </div>
    );
  }

  const {
    requestCode,
    status,
    customer,
    vehicle,
    problemDescription,
    preferredDate,
    preferredTimeSlot,
    handoverMethod,
    pickupLocation,
    additionalServices,
    photos,
    lifecycle,
    cancellationReason,
    cancelledBy,
    createdAt,
    updatedAt,
  } = request;

  const isCancelled = status === "CANCELLED";
  const isRejected = status === "REJECTED";
  const isTerminated = isCancelled || isRejected;

  const totalAdditionalCost = (additionalServices || []).reduce(
    (sum, item) => sum + (Number(item.price) || 0),
    0
  );

  const QUICK_REASONS = [
    "Fully booked on requested date",
    "Required replacement parts out of stock",
    "Vehicle requires specialized EV equipment",
    "Customer requested cancellation via phone",
    "Service type outside workshop operational scope",
  ];

  return (
    <div className="space-y-8">
      {/* Action Notice Alert */}
      {actionNotice && (
        <div className="flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700 shadow-sm animate-in fade-in">
          <span>{actionNotice}</span>
          <button
            type="button"
            onClick={() => setActionNotice("")}
            className="text-blue-500 hover:text-blue-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Confirm Success Notice */}
      {confirmSuccessNotice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span className="font-semibold">{confirmSuccessNotice}</span>
          </div>
          <button
            type="button"
            onClick={() => setConfirmSuccessNotice("")}
            className="text-emerald-500 hover:text-emerald-800"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Appointment Scheduled Banner */}
      {status === "APPOINTMENT_SCHEDULED" && (
        <div className="flex items-start gap-4 rounded-2xl border border-blue-200 bg-blue-50/70 p-5 shadow-sm animate-in fade-in">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#0261F3] text-white shadow-sm">
            <CalendarDays size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">
                Appointment Scheduled & Confirmed
              </h3>
              {request.appointmentCode && (
                <span className="rounded-md bg-blue-100 border border-blue-300 px-2.5 py-0.5 font-mono text-xs font-bold text-[#0261F3]">
                  {request.appointmentCode}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
              Appointment is active for{" "}
              <span className="font-semibold text-slate-900">{preferredDate}</span> (
              {preferredTimeSlot}) with handover:{" "}
              <span className="font-semibold text-slate-900">
                {handoverMethod === "CONCIERGE_PICKUP"
                  ? "Concierge Pickup"
                  : "Customer Drop-off"}
              </span>
              . Customer has been notified.
            </p>
          </div>
        </div>
      )}

      {/* Rejection Notice Banner */}
      {isRejected && (
        <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-sm animate-in fade-in">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm">
            <XCircle size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-red-950">
                Service Request Rejected by Workshop
              </h3>
              <span className="rounded bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase text-red-700">
                Declined
              </span>
            </div>
            <p className="mt-1 text-xs text-red-800">
              This service request was declined on{" "}
              <span className="font-semibold text-red-900">
                {formatDateTime(updatedAt || createdAt)}
              </span>
              {cancelledBy ? ` by ${cancelledBy}` : ""}.
            </p>
            {cancellationReason && (
              <div className="mt-2.5 rounded-xl border border-red-200 bg-white/90 p-3 text-xs text-red-900 shadow-xs">
                <span className="font-bold text-red-950">Reason provided to customer: </span>
                <span className="italic">"{cancellationReason}"</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Cancellation Notice Banner */}
      {isCancelled && (
        <div className="flex items-start gap-4 rounded-2xl border border-red-200 bg-red-50/70 p-5 shadow-sm">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600 shadow-sm">
            <XCircle size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-bold text-red-950">
              Service Request Cancelled
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-red-800">
              This service request was cancelled by the customer on{" "}
              <span className="font-semibold text-red-900">
                {formatDateTime(updatedAt || createdAt)}
              </span>
              . No appointment will be scheduled, and vehicle drop-off/pickup is inactive.
            </p>
          </div>
        </div>
      )}

      {/* Top Bar: Back link & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link
            to={ROUTES.STAFF_SERVICE_REQUESTS}
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
          >
            <ArrowLeft size={16} />
            Back to Service Requests
          </Link>

          <div className="mt-3 flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              {requestCode}
            </h1>
            <span
              className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${getStatusBadge(
                status
              )}`}
            >
              {formatStatus(status)}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Created on {formatDateTime(createdAt)}
          </p>
        </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (isTerminated || status === "APPOINTMENT_SCHEDULED") return;
                setShowCancelModal(true);
                setCancelReason("");
                setCancelError("");
              }}
              disabled={isTerminated || status === "APPOINTMENT_SCHEDULED"}
              className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold shadow-sm transition ${
                isTerminated || status === "APPOINTMENT_SCHEDULED"
                  ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed opacity-60"
                  : "border-red-200 bg-white text-red-600 hover:bg-red-50"
              }`}
              title={
                status === "APPOINTMENT_SCHEDULED"
                  ? "Appointment already scheduled. Cannot decline."
                  : isTerminated
                    ? "Request is already closed"
                    : "Cancel / Reject this service request"
              }
            >
              <XCircle size={16} />
              Cancel Request
            </button>

          {status === "APPOINTMENT_SCHEDULED" ? (
            <div className="inline-flex items-center gap-2 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm">
              <Check size={16} strokeWidth={2.5} className="text-emerald-600" />
              Appointment Confirmed
              {request.appointmentCode && (
                <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-emerald-200 text-emerald-900 font-bold">
                  {request.appointmentCode}
                </span>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (isTerminated) return;
                setShowConfirmModal(true);
                setConfirmError("");
              }}
              disabled={isTerminated}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold shadow-sm transition ${
                isTerminated
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed opacity-60"
                  : "bg-[#0261F3] text-white hover:bg-[#0256D6]"
              }`}
              title={
                isTerminated
                  ? "Cannot confirm appointment for a closed request"
                  : "Confirm Appointment and notify customer"
              }
            >
              <CheckCircle2 size={16} />
              Confirm Appointment
            </button>
          )}
        </div>
      </div>

      {/* Service Lifecycle Stepper */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900">Service Lifecycle</h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Current processing stage and lifecycle milestones.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Step 1: Request Created */}
          <div className="relative flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/50 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
              <Check size={18} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="text-sm font-bold text-slate-900">
                  1. Request Created
                </p>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                  Completed
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600">
                {formatDateTime(lifecycle?.requestCreated?.timestamp || createdAt)}
              </p>
            </div>
          </div>

          {/* Step 2: Appointment Scheduled OR Cancelled OR Rejected */}
          {isRejected ? (
            <div className="relative flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-sm">
                <XCircle size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-900">
                    2. Request Rejected
                  </p>
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">
                    Rejected
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {formatDateTime(updatedAt || createdAt)}
                </p>
                {cancellationReason && (
                  <p className="mt-1 truncate text-[11px] text-red-700 font-medium">
                    Reason: {cancellationReason}
                  </p>
                )}
              </div>
            </div>
          ) : isCancelled ? (
            <div className="relative flex items-start gap-3 rounded-xl border border-red-200 bg-red-50/50 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white shadow-sm">
                <XCircle size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-900">
                    2. Request Cancelled
                  </p>
                  <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">
                    Cancelled
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600">
                  {formatDateTime(updatedAt || createdAt)}
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`relative flex items-start gap-3 rounded-xl border p-4 ${
                lifecycle?.appointmentScheduled?.isCompleted
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-slate-200 bg-slate-50/60"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  lifecycle?.appointmentScheduled?.isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {lifecycle?.appointmentScheduled?.isCompleted ? (
                  <Check size={18} strokeWidth={2.5} />
                ) : (
                  <Clock3 size={18} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-900">
                    2. Appointment Scheduled
                  </p>
                  {lifecycle?.appointmentScheduled?.isCompleted ? (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                      Scheduled
                    </span>
                  ) : (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-amber-700">
                      Pending
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {lifecycle?.appointmentScheduled?.isCompleted
                    ? `${request.appointmentCode ? request.appointmentCode + " • " : ""}${formatDateTime(lifecycle?.appointmentScheduled?.timestamp)}`
                    : "Awaiting staff confirmation"}
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Service Completed OR Closed */}
          {isTerminated ? (
            <div className="relative flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                <X size={18} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-700">
                    3. Closed
                  </p>
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                    Terminated
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {isRejected
                    ? "Request declined by workshop"
                    : "Request closed without service"}
                </p>
              </div>
            </div>
          ) : (
            <div
              className={`relative flex items-start gap-3 rounded-xl border p-4 ${
                lifecycle?.serviceCompleted?.isCompleted
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-slate-200 bg-slate-50/60"
              }`}
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                  lifecycle?.serviceCompleted?.isCompleted
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500"
                }`}
              >
                {lifecycle?.serviceCompleted?.isCompleted ? (
                  <Check size={18} strokeWidth={2.5} />
                ) : (
                  <CheckCircle2 size={18} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <p className="text-sm font-bold text-slate-900">
                    3. Completed
                  </p>
                  {!lifecycle?.serviceCompleted?.isCompleted && (
                    <span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-600">
                      Pending
                    </span>
                  )}
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {lifecycle?.serviceCompleted?.isCompleted
                    ? formatDateTime(lifecycle?.serviceCompleted?.timestamp)
                    : "Service & vehicle handover"}
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Details Grid: Left (Customer & Vehicle), Right (Request & Services) */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Customer Profile Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0261F3]">
                <User size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Customer Profile
                </h2>
                <p className="text-xs text-slate-500">Vehicle owner details</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-xs font-medium text-slate-400">Full Name</span>
                <p className="text-sm font-semibold text-slate-900">{customer?.fullName}</p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400">Email Address</span>
                <p className="text-sm font-semibold text-slate-900">{customer?.email}</p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400">Phone Number</span>
                <p className="text-sm font-semibold text-slate-900">{customer?.phone || "N/A"}</p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400">Member Since</span>
                <p className="text-sm font-semibold text-slate-900">{customer?.memberSince || "N/A"}</p>
              </div>
            </div>
          </section>

          {/* Vehicle Specifications Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0261F3]">
                  <CarFront size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Vehicle Specifications
                  </h2>
                  <p className="text-xs text-slate-500">Registered vehicle information</p>
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  vehicle?.vehicleType === "EV"
                    ? "bg-violet-100 text-violet-700"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {vehicle?.vehicleType === "EV" ? "Electric Vehicle" : "Normal Car"}
              </span>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-xs font-medium text-slate-400">Nickname</span>
                <p className="text-sm font-semibold text-slate-900">{vehicle?.nickname || "N/A"}</p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400">Year / Make / Model</span>
                <p className="text-sm font-semibold text-slate-900">
                  {vehicle?.year} {vehicle?.make} {vehicle?.model}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400">License Plate</span>
                <p className="mt-0.5 inline-block font-mono text-sm font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {vehicle?.licensePlate}
                </p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400">Color</span>
                <p className="text-sm font-semibold text-slate-900">{vehicle?.color || "N/A"}</p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400">Current Mileage</span>
                <p className="text-sm font-semibold text-slate-900">
                  {vehicle?.currentMileage ? `${vehicle.currentMileage.toLocaleString()} ${vehicle.mileageUnit || "mi"}` : "N/A"}
                </p>
              </div>

              {vehicle?.vehicleType !== "EV" && (
                <>
                  <div>
                    <span className="text-xs font-medium text-slate-400">Fuel Type</span>
                    <p className="text-sm font-semibold text-slate-900">{vehicle?.fuelType || "N/A"}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-slate-400">Transmission</span>
                    <p className="text-sm font-semibold text-slate-900">{vehicle?.transmission || "N/A"}</p>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Service Request & Slot Card */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0261F3]">
                <Gauge size={20} />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Service Details & Booking
                </h2>
                <p className="text-xs text-slate-500">Requested schedule and preferences</p>
              </div>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <span className="text-xs font-medium text-slate-400">Scheduled Date</span>
                <p className="text-sm font-semibold text-slate-900">{preferredDate}</p>
              </div>

              <div>
                <span className="text-xs font-medium text-slate-400">Time Slot</span>
                <p className="text-sm font-semibold text-slate-900">{preferredTimeSlot}</p>
              </div>

              <div className="sm:col-span-2">
                <span className="text-xs font-medium text-slate-400">Handover Method</span>
                <div className="mt-1 flex items-center gap-2">
                  {handoverMethod === "PICKUP" ? (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700 border border-purple-200">
                      <Truck size={14} /> Concierge Pickup
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1 text-xs font-bold text-[#0261F3] border border-blue-200">
                      <MapPin size={14} /> Drop-off at Center
                    </span>
                  )}
                </div>
                {handoverMethod === "PICKUP" && pickupLocation && (
                  <p className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-700">Pickup Address: </span>
                    {pickupLocation}
                  </p>
                )}
              </div>
            </div>

            {/* Problem Description */}
            <div className="mt-6 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Customer Issue / Problem Description
              </span>
              <div className="mt-2 rounded-xl bg-slate-50/80 p-4 border border-slate-200 text-sm leading-relaxed text-slate-800">
                {problemDescription}
              </div>
            </div>
          </section>

          {/* Selected Additional Services */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0261F3]">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Additional Services
                  </h2>
                  <p className="text-xs text-slate-500">Add-on service requests</p>
                </div>
              </div>

              {additionalServices && additionalServices.length > 0 && (
                <span className="font-mono text-sm font-bold text-slate-900">
                  Est: ${totalAdditionalCost.toFixed(2)}
                </span>
              )}
            </div>

            <div className="mt-4">
              {!additionalServices || additionalServices.length === 0 ? (
                <p className="text-xs text-slate-400 py-3 text-center">
                  No additional services selected.
                </p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {additionalServices.map((svc) => (
                    <div
                      key={svc.id}
                      className="flex items-center justify-between py-2.5 text-sm"
                    >
                      <span className="font-medium text-slate-800">{svc.name}</span>
                      <span className="font-mono font-semibold text-slate-600">
                        ${Number(svc.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Customer Submitted Photos Gallery */}
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0261F3]">
            <Camera size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Customer Submitted Photos
            </h2>
            <p className="text-xs text-slate-500">
              {photos?.length || 0} vehicle condition {photos?.length === 1 ? "photo" : "photos"} attached
            </p>
          </div>
        </div>

        <div className="mt-6">
          {!photos || photos.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              No photos were uploaded with this service request.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo) => {
                const photoSrc = `${BACKEND_URL}${photo.url}`;
                return (
                  <div
                    key={photo.photoId}
                    onClick={() => setSelectedPhoto(photo)}
                    className="group relative cursor-pointer overflow-hidden rounded-xl border border-slate-200 bg-slate-100 transition hover:border-[#0261F3] hover:shadow-md"
                  >
                    <div className="aspect-video w-full overflow-hidden bg-slate-900">
                      <img
                        src={photoSrc}
                        alt={photo.originalFileName || "Vehicle photo"}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-white">
                      <span className="truncate text-xs font-medium text-slate-700">
                        {photo.originalFileName}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {(photo.fileSize / 1024).toFixed(0)} KB
                      </span>
                    </div>

                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition group-hover:opacity-100">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1 text-xs font-bold text-slate-900 shadow">
                        <Maximize2 size={13} /> View Photo
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          onClick={() => setSelectedPhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-slate-900 shadow-2xl"
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-black/60 p-2 text-white/80 transition hover:bg-black hover:text-white"
            >
              <X size={20} />
            </button>

            <img
              src={`${BACKEND_URL}${selectedPhoto.url}`}
              alt={selectedPhoto.originalFileName}
              className="max-h-[80vh] w-auto object-contain mx-auto"
            />

            <div className="bg-slate-900/95 px-6 py-3 text-center text-xs text-slate-300 border-t border-slate-800">
              <span className="font-semibold text-white">
                {selectedPhoto.originalFileName}
              </span>{" "}
              ({(selectedPhoto.fileSize / 1024).toFixed(1)} KB)
            </div>
          </div>
        </div>
      )}

      {/* Cancel Request Modal */}
      {showCancelModal && (
        <div
          onClick={() => {
            if (!isSubmittingCancel) setShowCancelModal(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl transition-all"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <XCircle size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Cancel Service Request
                  </h3>
                  <p className="text-xs text-slate-500">
                    Request <span className="font-mono font-semibold">{requestCode}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isSubmittingCancel) setShowCancelModal(false);
                }}
                disabled={isSubmittingCancel}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 px-6 py-5">
              <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-xs text-amber-900 leading-relaxed">
                <p className="font-semibold">Notice regarding customer notification:</p>
                Cancelling this request will update its status to <span className="font-bold uppercase text-red-700">Rejected</span>, release any reserved time slots, and immediately notify{" "}
                <span className="font-semibold">{customer?.fullName || "the customer"}</span> in real time without requiring them to refresh the page.
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Select Quick Reason
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_REASONS.map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => {
                        setCancelReason(reason);
                        setCancelError("");
                      }}
                      className={`rounded-lg border px-2.5 py-1 text-xs font-medium transition ${
                        cancelReason === reason
                          ? "border-[#0261F3] bg-blue-50 text-[#0261F3]"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:bg-slate-100"
                      }`}
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="cancelReasonInput"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5"
                >
                  Cancellation Reason <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="cancelReasonInput"
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => {
                    setCancelReason(e.target.value);
                    if (cancelError) setCancelError("");
                  }}
                  placeholder="Explain why this request is being cancelled so the customer understands..."
                  className="w-full rounded-xl border border-slate-200 p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-[#0261F3] focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
                <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Minimum 5 characters</span>
                  <span>{cancelReason.length} chars</span>
                </div>
              </div>

              {cancelError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200 animate-in fade-in">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{cancelError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                disabled={isSubmittingCancel}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Keep Request
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
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
                    Confirm Cancellation
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Appointment Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0261F3]">
                  <CheckCircle2 size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Confirm Appointment
                  </h3>
                  <p className="text-xs text-slate-500">
                    Request <span className="font-mono font-semibold">{requestCode}</span>
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!isSubmittingConfirm) setShowConfirmModal(false);
                }}
                disabled={isSubmittingConfirm}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 px-6 py-5">
              <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-4 text-xs text-blue-900 leading-relaxed">
                <p className="font-semibold text-blue-950 mb-1">Appointment Confirmation Details</p>
                Confirming this booking will create an active appointment with a unique code, advance the lifecycle to <span className="font-bold text-[#0261F3]">Scheduled</span>, and notify the customer in real time.
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 text-xs">
                <div>
                  <span className="text-slate-500 font-medium block">Appointment Date</span>
                  <span className="font-bold text-slate-900">{preferredDate || "N/A"}</span>
                </div>
                <div>
                  <span className="text-slate-500 font-medium block">Time Slot</span>
                  <span className="font-bold text-slate-900">{preferredTimeSlot || "N/A"}</span>
                </div>
                <div className="col-span-2 border-t border-slate-200/80 pt-2 mt-1">
                  <span className="text-slate-500 font-medium block">Vehicle</span>
                  <span className="font-bold text-slate-900">
                    {vehicle?.year} {vehicle?.make} {vehicle?.model}
                    {vehicle?.licensePlate ? ` (${vehicle.licensePlate})` : ""}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-medium block">Handover Method</span>
                  <span className="font-bold text-slate-900">
                    {handoverMethod === "CONCIERGE_PICKUP"
                      ? `Concierge Pickup: ${pickupLocation || "Address specified"}`
                      : "Customer Drop-off at Workshop"}
                  </span>
                </div>
                <div className="col-span-2 border-t border-slate-200/80 pt-2">
                  <span className="text-slate-500 font-medium block">Customer</span>
                  <span className="font-bold text-slate-900">
                    {customer?.fullName} {customer?.phoneNumber ? `• ${customer.phoneNumber}` : ""}
                  </span>
                </div>
              </div>

              {confirmError && (
                <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-xs font-medium text-red-700 border border-red-200 animate-in fade-in">
                  <AlertCircle size={15} className="shrink-0" />
                  <span>{confirmError}</span>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50/60 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmittingConfirm}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAppointment}
                disabled={isSubmittingConfirm}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0256D6] disabled:opacity-50"
              >
                {isSubmittingConfirm ? (
                  <>
                    <LoaderCircle size={16} className="animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    Confirm & Schedule
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
