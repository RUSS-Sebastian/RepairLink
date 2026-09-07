import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Activity,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
  Pencil,
  Archive,
  RotateCcw,
  X,
  AlertCircle,
  Car,
  Zap,
  Layers,
  CheckCircle2,
  XCircle,
  ArchiveRestore,
  Filter,
  ChevronDown,
} from "lucide-react";
import {
  listAdditionalServices,
  createAdditionalService,
  updateAdditionalService,
  changeServiceStatus,
} from "../../features/additional-services/additionalServicesApi";

/* ─── constants ─── */
const STATUS_OPTIONS = ["ALL", "ACTIVE", "INACTIVE", "ARCHIVED"];
const APPLICABILITY_OPTIONS = ["ALL", "NORMAL_CAR", "EV", "BOTH"];
const FORM_APPLICABILITY = ["NORMAL_CAR", "EV", "BOTH"];
const FORM_STATUS = ["ACTIVE", "INACTIVE"];

const STATUS_STYLES = {
  ACTIVE: "border-emerald-200 bg-emerald-50 text-emerald-700",
  INACTIVE: "border-amber-200 bg-amber-50 text-amber-700",
  ARCHIVED: "border-slate-200 bg-slate-100 text-slate-600",
};

const STATUS_ICONS = {
  ACTIVE: CheckCircle2,
  INACTIVE: XCircle,
  ARCHIVED: Archive,
};

const APPLICABILITY_STYLES = {
  NORMAL_CAR: "border-blue-200 bg-blue-50 text-blue-700",
  EV: "border-violet-200 bg-violet-50 text-violet-700",
  BOTH: "border-slate-200 bg-slate-100 text-slate-700",
};

const APPLICABILITY_ICONS = {
  NORMAL_CAR: Car,
  EV: Zap,
  BOTH: Layers,
};

const APPLICABILITY_LABELS = {
  NORMAL_CAR: "Normal Car",
  EV: "EV",
  BOTH: "Both",
};

function formatPrice(price) {
  return Number(price).toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

function formatLabel(str) {
  if (!str) return "";
  return str.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/* ─── Badge Components ─── */
function StatusBadge({ status }) {
  const Icon = STATUS_ICONS[status] || Activity;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status] || ""}`}
    >
      <Icon size={12} />
      {formatLabel(status)}
    </span>
  );
}

function ApplicabilityBadge({ applicability }) {
  const Icon = APPLICABILITY_ICONS[applicability] || Layers;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${APPLICABILITY_STYLES[applicability] || ""}`}
    >
      <Icon size={12} />
      {APPLICABILITY_LABELS[applicability] || applicability}
    </span>
  );
}

/* ─── Dropdown Filter ─── */
function FilterDropdown({ label, value, options, onChange, labelMap }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
      >
        <Filter size={14} className="text-slate-400" />
        {label}: {labelMap?.[value] || formatLabel(value)}
        <ChevronDown size={14} className="text-slate-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 z-50 mt-1 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setOpen(false);
                }}
                className={`flex w-full items-center px-3.5 py-2 text-left text-sm transition hover:bg-slate-50 ${
                  value === opt
                    ? "font-semibold text-[#0261F3]"
                    : "text-slate-700"
                }`}
              >
                {labelMap?.[opt] || formatLabel(opt)}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ─── Modal ─── */
function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm">
      <div
        className={`w-full ${wide ? "max-w-lg" : "max-w-md"} rounded-2xl border border-slate-200 bg-white shadow-2xl`}
      >
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}

/* ─── Service Form ─── */
function ServiceForm({
  initial,
  onSubmit,
  onCancel,
  submitting,
  error,
  isEdit,
}) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [price, setPrice] = useState(initial?.price?.toString() || "");
  const [applicability, setApplicability] = useState(
    initial?.applicability || "BOTH",
  );
  const [status, setStatus] = useState(initial?.status || "ACTIVE");

  const validation = useMemo(() => {
    const errors = {};
    if (!name.trim()) errors.name = "Name is required";
    if (name.length > 100) errors.name = "Max 100 characters";
    if (description.length > 500) errors.description = "Max 500 characters";
    if (!price || isNaN(Number(price)) || Number(price) < 0)
      errors.price = "Enter a valid price (≥ 0)";
    return errors;
  }, [name, description, price]);

  const valid = Object.keys(validation).length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!valid) return;
    const data = {
      name: name.trim(),
      description: description.trim() || null,
      price: Number(price),
      applicability,
    };
    if (isEdit) data.status = status;
    onSubmit(data);
  };

  const inputCls =
    "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0261F3] focus:ring-4 focus:ring-blue-500/10";
  const labelCls =
    "mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-slate-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      <div>
        <label className={labelCls}>Service Name</label>
        <input
          className={`${inputCls} ${validation.name ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10" : ""}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Engine Oil Change"
          maxLength={100}
        />
        {validation.name && (
          <p className="mt-1 text-xs text-rose-500">{validation.name}</p>
        )}
      </div>

      <div>
        <label className={labelCls}>Description</label>
        <textarea
          className={`${inputCls} min-h-[80px] resize-none ${validation.description ? "border-rose-300" : ""}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description..."
          maxLength={500}
        />
        <p className="mt-1 text-right text-xs text-slate-400">
          {description.length}/500
        </p>
      </div>

      <div>
        <label className={labelCls}>Price (MMK)</label>
        <input
          type="number"
          className={`${inputCls} ${validation.price ? "border-rose-300 focus:border-rose-400 focus:ring-rose-500/10" : ""}`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
        {validation.price && (
          <p className="mt-1 text-xs text-rose-500">{validation.price}</p>
        )}
      </div>

      <div>
        <label className={labelCls}>Applicability</label>
        <div className="flex gap-2">
          {FORM_APPLICABILITY.map((opt) => {
            const Icon = APPLICABILITY_ICONS[opt];
            const active = applicability === opt;
            return (
              <button
                key={opt}
                type="button"
                onClick={() => setApplicability(opt)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                  active
                    ? "border-[#0261F3] bg-blue-50 text-[#0261F3]"
                    : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <Icon size={14} />
                {APPLICABILITY_LABELS[opt]}
              </button>
            );
          })}
        </div>
      </div>

      {isEdit && (
        <div>
          <label className={labelCls}>Status</label>
          <div className="flex gap-2">
            {FORM_STATUS.map((opt) => {
              const Icon = STATUS_ICONS[opt];
              const active = status === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatus(opt)}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                    active
                      ? "border-[#0261F3] bg-blue-50 text-[#0261F3]"
                      : "border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} />
                  {formatLabel(opt)}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!valid || submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting && <LoaderCircle size={14} className="animate-spin" />}
          {isEdit ? "Save Changes" : "Create Service"}
        </button>
      </div>
    </form>
  );
}

/* ─── Confirm Modal ─── */
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  danger,
  loading,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{message}</p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white transition disabled:opacity-50 ${
              danger
                ? "bg-rose-600 hover:bg-rose-700"
                : "bg-[#0261F3] hover:bg-blue-700 shadow-lg shadow-blue-500/20"
            }`}
          >
            {loading && <LoaderCircle size={14} className="animate-spin" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════
   Main Page
   ═══════════════════════════════════════════════════ */
export default function AdditionalServicesPage() {
  /* ── state ── */
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [applicabilityFilter, setApplicabilityFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const [createOpen, setCreateOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState(null);

  const [archiveTarget, setArchiveTarget] = useState(null);
  const [restoreTarget, setRestoreTarget] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);

  /* ── debounced search ── */
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(0);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  /* ── fetch ── */
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listAdditionalServices({
        search: debouncedSearch,
        status: statusFilter,
        applicability: applicabilityFilter,
        page,
        size: pageSize,
      });
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter, applicabilityFilter, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /* ── create ── */
  const handleCreate = async (formData) => {
    setFormSubmitting(true);
    setFormError(null);
    try {
      await createAdditionalService(formData);
      setCreateOpen(false);
      fetchData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  /* ── edit ── */
  const handleUpdate = async (formData) => {
    setFormSubmitting(true);
    setFormError(null);
    try {
      await updateAdditionalService(editService.id, formData);
      setEditService(null);
      fetchData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setFormSubmitting(false);
    }
  };

  /* ── archive ── */
  const handleArchive = async () => {
    setStatusLoading(true);
    try {
      await changeServiceStatus(archiveTarget.id, "ARCHIVED");
      setArchiveTarget(null);
      fetchData();
    } catch {
      // silently fail
    } finally {
      setStatusLoading(false);
    }
  };

  /* ── restore ── */
  const handleRestore = async () => {
    setStatusLoading(true);
    try {
      await changeServiceStatus(restoreTarget.id, "ACTIVE");
      setRestoreTarget(null);
      fetchData();
    } catch {
      // silently fail
    } finally {
      setStatusLoading(false);
    }
  };

  /* ── summary cards data ── */
  const summary = data?.summary || {
    total: 0,
    active: 0,
    inactive: 0,
    archived: 0,
  };
  const summaryCards = [
    {
      label: "Total Services",
      value: summary.total,
      icon: Activity,
      color: "text-[#0261F3]",
      bg: "bg-blue-50",
    },
    {
      label: "Active",
      value: summary.active,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Inactive",
      value: summary.inactive,
      icon: XCircle,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "Archived",
      value: summary.archived,
      icon: Archive,
      color: "text-slate-500",
      bg: "bg-slate-100",
    },
  ];

  /* ═══════ Render ═══════ */
  return (
    <div className="mx-auto max-w-[1400px] space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0261F3]">
            Operations / Additional Services
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
            Additional Services
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage add-on services for normal cars, electric vehicles, or both.
          </p>
        </div>
        <button
          onClick={() => {
            setFormError(null);
            setCreateOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0261F3] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Add Service
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <p className="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">
                  {card.label}
                </p>
                <div className={`rounded-xl ${card.bg} p-2.5 ${card.color}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Filters & Table Card */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-5">
          {/* Search */}
          <div className="relative min-w-[240px] flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0261F3] focus:ring-4 focus:ring-blue-500/10"
              placeholder="Search services..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <FilterDropdown
            label="Status"
            value={statusFilter}
            options={STATUS_OPTIONS}
            onChange={(v) => {
              setStatusFilter(v);
              setPage(0);
            }}
          />
          <FilterDropdown
            label="Type"
            value={applicabilityFilter}
            options={APPLICABILITY_OPTIONS}
            onChange={(v) => {
              setApplicabilityFilter(v);
              setPage(0);
            }}
            labelMap={{
              ALL: "All",
              NORMAL_CAR: "Normal Car",
              EV: "EV",
              BOTH: "Both",
            }}
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                <th className="px-6 py-4">Service Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4 text-right">Price (MMK)</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
                      <LoaderCircle
                        size={20}
                        className="animate-spin text-[#0261F3]"
                      />
                      Loading services…
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center gap-2 py-16 text-sm text-slate-500">
                      <AlertCircle size={20} className="text-rose-400" />
                      <p>{error}</p>
                      <button
                        onClick={fetchData}
                        className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold text-[#0261F3] hover:underline"
                      >
                        <RotateCcw size={12} /> Retry
                      </button>
                    </div>
                  </td>
                </tr>
              ) : !data?.items?.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No services found.
                  </td>
                </tr>
              ) : (
                data.items.map((svc) => (
                  <tr
                    key={svc.id}
                    className="border-b border-slate-100 last:border-0 transition hover:bg-blue-50/40"
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{svc.name}</p>
                      {svc.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                          {svc.description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <ApplicabilityBadge applicability={svc.applicability} />
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-800 tabular-nums">
                      {formatPrice(svc.price)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={svc.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {svc.status !== "ARCHIVED" && (
                          <button
                            onClick={() => {
                              setFormError(null);
                              setEditService(svc);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#0261F3]"
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                        )}
                        {svc.status === "ARCHIVED" ? (
                          <button
                            onClick={() => setRestoreTarget(svc)}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <ArchiveRestore size={13} />
                            Restore
                          </button>
                        ) : (
                          <button
                            onClick={() => setArchiveTarget(svc)}
                            className="rounded-lg border border-rose-100 p-2 text-rose-500 transition hover:bg-rose-50"
                            title="Archive"
                          >
                            <Archive size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 0 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            <span>
              {data.totalElements} service{data.totalElements !== 1 ? "s" : ""}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-16 text-center text-xs font-bold text-slate-700">
                {page + 1} / {data.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(data.totalPages - 1, p + 1))
                }
                disabled={page >= data.totalPages - 1}
                className="rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Create Modal ── */}
      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Add New Service"
        wide
      >
        <ServiceForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          submitting={formSubmitting}
          error={formError}
        />
      </Modal>

      {/* ── Edit Modal ── */}
      <Modal
        open={!!editService}
        onClose={() => setEditService(null)}
        title="Edit Service"
        wide
      >
        {editService && (
          <ServiceForm
            key={editService.id}
            initial={editService}
            isEdit
            onSubmit={handleUpdate}
            onCancel={() => setEditService(null)}
            submitting={formSubmitting}
            error={formError}
          />
        )}
      </Modal>

      {/* ── Archive Confirm ── */}
      <ConfirmModal
        open={!!archiveTarget}
        onClose={() => setArchiveTarget(null)}
        onConfirm={handleArchive}
        title="Archive Service"
        message={`Are you sure you want to archive "${archiveTarget?.name}"? It will no longer be available for selection.`}
        confirmLabel="Archive"
        danger
        loading={statusLoading}
      />

      {/* ── Restore Confirm ── */}
      <ConfirmModal
        open={!!restoreTarget}
        onClose={() => setRestoreTarget(null)}
        onConfirm={handleRestore}
        title="Restore Service"
        message={`Restore "${restoreTarget?.name}" back to active status?`}
        confirmLabel="Restore"
        loading={statusLoading}
      />
    </div>
  );
}
