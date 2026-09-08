import { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertCircle,
  Calendar,
  CarFront,
  Clock,
  ExternalLink,
  Image as ImageIcon,
  LoaderCircle,
  MapPin,
  Maximize2,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Trash2,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import {
  getCustomerServiceRequests,
  deleteServiceRequest,
  cancelServiceRequest,
} from "../../features/serviceRequests/serviceRequestApi";
import { ROUTES } from "../../constants/routes";

const BACKEND_URL = "http://localhost:8080";

export default function ActiveServicePage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [cancellingRequest, setCancellingRequest] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [deletingTarget, setDeletingTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCancelConfirm = async () => {
    if (!cancellingRequest) return;
    setIsCancelling(true);
    try {
      await cancelServiceRequest(cancellingRequest.id);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === cancellingRequest.id ? { ...r, status: "CANCELLED" } : r,
        ),
      );
      setCancelFeedback(
        `Service request for "${cancellingRequest.vehicle?.nickname || "your vehicle"}" was cancelled and removed from Active Service.`,
      );
      setCancellingRequest(null);
    } catch (err) {
      setError(err.message || "Failed to cancel service request.");
    } finally {
      setIsCancelling(false);
    }
  };

  const loadRequests = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getCustomerServiceRequests();
      setRequests(data || []);
    } catch (err) {
      setError(err.message || "Failed to load service requests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleDeleteConfirm = async () => {
    if (!deletingTarget) return;
    setIsDeleting(true);
    try {
      await deleteServiceRequest(deletingTarget.id);
      setRequests((prev) => prev.filter((r) => r.id !== deletingTarget.id));
      setCancelFeedback(
        `Service request for "${deletingTarget.vehicle?.nickname || "your vehicle"}" was permanently deleted from the database.`,
      );
      setDeletingTarget(null);
    } catch (err) {
      setError(err.message || "Failed to delete service request.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Only requests waiting for workshop review appear on this page.
  // Once status changes to APPOINTMENT_SCHEDULED or CANCELLED, they immediately disappear from this page.
  const pendingRequests = useMemo(() => {
    return requests.filter(
      (req) =>
        req.status === "PENDING_REVIEW" &&
        req.status !== "APPOINTMENT_SCHEDULED" &&
        req.status !== "CANCELLED",
    );
  }, [requests]);

  // Filter by search query (vehicle nickname, make, model, license, problem)
  const filteredRequests = useMemo(() => {
    if (!searchQuery.trim()) return pendingRequests;
    const q = searchQuery.toLowerCase();
    return pendingRequests.filter((req) => {
      const v = req.vehicle;
      const vehicleMatch =
        v?.nickname?.toLowerCase().includes(q) ||
        v?.make?.toLowerCase().includes(q) ||
        v?.model?.toLowerCase().includes(q) ||
        v?.licensePlate?.toLowerCase().includes(q);
      const problemMatch = req.problemDescription?.toLowerCase().includes(q);
      const slotMatch = req.preferredTimeSlot?.toLowerCase().includes(q);
      return vehicleMatch || problemMatch || slotMatch;
    });
  }, [pendingRequests, searchQuery]);

  return (
    <div className="min-h-full bg-[#F3F8FF] pb-14">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ─── Hero Header ─── */}
        <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-8">
          <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border-[24px] border-blue-500/20" />
          <div className="absolute -bottom-10 right-32 h-36 w-36 rounded-full border-[16px] border-amber-500/10" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-blue-300">
                <Activity size={13} className="text-blue-400" />
                Active Service Requests
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Pending Service Submissions
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Review your submitted requests while our technicians assess
                symptoms and prepare your appointment. Once scheduled, your
                booking moves to Appointments.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={loadRequests}
                disabled={loading}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2.5 text-xs font-bold text-slate-200 transition hover:bg-slate-800 hover:text-white"
              >
                <RefreshCw
                  size={14}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </button>
              <Link
                to={ROUTES.SERVICE_REQUEST}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
              >
                <Plus size={15} />
                Book Another Service
              </Link>
            </div>
          </div>

          {/* ─── Status Overview Cards ─── */}
          <div className="mt-7 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-amber-300">
                  Requests Awaiting Scheduling
                </p>
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
              </div>
              <p className="mt-1 text-2xl font-bold text-amber-100">
                {pendingRequests.length}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 backdrop-blur-sm">
              <p className="text-xs font-semibold text-slate-400">
                Workflow Notice
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-300">
                Once a request is confirmed and scheduled by the service center,
                it disappears from this page and moves to your scheduled
                appointments.
              </p>
            </div>
          </div>
        </header>

        {/* ─── Search Bar ─── */}
        {pendingRequests.length > 0 && (
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative flex-1 max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by vehicle nickname, plate, or symptom..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/70 py-2 pl-9 pr-3 text-xs text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            <p className="text-xs font-semibold text-slate-500">
              Showing {filteredRequests.length} pending request
              {filteredRequests.length === 1 ? "" : "s"}
            </p>
          </div>
        )}

        {/* ─── Feedback Banner ─── */}
        {cancelFeedback && (
          <div className="flex items-center justify-between rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800 shadow-sm">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} className="text-amber-600" />
              {cancelFeedback}
            </div>
            <button
              type="button"
              onClick={() => setCancelFeedback("")}
              className="text-amber-600 hover:text-amber-800"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {/* ─── Error State ─── */}
        {error && (
          <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle size={20} className="shrink-0" />
            <div className="flex-1">
              <p className="font-bold">Error loading requests</p>
              <p className="text-xs">{error}</p>
            </div>
            <button
              type="button"
              onClick={loadRequests}
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* ─── Loading State ─── */}
        {loading && (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="animate-pulse rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="h-6 w-36 rounded-full bg-slate-200" />
                  <div className="h-6 w-24 rounded-full bg-slate-200" />
                </div>
                <div className="mt-4 h-4 w-3/4 rounded bg-slate-200" />
                <div className="mt-2 h-4 w-1/2 rounded bg-slate-200" />
              </div>
            ))}
          </div>
        )}

        {/* ─── Empty State ─── */}
        {!loading && !error && filteredRequests.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
              <Activity size={32} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-slate-900">
              {searchQuery
                ? "No pending requests match your search"
                : "No pending service requests"}
            </h3>
            <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-slate-500">
              {searchQuery
                ? "Try clearing your search query to see all pending submissions."
                : "When you submit a service request, it appears here while awaiting review. Once scheduled, it transitions to your appointments."}
            </p>
            <div className="mt-6 flex justify-center gap-3">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-50"
                >
                  Clear Search
                </button>
              ) : (
                <Link
                  to={ROUTES.SERVICE_REQUEST}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-5 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
                >
                  <Plus size={15} />
                  Book a Service Request
                </Link>
              )}
            </div>
          </div>
        )}

        {/* ─── Pending Requests Cards List ─── */}
        {!loading && !error && filteredRequests.length > 0 && (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <ServiceRequestCard
                key={req.id}
                request={req}
                onOpenPhoto={(photo) => setLightboxPhoto(photo)}
                onCancelClick={() => setCancellingRequest(req)}
                onDeleteClick={() => setDeletingTarget(req)}
              />
            ))}
          </div>
        )}

        {/* ─── Photo Lightbox Modal ─── */}
        {lightboxPhoto && (
          <PhotoLightboxModal
            photo={lightboxPhoto}
            onClose={() => setLightboxPhoto(null)}
          />
        )}

        {/* ─── Cancel Confirmation Modal ─── */}
        {cancellingRequest && (
          <CancelModal
            request={cancellingRequest}
            isCancelling={isCancelling}
            onClose={() => setCancellingRequest(null)}
            onConfirm={handleCancelConfirm}
          />
        )}

        {/* ─── Delete Confirmation Modal (Dev Data Cleaning) ─── */}
        {deletingTarget && (
          <DeleteModal
            request={deletingTarget}
            isDeleting={isDeleting}
            onClose={() => setDeletingTarget(null)}
            onConfirm={handleDeleteConfirm}
          />
        )}
      </div>
    </div>
  );
}

/* ─── Service Request Card Component ─── */
function ServiceRequestCard({
  request,
  onOpenPhoto,
  onCancelClick,
  onDeleteClick,
}) {
  const [expandedProblem, setExpandedProblem] = useState(false);
  const v = request.vehicle;
  const isEv = v?.vehicleType === "EV";
  const VehicleIcon = isEv ? Zap : CarFront;

  const resolvePhotoUrl = (stored) => {
    if (!stored) return "";
    return stored.startsWith("http") ? stored : `${BACKEND_URL}${stored}`;
  };

  const createdFormatted = useMemo(() => {
    if (!request.createdAt) return "";
    try {
      const d = new Date(request.createdAt);
      return d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return request.createdAt;
    }
  }, [request.createdAt]);

  const isLongProblem = (request.problemDescription || "").length > 180;

  return (
    <article className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Top Bar: Status + Vehicle Badge + Timestamp */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-5 py-4 sm:px-6">
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Badge */}
          <span className="inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
            Pending Workshop Review
          </span>

          {/* Vehicle summary badge */}
          {v && (
            <div className="inline-flex items-center gap-2 rounded-xl bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-sm ring-1 ring-slate-200/80">
              <VehicleIcon
                size={14}
                className={isEv ? "text-violet-600" : "text-blue-600"}
              />
              <span>{v.nickname}</span>
              <span className="font-normal text-slate-400">·</span>
              <span className="text-slate-500">
                {v.year} {v.make} {v.model}
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] text-slate-600">
                {v.licensePlate}
              </span>
            </div>
          )}
        </div>

        <span className="text-[11px] font-semibold text-slate-400">
          Submitted {createdFormatted}
        </span>
      </div>

      {/* Main Body */}
      <div className="p-5 sm:p-6">
        {/* Appointment details pills */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-2xl bg-blue-50/50 p-3 ring-1 ring-blue-100">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Calendar size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Requested Date
              </p>
              <p className="truncate text-xs font-bold text-slate-900">
                {request.preferredDate || "Not set"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
              <Clock size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Preferred Time Slot
              </p>
              <p className="truncate text-xs font-bold text-slate-900">
                {request.preferredTimeSlot || "Flexible"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-slate-50 p-3 ring-1 ring-slate-100">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
              <MapPin size={17} />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Handover Method
              </p>
              <p className="truncate text-xs font-bold text-slate-900">
                {request.handoverMethod === "PICKUP"
                  ? `Pickup: ${request.pickupLocation || "Address provided"}`
                  : "Customer Drop-off"}
              </p>
            </div>
          </div>
        </div>

        {/* Symptoms / Problem Description */}
        <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Reported Symptoms
          </p>
          <p className="mt-1.5 text-xs leading-6 text-slate-700">
            {isLongProblem && !expandedProblem
              ? `${request.problemDescription.slice(0, 180)}...`
              : request.problemDescription}
          </p>
          {isLongProblem && (
            <button
              type="button"
              onClick={() => setExpandedProblem(!expandedProblem)}
              className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800"
            >
              {expandedProblem ? "Show Less" : "Read More"}
            </button>
          )}
        </div>

        {/* Attached Photos Gallery */}
        {request.photos && request.photos.length > 0 && (
          <div className="mt-5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span className="flex items-center gap-1.5">
                <ImageIcon size={14} className="text-blue-600" />
                Attached Photos ({request.photos.length})
              </span>
              <span className="text-[11px] font-normal text-slate-400">
                Click photo to preview
              </span>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-3">
              {request.photos.map((photo) => {
                const fullUrl = resolvePhotoUrl(photo.url);
                return (
                  <button
                    key={photo.photoId}
                    type="button"
                    onClick={() => onOpenPhoto({ ...photo, fullUrl })}
                    className="group relative h-20 w-20 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm transition hover:scale-105 hover:border-blue-400 hover:shadow-md"
                  >
                    <img
                      src={fullUrl}
                      alt={photo.originalFileName}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-950/40 opacity-0 transition group-hover:opacity-100">
                      <Maximize2 size={16} className="text-white" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Additional Services requested */}
        {request.additionalServices &&
          request.additionalServices.length > 0 && (
            <div className="mt-5">
              <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Sparkles size={14} className="text-amber-500" />
                Additional Services Requested
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                {request.additionalServices.map((svc) => (
                  <span
                    key={svc.id}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {svc.name}
                    {svc.price && (
                      <span className="font-bold text-slate-900">
                        ({Number(svc.price).toLocaleString()} MMK)
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )}
      </div>

      {/* Footer: Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/40 px-5 py-3.5 sm:px-6">
        <div className="font-mono text-[11px] text-slate-400">
          Request ID: <span className="text-slate-600">{request.id}</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Cancel Request Button */}
          <button
            type="button"
            onClick={onCancelClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-600 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
          >
            <XCircle size={14} className="text-slate-500" />
            Cancel Request
          </button>

          {/* Book Another Button */}
          <Link
            to={ROUTES.SERVICE_REQUEST}
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Plus size={14} />
            Book Another
          </Link>

          {/* Delete Record Button (Dev data cleaning) */}
          <button
            type="button"
            onClick={onDeleteClick}
            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/70 px-3 py-2 text-xs font-bold text-red-700 shadow-sm transition hover:border-red-300 hover:bg-red-100"
            title="Permanently remove from database (Dev data cleanup)"
          >
            <Trash2 size={13} className="text-red-600" />
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

/* ─── Photo Lightbox Modal ─── */
function PhotoLightboxModal({ photo, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] max-w-4xl overflow-hidden rounded-3xl bg-slate-900 text-white shadow-2xl ring-1 ring-white/10"
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="min-w-0 flex-1 pr-4">
            <p className="truncate text-sm font-bold text-white">
              {photo.originalFileName}
            </p>
            {photo.fileSize && (
              <p className="text-xs text-slate-400">
                {(photo.fileSize / (1024 * 1024)).toFixed(2)} MB ·{" "}
                {photo.contentType}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full bg-slate-800 p-1.5 text-slate-300 transition hover:bg-slate-700 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex max-h-[75vh] items-center justify-center overflow-auto bg-slate-950 p-4">
          <img
            src={photo.fullUrl}
            alt={photo.originalFileName}
            className="max-h-[70vh] w-auto max-w-full rounded-xl object-contain shadow-md"
          />
        </div>

        <div className="flex items-center justify-end border-t border-slate-800 px-6 py-3">
          <a
            href={photo.fullUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300"
          >
            Open Original <ExternalLink size={13} />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ─── Cancel Confirmation Modal ─── */
function CancelModal({ request, isCancelling, onClose, onConfirm }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
          <XCircle size={28} />
        </div>

        <h3 className="mt-4 text-center text-lg font-bold text-slate-950">
          Cancel Service Request?
        </h3>
        <p className="mt-2 text-center text-xs leading-5 text-slate-500">
          Are you sure you want to cancel the service request for{" "}
          <span className="font-bold text-slate-800">
            {request.vehicle?.nickname || "your vehicle"}
          </span>{" "}
          requested for{" "}
          <span className="font-bold text-slate-800">
            {request.preferredDate}
          </span>
          ?
        </p>

        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <p className="font-bold">Cancellation Notice</p>
          <p className="mt-0.5 text-[11px] text-amber-700">
            Once cancelled, this request will immediately be removed from your
            Active Service page. The record remains saved in your account
            history.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Keep Request
          </button>
          <button
            type="button"
            disabled={isCancelling}
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-slate-900 disabled:opacity-50"
          >
            {isCancelling ? (
              <>
                <LoaderCircle size={14} className="animate-spin" />
                Cancelling...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Delete Confirmation Modal (Dev Data Cleaning) ─── */
function DeleteModal({ request, isDeleting, onClose, onConfirm }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md overflow-hidden rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-600">
          <Trash2 size={28} />
        </div>

        <h3 className="mt-4 text-center text-lg font-bold text-slate-950">
          Permanently Delete Request?
        </h3>
        <p className="mt-2 text-center text-xs leading-5 text-slate-500">
          Are you sure you want to permanently delete this service request for{" "}
          <span className="font-bold text-slate-800">
            {request.vehicle?.nickname || "your vehicle"}
          </span>
          ?
        </p>

        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50/80 p-3.5 text-xs text-red-800">
          <p className="flex items-center gap-1.5 font-bold">
            <AlertCircle size={14} className="shrink-0 text-red-600" />
            Database Cleanup Feature
          </p>
          <p className="mt-1 text-[11px] leading-4 text-red-700">
            This immediately hard-deletes the request from the database and
            deletes all uploaded photos from disk. This cannot be undone.
          </p>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Keep Record
          </button>
          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-red-500/25 transition hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <LoaderCircle size={14} className="animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 size={14} />
                Delete Permanently
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
