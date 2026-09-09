import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CarFront,
  Clock3,
  Eye,
  FileImage,
  Filter,
  Gauge,
  LoaderCircle,
  MapPin,
  RefreshCw,
  Search,
  Truck,
  User,
  X,
} from "lucide-react";
import { listStaffServiceRequests } from "../../features/serviceRequests/staffServiceRequestApi";

const STATUS_FILTERS = [
  { id: "ALL", label: "All Requests" },
  { id: "PENDING_REVIEW", label: "Pending Review" },
  { id: "APPOINTMENT_SCHEDULED", label: "Scheduled" },
  { id: "COMPLETED", label: "Completed" },
  { id: "CANCELLED", label: "Cancelled" },
  { id: "REJECTED", label: "Rejected" },
];

export default function StaffServiceRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("ALL");

  const loadRequests = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError("");
    try {
      const data = await listStaffServiceRequests();
      setRequests(data || []);
    } catch (err) {
      if (showLoading) setError(err.message || "Failed to load service requests.");
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests(true);

    const handleNotification = (event) => {
      const noti = event.detail;
      if (
        noti?.type === "SERVICE_REQUEST_SUBMITTED" ||
        noti?.type === "SERVICE_REQUEST_CANCELLED" ||
        noti?.type === "SERVICE_REQUEST_REJECTED" ||
        noti?.type === "APPOINTMENT_CANCELLED" ||
        noti?.type === "APPOINTMENT_CONFIRMED"
      ) {
        // Silently reload requests queue in real time without screen flicker
        loadRequests(false);
      }
    };

    window.addEventListener("repairlink_staff_notification_received", handleNotification);
    return () => {
      window.removeEventListener("repairlink_staff_notification_received", handleNotification);
    };
  }, []);

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Status filter
      if (selectedStatus !== "ALL" && req.status !== selectedStatus) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesCode = req.requestCode?.toLowerCase().includes(q);
        const matchesCustomer = req.customerName?.toLowerCase().includes(q);
        const matchesPlate = req.vehicleLicensePlate?.toLowerCase().includes(q);
        const matchesVehicle = req.vehicleName?.toLowerCase().includes(q);
        return matchesCode || matchesCustomer || matchesPlate || matchesVehicle;
      }

      return true;
    });
  }, [requests, selectedStatus, searchQuery]);

  const getStatusBadge = (status) => {
    switch (status) {
      case "PENDING_REVIEW":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "APPOINTMENT_SCHEDULED":
        return "bg-blue-50 text-[#0261F3] border-blue-200";
      case "COMPLETED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "CANCELLED":
        return "bg-slate-100 text-slate-600 border-slate-200";
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
        return "Cancelled";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Reload */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Service Requests
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage incoming customer repair requests, review issue reports, and coordinate bookings.
          </p>
        </div>

        <button
          type="button"
          onClick={loadRequests}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={16} className={loading ? "animate-spin text-slate-500" : "text-slate-600"} />
          Refresh
        </button>
      </div>

      {/* Controls (Search & Status Filter) */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by code (e.g. REQ-0001), customer, plate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 transition focus:border-[#0261F3] focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Status Filters */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map(({ id, label }) => {
            const count =
              id === "ALL"
                ? requests.length
                : requests.filter((r) => r.status === id).length;
            const active = selectedStatus === id;

            return (
              <button
                key={id}
                type="button"
                onClick={() => setSelectedStatus(id)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  active
                    ? "bg-[#0261F3] text-white shadow-sm"
                    : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Requests List */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center">
          <LoaderCircle size={28} className="animate-spin text-[#0261F3]" />
        </div>
      ) : filteredRequests.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#0261F3]">
            <Gauge size={26} />
          </div>
          <h3 className="mt-4 text-base font-bold text-slate-900">
            No service requests found
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchQuery || selectedStatus !== "ALL"
              ? "Try adjusting your search criteria or filter."
              : "No customer requests have been submitted yet."}
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredRequests.map((req) => (
            <article
              key={req.serviceRequestId}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                {/* Left Side: Code, Status, Customer, Vehicle */}
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-base font-bold tracking-tight text-slate-900">
                      {req.requestCode}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getStatusBadge(
                        req.status
                      )}`}
                    >
                      {formatStatus(req.status)}
                    </span>
                    <span className="text-xs text-slate-400">
                      Submitted {new Date(req.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>

                  <div className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <User size={16} className="text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-900">{req.customerName}</span>
                      {req.customerPhone && (
                        <span className="text-xs text-slate-500">({req.customerPhone})</span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <CarFront size={16} className="text-slate-400 shrink-0" />
                      <span className="font-medium text-slate-800">{req.vehicleName}</span>
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs font-semibold text-slate-600">
                        {req.vehicleLicensePlate}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <CalendarDays size={16} className="text-slate-400 shrink-0" />
                      <span>{req.preferredDate} ({req.preferredTimeSlot})</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      {req.handoverMethod === "PICKUP" ? (
                        <>
                          <Truck size={16} className="text-purple-500 shrink-0" />
                          <span className="font-medium text-purple-700">Concierge Pickup</span>
                        </>
                      ) : (
                        <>
                          <MapPin size={16} className="text-blue-500 shrink-0" />
                          <span>Drop-off at Center</span>
                        </>
                      )}
                      {req.photoCount > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                          <FileImage size={12} /> {req.photoCount} {req.photoCount === 1 ? "photo" : "photos"}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Problem Description Snippet */}
                  <p className="text-sm leading-relaxed text-slate-600 bg-slate-50/60 rounded-xl p-3 border border-slate-100">
                    <span className="font-semibold text-slate-700">Problem: </span>
                    {req.problemSummary}
                  </p>

                  {/* Rejection Reason Snippet */}
                  {req.status === "REJECTED" && req.cancellationReason && (
                    <div className="rounded-xl border border-red-200 bg-red-50/70 p-3 text-xs text-red-900 leading-relaxed">
                      <span className="font-bold text-red-950">Decline Reason: </span>
                      <span className="italic">"{req.cancellationReason}"</span>
                      {req.cancelledBy && (
                        <span className="text-red-700 ml-1">({req.cancelledBy})</span>
                      )}
                    </div>
                  )}

                  {/* Additional Services Tags */}
                  {req.additionalServiceNames && req.additionalServiceNames.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      <span className="text-xs font-medium text-slate-400">Additional:</span>
                      {req.additionalServiceNames.map((svc) => (
                        <span
                          key={svc}
                          className="rounded-lg bg-blue-50 px-2 py-0.5 text-xs font-medium text-[#0261F3]"
                        >
                          {svc}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Action Link */}
                <div className="flex shrink-0 items-center lg:self-center">
                  <Link
                    to={`/staff/service-requests/${req.serviceRequestId}`}
                    className="inline-flex w-full lg:w-auto items-center justify-center gap-2 rounded-xl bg-[#0261F3] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0256D6]"
                  >
                    <Eye size={16} />
                    View Details
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
