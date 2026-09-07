import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Ban,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Info,
  LoaderCircle,
  LockKeyhole,
  Plus,
  Settings2,
  Trash2,
  X,
} from "lucide-react";

import { ROUTES } from "../../constants/routes";
import {
  addBlockedDate,
  createScheduleConfiguration,
  deleteScheduleConfiguration,
  getScheduleConfiguration,
  listScheduleConfigurations,
  removeBlockedDate,
} from "../../features/schedule/scheduleApi";

const TODAY = new Date().toISOString().slice(0, 10);
const PAGE_SIZE = 4;
const WEEKDAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];
const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const formatDate = (date) => {
  if (!date) return "";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
};

const formatShortDate = (date) => {
  if (!date) return "None";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
};

const toDateInput = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const timeToMinutes = (value) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (value) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;

const getSlots = (configuration, day) => {
  if (
    !configuration ||
    !configuration.openingTime ||
    !configuration.closingTime
  )
    return [];
  const slots = [];
  const opening = timeToMinutes(configuration.openingTime.slice(0, 5));
  const closing = timeToMinutes(configuration.closingTime.slice(0, 5));
  const dayBreaks = (configuration.breaks || [])
    .filter((item) => item.dayOfWeek.toUpperCase() === day.toUpperCase())
    .sort(
      (first, second) =>
        timeToMinutes(first.startTime.slice(0, 5)) -
        timeToMinutes(second.startTime.slice(0, 5)),
    );

  let start = opening;
  const duration = Number(configuration.slotDurationMinutes || 60);

  while (start < closing) {
    const breakPeriod = dayBreaks.find((item) => {
      const breakStart = timeToMinutes(item.startTime.slice(0, 5));
      const breakEnd = timeToMinutes(item.endTime.slice(0, 5));
      return start >= breakStart && start < breakEnd;
    });

    const nextBreak = dayBreaks.find(
      (item) =>
        timeToMinutes(item.startTime.slice(0, 5)) > start &&
        timeToMinutes(item.startTime.slice(0, 5)) < start + duration,
    );

    if (nextBreak) {
      const nextBreakStart = timeToMinutes(nextBreak.startTime.slice(0, 5));
      slots.push({
        label: `${minutesToTime(start)} – ${minutesToTime(nextBreakStart)}`,
        isBreak: false,
      });
      start = nextBreakStart;
      continue;
    }

    if (breakPeriod) {
      slots.push({
        label: `${breakPeriod.startTime.slice(0, 5)} – ${breakPeriod.endTime.slice(0, 5)}`,
        isBreak: true,
      });
      start = timeToMinutes(breakPeriod.endTime.slice(0, 5));
      continue;
    }

    const end = Math.min(start + duration, closing);
    slots.push({
      label: `${minutesToTime(start)} – ${minutesToTime(end)}`,
      isBreak: false,
    });
    start = end;
  }
  return slots;
};

function StatusPill({ status }) {
  const styles = {
    CURRENT: "border-emerald-200 bg-emerald-50 text-emerald-700",
    COMPLETED: "border-slate-200 bg-slate-100 text-slate-600",
    UPCOMING: "border-blue-200 bg-blue-50 text-blue-700",
    Closed: "border-slate-200 bg-slate-100 text-slate-500",
    Available: "bg-emerald-50 text-emerald-700",
    Break: "bg-amber-50 text-amber-700",
  };
  const normalized = status ? status.toUpperCase() : "UPCOMING";
  const label =
    normalized === "CURRENT"
      ? "Current"
      : normalized === "COMPLETED"
        ? "Completed"
        : normalized === "UPCOMING"
          ? "Upcoming"
          : status;
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[normalized] || styles[status] || styles.UPCOMING}`}
    >
      {label}
    </span>
  );
}

function Field({ label, value, onChange, type = "text", min, disabled }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
      <input
        type={type}
        min={min}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-[#0261F3] focus:ring-4 focus:ring-blue-500/10 disabled:bg-slate-50 disabled:text-slate-500"
      />
    </label>
  );
}

function SchedulePage({ mode = "list" }) {
  const navigate = useNavigate();
  const { configurationId } = useParams();

  if (mode === "detail") {
    return (
      <ScheduleDetail configurationId={configurationId} navigate={navigate} />
    );
  }
  if (mode === "create") {
    return <ConfigurationWizard navigate={navigate} />;
  }
  return <ScheduleHistory navigate={navigate} />;
}

function ScheduleHistory({ navigate }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState({
    metrics: {
      totalConfigurations: 0,
      currentWindowName: "None",
      nextOpeningDate: null,
    },
    content: [],
    pageNumber: 0,
    pageSize: PAGE_SIZE,
    totalElements: 0,
    totalPages: 1,
    isLast: true,
  });
  const [configurationToDelete, setConfigurationToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchConfigurations = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await listScheduleConfigurations({
        dateFrom,
        dateTo,
        page: page - 1,
        size: PAGE_SIZE,
      });
      setData(response);
    } catch (err) {
      setError(err.message || "Failed to load schedule configurations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigurations();
  }, [dateFrom, dateTo, page]);

  const handleDelete = async () => {
    if (!configurationToDelete) return;
    try {
      setIsDeleting(true);
      await deleteScheduleConfiguration(configurationToDelete.configurationId);
      setConfigurationToDelete(null);
      await fetchConfigurations();
    } catch (err) {
      setError(err.message || "Failed to delete configuration.");
    } finally {
      setIsDeleting(false);
    }
  };

  const rows = data.content || [];
  const metrics = data.metrics || {
    totalConfigurations: 0,
    currentWindowName: "None",
    nextOpeningDate: null,
  };

  return (
    <div className="space-y-7">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0261F3]">
            Operations / Scheduling
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Schedule configurations
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            A living record of operating hours, booking capacity, and exceptions
            across your service calendar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => navigate(ROUTES.ADMIN_SCHEDULING_NEW)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0261F3] px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
        >
          <Plus size={17} />
          Add configuration
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Configurations"
          value={metrics.totalConfigurations}
          icon={Settings2}
        />
        <Metric
          label="Current window"
          value={metrics.currentWindowName || "None"}
          icon={CalendarDays}
        />
        <Metric
          label="Next opening"
          value={formatShortDate(metrics.nextOpeningDate)}
          icon={Clock3}
        />
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Configuration history
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search any configuration active during a date or date range.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Field
                label="From date"
                value={dateFrom}
                onChange={(value) => {
                  setDateFrom(value);
                  setPage(1);
                }}
                type="date"
              />
              <Field
                label="To date"
                value={dateTo}
                onChange={(value) => {
                  setDateTo(value);
                  setPage(1);
                }}
                type="date"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
            <LoaderCircle size={20} className="animate-spin text-[#0261F3]" />
            Loading configurations...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                  <th className="px-6 py-4">Configuration</th>
                  <th className="px-6 py-4">Start date</th>
                  <th className="px-6 py-4">End date</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((item) => (
                  <tr
                    key={item.configurationId}
                    className="border-b border-slate-100 last:border-0 hover:bg-blue-50/30"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-[#0261F3]">
                          {item.name.replace("Config ", "C")}
                        </span>
                        <div>
                          <p className="font-bold text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.operatingDaysCount} operating days ·{" "}
                            {item.slotDurationMinutes} min slots ·{" "}
                            {item.slotCapacity} capacity
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {formatDate(item.startDate)}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {formatDate(item.endDate)}
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={item.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              `/admin/scheduling/${item.configurationId}`,
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#0261F3]"
                        >
                          <Eye size={14} />
                          View details
                        </button>
                        {item.status === "UPCOMING" && (
                          <button
                            type="button"
                            onClick={() => setConfigurationToDelete(item)}
                            className="rounded-lg border border-rose-100 p-2 text-rose-500 transition hover:bg-rose-50"
                            title={`Delete ${item.name}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && rows.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No configurations overlap this date range.
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          <span>
            Showing {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–
            {Math.min(page * PAGE_SIZE, data.totalElements)} of{" "}
            {data.totalElements}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((value) => value - 1)}
              className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-16 text-center text-xs font-bold text-slate-700">
              Page {page} / {Math.max(1, data.totalPages)}
            </span>
            <button
              type="button"
              disabled={page >= data.totalPages}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {configurationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-rose-500">
                  Delete upcoming configuration
                </p>
                <h2 className="mt-2 text-xl font-bold text-slate-950">
                  Remove {configurationToDelete.name}?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setConfigurationToDelete(null)}
                className="text-slate-400"
              >
                <X size={18} />
              </button>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              This removes the future schedule window from configuration
              history. Current and completed configurations cannot be deleted.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfigurationToDelete(null)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-rose-700 disabled:opacity-50"
              >
                {isDeleting && (
                  <LoaderCircle size={15} className="animate-spin" />
                )}
                Delete configuration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.13em] text-slate-400">
            {label}
          </p>
          <p className="mt-3 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
        </div>
        <span className="rounded-xl bg-slate-100 p-2.5 text-[#0261F3]">
          <Icon size={18} />
        </span>
      </div>
    </div>
  );
}

function DetailStat({ label, value }) {
  return (
    <div className="border-l-2 border-blue-100 pl-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-bold text-slate-800">{value}</p>
    </div>
  );
}

function ScheduleDetail({ configurationId, navigate }) {
  const [configuration, setConfiguration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [month, setMonth] = useState(new Date());

  const loadDetail = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getScheduleConfiguration(configurationId);
      setConfiguration(response);
      setSelectedDate(response.startDate);
      setMonth(new Date(`${response.startDate}T12:00:00`));
    } catch (err) {
      setError(err.message || "Failed to load schedule details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (configurationId) {
      loadDetail();
    }
  }, [configurationId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-3 py-24 text-sm text-slate-500">
        <LoaderCircle size={24} className="animate-spin text-[#0261F3]" />
        Loading schedule details...
      </div>
    );
  }

  if (error || !configuration) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => navigate(ROUTES.ADMIN_SCHEDULING)}
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0261F3]"
        >
          <ArrowLeft size={16} />
          Back to configuration history
        </button>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {error || "Configuration not found."}
        </div>
      </div>
    );
  }

  const canEditBlockedDates = configuration.canEditBlockedDates;
  const selectedDayIndex =
    (new Date(`${selectedDate}T12:00:00`).getDay() + 6) % 7;
  const selectedDay = WEEKDAYS[selectedDayIndex];
  const selectedDayUpper = selectedDay.toUpperCase();
  const isOperatingDay = (configuration.operatingDays || []).some(
    (d) => d.toUpperCase() === selectedDayUpper,
  );

  const blocked = (configuration.blockedDates || []).find(
    (item) => item.blockedDate === selectedDate,
  );
  const slots =
    blocked || !isOperatingDay ? [] : getSlots(configuration, selectedDay);
  const monthDays = getMonthDays(month);

  const handleRemoveBlock = async (blockedDateId) => {
    try {
      await removeBlockedDate(configuration.configurationId, blockedDateId);
      await loadDetail();
    } catch (err) {
      alert(err.message || "Failed to remove blocked date.");
    }
  };

  const handleAddBlock = async () => {
    if (!newBlockDate || !newBlockReason) return;
    try {
      setIsAddingBlock(true);
      await addBlockedDate(configuration.configurationId, {
        blockedDate: newBlockDate,
        reason: newBlockReason,
      });
      setNewBlockDate("");
      setNewBlockReason("");
      setShowBlockForm(false);
      await loadDetail();
    } catch (err) {
      alert(err.message || "Failed to add blocked date.");
    } finally {
      setIsAddingBlock(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={() => navigate(ROUTES.ADMIN_SCHEDULING)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#0261F3]"
      >
        <ArrowLeft size={16} />
        Back to configuration history
      </button>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0261F3]">
            {configuration.name} / Details
          </p>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-950">
              {formatDate(configuration.startDate)} schedule
            </h1>
            <StatusPill status={configuration.status} />
          </div>
          <p className="mt-2 text-sm text-slate-500">
            {formatDate(configuration.startDate)} –{" "}
            {formatDate(configuration.endDate)} ·{" "}
            {configuration.status === "COMPLETED"
              ? "Read-only historical record"
              : "Upcoming exceptions are editable"}
          </p>
        </div>
        {canEditBlockedDates && (
          <button
            type="button"
            onClick={() => setShowBlockForm((value) => !value)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:border-blue-300 hover:text-[#0261F3]"
          >
            <Ban size={16} />
            Manage blocked dates
          </button>
        )}
      </div>

      {showBlockForm && (
        <section className="rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-bold text-slate-900">Upcoming exceptions</h2>
              <p className="mt-1 text-sm text-slate-500">
                Only future dates within this window can be blocked.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBlockForm(false)}
              className="text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-[180px_1fr_auto]">
            <input
              type="date"
              min={TODAY}
              max={configuration.endDate}
              value={newBlockDate}
              onChange={(event) => setNewBlockDate(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            />
            <input
              value={newBlockReason}
              onChange={(event) => setNewBlockReason(event.target.value)}
              placeholder="Reason for blocking this date"
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm"
            />
            <button
              type="button"
              onClick={handleAddBlock}
              disabled={isAddingBlock || !newBlockDate || !newBlockReason}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-4 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isAddingBlock && (
                <LoaderCircle size={14} className="animate-spin" />
              )}
              Add date
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DetailStat
            label="Booking window"
            value={`${configuration.bookingWindowDays} days`}
          />
          <DetailStat
            label="Slot capacity"
            value={`${configuration.slotCapacity} vehicles / slot`}
          />
          <DetailStat
            label="Temporary hold"
            value={`${configuration.holdDurationMinutes} minutes`}
          />
          <DetailStat
            label="Cancellation policy"
            value={`${configuration.cancellationNoticeHours} hours notice`}
          />
          <DetailStat
            label="Slot duration"
            value={`${configuration.slotDurationMinutes} minutes`}
          />
          <DetailStat
            label="Daily hours"
            value={`${configuration.openingTime.slice(0, 5)} – ${configuration.closingTime.slice(0, 5)}`}
          />
          <DetailStat
            label="Operating days"
            value={`${configuration.operatingDays?.length || 0} days / week`}
          />
          <DetailStat
            label="Blocked dates"
            value={`${configuration.blockedDates?.length || 0} dates`}
          />
        </div>
        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Operating days
          </p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => {
              const active = (configuration.operatingDays || []).some(
                (d) => d.toUpperCase() === day.toUpperCase(),
              );
              return (
                <span
                  key={day}
                  className={`rounded-lg px-3 py-2 text-xs font-bold ${
                    active
                      ? "bg-blue-50 text-[#0261F3]"
                      : "bg-slate-50 text-slate-300"
                  }`}
                >
                  {day.slice(0, 3)}
                </span>
              );
            })}
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <CalendarPanel
          configuration={configuration}
          month={month}
          setMonth={setMonth}
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          monthDays={monthDays}
        />

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                Daily slot schedule
              </p>
              <h2 className="mt-1 text-xl font-bold text-slate-950">
                {formatDate(selectedDate)}
              </h2>
            </div>
            {blocked ? (
              <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700">
                <Ban size={14} />
                Blocked · {blocked.reason}
              </div>
            ) : !isOperatingDay ? (
              <StatusPill status="Closed" />
            ) : (
              <span className="text-sm font-semibold text-slate-500">
                {selectedDay} · {slots.filter((s) => !s.isBreak).length}{" "}
                available slots
              </span>
            )}
          </div>

          {blocked || !isOperatingDay ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <LockKeyhole size={25} className="text-slate-300" />
              <p className="mt-3 font-bold text-slate-700">
                {blocked ? "This date is blocked" : "The workshop is closed"}
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Choose another date within this configuration window to inspect
                its operating slots.
              </p>
            </div>
          ) : (
            <div className="mt-5 space-y-2">
              {slots.map((slot) => (
                <div
                  key={slot.label}
                  className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3"
                >
                  <span className="text-sm font-bold text-slate-700">
                    {slot.label}
                  </span>
                  <StatusPill status={slot.isBreak ? "Break" : "Available"} />
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-900">
              Blocked dates and reasons
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Exceptions attached to this schedule configuration.
            </p>
          </div>
          {canEditBlockedDates && (
            <span className="text-xs font-semibold text-blue-600">
              Editable for upcoming dates
            </span>
          )}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(configuration.blockedDates || []).length > 0 ? (
            configuration.blockedDates.map((item) => (
              <div
                key={item.blockedDateId || item.blockedDate}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {formatDate(item.blockedDate)}
                  </p>
                  <p className="text-xs text-slate-500">{item.reason}</p>
                </div>
                {canEditBlockedDates && item.blockedDate > TODAY && (
                  <button
                    type="button"
                    onClick={() => handleRemoveBlock(item.blockedDateId)}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    title="Remove blocked date"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No blocked dates.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function CalendarPanel({
  configuration,
  month,
  setMonth,
  selectedDate,
  setSelectedDate,
  monthDays,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Schedule calendar
          </p>
          <h2 className="mt-1 font-bold text-slate-900">
            {month.toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </h2>
        </div>
        <div className="flex gap-1">
          <button
            type="button"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))
            }
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={() =>
              setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))
            }
            className="rounded-lg p-2 hover:bg-slate-100"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
      <div className="mt-5 grid grid-cols-7 gap-1 text-center text-[10px] font-bold uppercase text-slate-400">
        {SHORT_DAYS.map((day) => (
          <span key={day} className="py-2">
            {day}
          </span>
        ))}
        {monthDays.map((day) => {
          const date = toDateInput(day.date);
          const isBlocked = (configuration.blockedDates || []).some(
            (item) => item.blockedDate === date,
          );
          const isOutside =
            date < configuration.startDate || date > configuration.endDate;
          const isSelected = date === selectedDate;
          const dayUpper = WEEKDAYS[(day.date.getDay() + 6) % 7].toUpperCase();
          const isClosed = !(configuration.operatingDays || []).some(
            (d) => d.toUpperCase() === dayUpper,
          );

          return (
            <button
              type="button"
              key={date}
              disabled={isOutside}
              onClick={() => setSelectedDate(date)}
              className={`relative flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition ${
                isOutside
                  ? "cursor-not-allowed text-slate-200"
                  : isSelected
                    ? "bg-[#0261F3] text-white"
                    : isBlocked
                      ? "bg-rose-50 text-rose-600"
                      : isClosed
                        ? "bg-slate-50 text-slate-400"
                        : "text-slate-700 hover:bg-blue-50 hover:text-[#0261F3]"
              }`}
            >
              {day.date.getDate()}
              {isBlocked && !isSelected && (
                <span className="absolute bottom-1 h-1 w-1 rounded-full bg-rose-500" />
              )}
            </button>
          );
        })}
      </div>
      <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-200" />
          Blocked
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          Closed day
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
          Selected
        </div>
      </div>
    </section>
  );
}

function getMonthDays(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const days = [];
  for (let index = 0; index < 42; index += 1) {
    days.push({
      date: new Date(month.getFullYear(), month.getMonth(), index - offset + 1),
    });
  }
  return days;
}

function ConfigurationWizard({ navigate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    startDate: "2027-01-01",
    bookingWindowDays: 30,
    openingTime: "08:00",
    closingTime: "17:00",
    slotCapacity: 5,
    holdDurationMinutes: 15,
    cancellationNoticeHours: 24,
    slotDurationMinutes: 60,
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    breaks: [],
    blockedDates: [],
  });

  const [breakDay, setBreakDay] = useState("Monday");
  const [breakStart, setBreakStart] = useState("12:00");
  const [breakEnd, setBreakEnd] = useState("13:00");
  const [blockedDate, setBlockedDate] = useState("");
  const [blockedReason, setBlockedReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const calculatedEnd = useMemo(() => {
    if (!form.startDate) return "";
    const date = new Date(`${form.startDate}T12:00:00`);
    date.setDate(date.getDate() + Number(form.bookingWindowDays) - 1);
    while (
      !form.operatingDays.includes(WEEKDAYS[(date.getDay() + 6) % 7]) ||
      form.blockedDates.some((item) => item.blockedDate === toDateInput(date))
    ) {
      date.setDate(date.getDate() + 1);
    }
    return toDateInput(date);
  }, [
    form.startDate,
    form.bookingWindowDays,
    form.operatingDays,
    form.blockedDates,
  ]);

  const update = (key) => (value) =>
    setForm((current) => ({ ...current, [key]: value }));

  const toggleDay = (day) =>
    setForm((current) => ({
      ...current,
      operatingDays: current.operatingDays.includes(day)
        ? current.operatingDays.filter((item) => item !== day)
        : [...current.operatingDays, day],
    }));

  const addBreak = () => {
    if (!breakStart || !breakEnd || breakStart >= breakEnd) {
      alert("Break end time must be later than start time.");
      return;
    }
    setForm((current) => ({
      ...current,
      breaks: [
        ...current.breaks,
        {
          dayOfWeek: breakDay,
          startTime: breakStart,
          endTime: breakEnd,
          label: "Break",
        },
      ],
    }));
  };

  const addBlocked = () => {
    if (
      blockedDate &&
      blockedReason &&
      blockedDate >= form.startDate &&
      blockedDate <= calculatedEnd
    ) {
      setForm((current) => ({
        ...current,
        blockedDates: [
          ...current.blockedDates,
          { blockedDate, reason: blockedReason },
        ],
      }));
      setBlockedDate("");
      setBlockedReason("");
    }
  };

  const submit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError("");
      const payload = {
        name: form.name.trim() || undefined,
        startDate: form.startDate,
        bookingWindowDays: Number(form.bookingWindowDays),
        openingTime: form.openingTime,
        closingTime: form.closingTime,
        slotDurationMinutes: Number(form.slotDurationMinutes),
        slotCapacity: Number(form.slotCapacity),
        holdDurationMinutes: Number(form.holdDurationMinutes),
        cancellationNoticeHours: Number(form.cancellationNoticeHours),
        operatingDays: form.operatingDays.map((d) => d.toUpperCase()),
        breaks: form.breaks.map((b) => ({
          dayOfWeek: b.dayOfWeek.toUpperCase(),
          startTime: b.startTime,
          endTime: b.endTime,
          label: b.label || "Break",
        })),
        blockedDates: form.blockedDates.map((b) => ({
          blockedDate: b.blockedDate,
          reason: b.reason.trim(),
        })),
      };

      await createScheduleConfiguration(payload);
      navigate(ROUTES.ADMIN_SCHEDULING);
    } catch (err) {
      setSubmitError(err.message || "Failed to publish configuration.");
      setStep(1);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed =
    form.startDate &&
    form.operatingDays.length > 0 &&
    form.openingTime < form.closingTime;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <button
        type="button"
        onClick={() => navigate(ROUTES.ADMIN_SCHEDULING)}
        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#0261F3]"
      >
        <ArrowLeft size={16} />
        Back to configuration history
      </button>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-[#0261F3]">
          New schedule
        </p>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">
          Create configuration
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Set the rules once, review the simulated calendar, then publish.
        </p>
      </div>

      {submitError && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <Step
          number="01"
          label="Configuration"
          active={step === 1}
          complete={step > 1}
        />
        <div className="h-px flex-1 bg-slate-200" />
        <Step
          number="02"
          label="Review summary"
          active={step === 2}
          complete={step > 2}
        />
      </div>

      {step === 1 ? (
        <section className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-3">
            <Field
              label="Starting date"
              type="date"
              value={form.startDate}
              onChange={update("startDate")}
            />
            <Field
              label="Booking window (days)"
              type="number"
              min="1"
              value={form.bookingWindowDays}
              onChange={update("bookingWindowDays")}
            />
            <div className="rounded-xl bg-blue-50 p-3.5">
              <p className="text-xs font-bold uppercase tracking-[0.12em] text-blue-600">
                Calculated end date
              </p>
              <p className="mt-1 font-bold text-slate-900">
                {formatDate(calculatedEnd)}
              </p>
            </div>
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Operating days</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition ${
                    form.operatingDays.includes(day)
                      ? "border-blue-200 bg-blue-50 text-[#0261F3]"
                      : "border-slate-200 text-slate-500"
                  }`}
                >
                  {form.operatingDays.includes(day) && (
                    <Check size={14} className="mr-1 inline" />
                  )}
                  {day}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Daily opening hours</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <Field
                label="Opening time"
                type="time"
                value={form.openingTime}
                onChange={update("openingTime")}
              />
              <Field
                label="Closing time"
                type="time"
                value={form.closingTime}
                onChange={update("closingTime")}
              />
            </div>
            {form.openingTime >= form.closingTime && (
              <p className="mt-2 text-sm font-semibold text-rose-600">
                Closing time must be later than opening time.
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-slate-900">Break periods</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add a separate break for any operating day.
                </p>
              </div>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
              <select
                value={breakDay}
                onChange={(event) => setBreakDay(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              >
                {form.operatingDays.map((day) => (
                  <option key={day}>{day}</option>
                ))}
              </select>
              <input
                type="time"
                value={breakStart}
                onChange={(event) => setBreakStart(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <input
                type="time"
                value={breakEnd}
                onChange={(event) => setBreakEnd(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <button
                type="button"
                onClick={addBreak}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-[#0261F3]"
              >
                Add break
              </button>
            </div>
            <div className="mt-3 space-y-2">
              {form.breaks.map((item, index) => (
                <div
                  key={`${item.dayOfWeek}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                >
                  <span>
                    <b>{item.dayOfWeek}</b> · {item.startTime} – {item.endTime}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        breaks: current.breaks.filter((_, i) => i !== index),
                      }))
                    }
                    className="text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            <Field
              label="Capacity / slot"
              type="number"
              min="1"
              value={form.slotCapacity}
              onChange={update("slotCapacity")}
            />
            <Field
              label="Temporary hold (min)"
              type="number"
              min="1"
              value={form.holdDurationMinutes}
              onChange={update("holdDurationMinutes")}
            />
            <Field
              label="Cancellation (hours)"
              type="number"
              min="0"
              value={form.cancellationNoticeHours}
              onChange={update("cancellationNoticeHours")}
            />
            <Field
              label="Slot duration (min)"
              type="number"
              min="15"
              value={form.slotDurationMinutes}
              onChange={update("slotDurationMinutes")}
            />
          </div>

          <div>
            <h2 className="font-bold text-slate-900">Blocked dates</h2>
            <div className="mt-3 grid gap-3 md:grid-cols-[180px_1fr_auto]">
              <input
                type="date"
                min={form.startDate}
                max={calculatedEnd}
                value={blockedDate}
                onChange={(event) => setBlockedDate(event.target.value)}
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <input
                value={blockedReason}
                onChange={(event) => setBlockedReason(event.target.value)}
                placeholder="Reason"
                className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
              <button
                type="button"
                onClick={addBlocked}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-700 hover:border-blue-300 hover:text-[#0261F3]"
              >
                Add date
              </button>
            </div>
            {form.blockedDates.map((item, index) => (
              <div
                key={`${item.blockedDate}-${index}`}
                className="mt-2 flex justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
              >
                <span>
                  <b>{formatDate(item.blockedDate)}</b> · {item.reason}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      blockedDates: current.blockedDates.filter(
                        (_, i) => i !== index,
                      ),
                    }))
                  }
                  className="text-slate-400 hover:text-rose-600"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="button"
              disabled={!canProceed}
              onClick={() => setStep(2)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-5 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              Review summary <ArrowRight size={16} />
            </button>
          </div>
        </section>
      ) : (
        <SummaryStep
          form={form}
          calculatedEnd={calculatedEnd}
          setStep={setStep}
          submit={submit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}

function Step({ number, label, active, complete }) {
  return (
    <div
      className={`flex items-center gap-3 ${active || complete ? "text-[#0261F3]" : "text-slate-400"}`}
    >
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
          complete
            ? "bg-emerald-500 text-white"
            : active
              ? "bg-[#0261F3] text-white"
              : "bg-slate-100"
        }`}
      >
        {complete ? <Check size={14} /> : number}
      </span>
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

function SummaryStep({ form, calculatedEnd, setStep, submit, isSubmitting }) {
  const previewConfig = {
    openingTime: form.openingTime,
    closingTime: form.closingTime,
    slotDurationMinutes: form.slotDurationMinutes,
    breaks: form.breaks,
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3 rounded-xl bg-blue-50 p-4">
        <CalendarDays className="mt-0.5 text-[#0261F3]" size={19} />
        <div>
          <h2 className="font-bold text-slate-900">
            Ready to publish this schedule?
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Review the rules and simulated slots below. You can go back to make
            changes.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Schedule window
          </p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {formatDate(form.startDate)} – {formatDate(calculatedEnd)}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {form.bookingWindowDays} booking days ·{" "}
            {form.operatingDays.join(", ")}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Daily hours
          </p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {form.openingTime} – {form.closingTime}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {form.slotDurationMinutes} minute slots · {form.slotCapacity}{" "}
            vehicle capacity
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-slate-100 pt-5">
        <h3 className="font-bold text-slate-900">Simulated slots</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {form.operatingDays.map((day) => {
            const slots = getSlots(previewConfig, day);
            return (
              <div key={day} className="rounded-xl border border-slate-100 p-4">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800">{day}</p>
                  <span className="text-xs font-semibold text-slate-400">
                    {slots.length} slots
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {slots.slice(0, 8).map((slot) => (
                    <span
                      key={slot.label}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${
                        slot.isBreak
                          ? "bg-amber-50 text-amber-700"
                          : "bg-emerald-50 text-emerald-700"
                      }`}
                    >
                      {slot.label}
                      {slot.isBreak ? " (Break)" : ""}
                    </span>
                  ))}
                  {slots.length > 8 && (
                    <span className="rounded-lg bg-slate-50 px-2 py-1.5 text-xs text-slate-400">
                      +{slots.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
        <button
          type="button"
          onClick={() => setStep(1)}
          disabled={isSubmitting}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700"
        >
          Back to edit
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            disabled={isSubmitting}
            className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting && (
              <LoaderCircle size={16} className="animate-spin" />
            )}
            Publish configuration
          </button>
        </div>
      </div>
    </section>
  );
}

export default SchedulePage;
