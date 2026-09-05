import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
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
  LockKeyhole,
  Plus,
  Search,
  Settings2,
  Trash2,
  Users,
  X,
} from "lucide-react";

import { ROUTES } from "../../constants/routes";

const TODAY = "2026-09-05";
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

const INITIAL_CONFIGURATIONS = [
  {
    id: "config-1",
    name: "Config 1",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    bookingWindow: 30,
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opening: "08:00",
    closing: "17:00",
    breaks: [{ day: "Monday", start: "12:00", end: "13:00" }],
    capacity: 4,
    hold: 15,
    cancellation: 24,
    duration: 60,
    blockedDates: [{ date: "2026-08-17", reason: "Public holiday" }],
    status: "Completed",
  },
  {
    id: "config-2",
    name: "Config 2",
    startDate: "2026-09-01",
    endDate: "2026-09-30",
    bookingWindow: 30,
    operatingDays: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    opening: "08:00",
    closing: "18:00",
    breaks: [
      { day: "Monday", start: "12:00", end: "13:00" },
      { day: "Tuesday", start: "12:00", end: "13:00" },
      { day: "Wednesday", start: "12:00", end: "13:00" },
      { day: "Thursday", start: "12:00", end: "13:00" },
      { day: "Friday", start: "12:00", end: "13:00" },
    ],
    capacity: 6,
    hold: 20,
    cancellation: 24,
    duration: 60,
    blockedDates: [{ date: "2026-09-14", reason: "Team training" }],
    status: "Current",
  },
  {
    id: "config-3",
    name: "Config 3",
    startDate: "2026-10-01",
    endDate: "2026-10-31",
    bookingWindow: 31,
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opening: "09:00",
    closing: "17:00",
    breaks: [{ day: "Wednesday", start: "12:30", end: "13:30" }],
    capacity: 5,
    hold: 15,
    cancellation: 48,
    duration: 45,
    blockedDates: [{ date: "2026-10-12", reason: "Workshop maintenance" }],
    status: "Upcoming",
  },
  {
    id: "config-4",
    name: "Config 4",
    startDate: "2026-11-01",
    endDate: "2026-11-30",
    bookingWindow: 30,
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opening: "08:30",
    closing: "17:30",
    breaks: [{ day: "Friday", start: "12:00", end: "13:00" }],
    capacity: 5,
    hold: 15,
    cancellation: 24,
    duration: 60,
    blockedDates: [],
    status: "Upcoming",
  },
  {
    id: "config-5",
    name: "Config 5",
    startDate: "2026-12-01",
    endDate: "2026-12-31",
    bookingWindow: 31,
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opening: "08:00",
    closing: "16:00",
    breaks: [],
    capacity: 4,
    hold: 15,
    cancellation: 24,
    duration: 60,
    blockedDates: [],
    status: "Upcoming",
  },
];

const formatDate = (date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
const formatShortDate = (date) =>
  new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(
    new Date(`${date}T12:00:00`),
  );
const toDateInput = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
const timeToMinutes = (value) => {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
};
const minutesToTime = (value) =>
  `${String(Math.floor(value / 60)).padStart(2, "0")}:${String(value % 60).padStart(2, "0")}`;
const getSlots = (configuration, day) => {
  const slots = [];
  const opening = timeToMinutes(configuration.opening);
  const closing = timeToMinutes(configuration.closing);
  const dayBreaks = configuration.breaks
    .filter((item) => item.day === day)
    .sort(
      (first, second) =>
        timeToMinutes(first.start) - timeToMinutes(second.start),
    );
  const showOccupancy = configuration.status !== "Upcoming";
  let start = opening;
  while (start < closing) {
    const breakPeriod = dayBreaks.find((item) => {
      const breakStart = timeToMinutes(item.start);
      const breakEnd = timeToMinutes(item.end);
      return start >= breakStart && start < breakEnd;
    });
    const nextBreak = dayBreaks.find(
      (item) =>
        timeToMinutes(item.start) > start &&
        timeToMinutes(item.start) < start + Number(configuration.duration),
    );
    if (nextBreak) {
      const nextBreakStart = timeToMinutes(nextBreak.start);
      slots.push({
        label: `${minutesToTime(start)} – ${minutesToTime(nextBreakStart)}`,
        booked: 0,
        held: 0,
        users: [],
      });
      start = nextBreakStart;
      continue;
    }
    if (breakPeriod) {
      slots.push({
        label: `${breakPeriod.start} – ${breakPeriod.end}`,
        isBreak: true,
        booked: 0,
        held: 0,
        users: [],
      });
      start = timeToMinutes(breakPeriod.end);
      continue;
    }
    const end = Math.min(start + Number(configuration.duration), closing);
    const booked = showOccupancy
      ? (start * 3 + day.length) % (configuration.capacity + 1)
      : 0;
    slots.push({
      label: `${minutesToTime(start)} – ${minutesToTime(end)}`,
      booked,
      held: showOccupancy && booked === 0 ? 1 : 0,
      users: showOccupancy
        ? ["Ava Thompson", "Marcus Lee", "Noah Williams", "Sophia Chen"].slice(
            0,
            booked,
          )
        : [],
    });
        start = end;
  }
  return slots;
};

function StatusPill({ status }) {
  const styles = {
    Current: "border-emerald-200 bg-emerald-50 text-emerald-700",
    Completed: "border-slate-200 bg-slate-100 text-slate-600",
    Upcoming: "border-blue-200 bg-blue-50 text-blue-700",
    Closed: "border-slate-200 bg-slate-100 text-slate-500",
    Available: "bg-emerald-50 text-emerald-700",
    Full: "bg-rose-50 text-rose-700",
    Break: "bg-amber-50 text-amber-700",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[status] || styles.Upcoming}`}
    >
      {status}
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
  const [configurations, setConfigurations] = useState(INITIAL_CONFIGURATIONS);
  const configuration =
    configurations.find((item) => item.id === configurationId) ||
    configurations[1];

  if (mode === "detail")
    return (
      <ScheduleDetail
        configuration={configuration}
        setConfigurations={setConfigurations}
        navigate={navigate}
      />
    );
  if (mode === "create")
    return (
      <ConfigurationWizard
        configurations={configurations}
        setConfigurations={setConfigurations}
        navigate={navigate}
      />
    );
  return (
    <ScheduleHistory
      configurations={configurations}
      setConfigurations={setConfigurations}
      navigate={navigate}
    />
  );
}

function ScheduleHistory({ configurations, setConfigurations, navigate }) {
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [configurationToDelete, setConfigurationToDelete] = useState(null);
  const filtered = configurations.filter(
    (item) =>
      (!dateFrom || item.endDate >= dateFrom) &&
      (!dateTo || item.startDate <= dateTo),
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const rows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const setFilter = (setter) => (value) => {
    setter(value);
    setPage(1);
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

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Configurations"
          value={configurations.length}
          icon={Settings2}
        />
        <Metric
          label="Current window"
          value={
            configurations.find((item) => item.status === "Current")?.name ||
            "None"
          }
          icon={CalendarDays}
        />
        <Metric
          label="Next opening"
          value={formatShortDate(
            configurations.find((item) => item.status === "Upcoming")
              ?.startDate || configurations[0].startDate,
          )}
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
                onChange={setFilter(setDateFrom)}
                type="date"
              />
              <Field
                label="To date"
                value={dateTo}
                onChange={setFilter(setDateTo)}
                type="date"
              />
            </div>
          </div>
        </div>
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
                  key={item.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-blue-50/30"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-xs font-bold text-[#0261F3]">
                        {item.name.replace("Config ", "C")}
                      </span>
                      <div>
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">
                          {item.operatingDays.length} operating days ·{" "}
                          {item.duration} min slots
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
                        onClick={() => navigate(`/admin/scheduling/${item.id}`)}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-[#0261F3]"
                      >
                        <Eye size={14} />
                        View details
                      </button>
                      {item.status === "Upcoming" && (
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
        {rows.length === 0 && (
          <div className="px-6 py-12 text-center text-sm text-slate-500">
            No configurations overlap this date range.
          </div>
        )}
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          <span>
            Showing {rows.length ? (page - 1) * PAGE_SIZE + 1 : 0}–
            {Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
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
              Page {page} / {pageCount}
            </span>
            <button
              type="button"
              disabled={page === pageCount}
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
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfigurations((items) =>
                    items.filter(
                      (item) => item.id !== configurationToDelete.id,
                    ),
                  );
                  setConfigurationToDelete(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white"
              >
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

function ScheduleDetail({ configuration, setConfigurations, navigate }) {
  const [selectedDate, setSelectedDate] = useState(configuration.startDate);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [newBlockDate, setNewBlockDate] = useState("");
  const [newBlockReason, setNewBlockReason] = useState("");
  const [month, setMonth] = useState(
    new Date(`${configuration.startDate}T12:00:00`),
  );
  const canEditBlockedDates =
    configuration.status === "Current" || configuration.status === "Upcoming";
  const selectedDay =
    WEEKDAYS[(new Date(`${selectedDate}T12:00:00`).getDay() + 6) % 7];
  const blocked = configuration.blockedDates.find(
    (item) => item.date === selectedDate,
  );
  const slots = blocked ? [] : getSlots(configuration, selectedDay);
  const showOccupancy = configuration.status !== "Upcoming";
  const monthDays = getMonthDays(month);
  const removeBlock = (date) =>
    setConfigurations((items) =>
      items.map((item) =>
        item.id === configuration.id
          ? {
              ...item,
              blockedDates: item.blockedDates.filter(
                (entry) => entry.date !== date,
              ),
            }
          : item,
      ),
    );
  const addBlock = () => {
    if (!newBlockDate || !newBlockReason || newBlockDate <= TODAY) return;
    setConfigurations((items) =>
      items.map((item) =>
        item.id === configuration.id
          ? {
              ...item,
              blockedDates: [
                ...item.blockedDates,
                { date: newBlockDate, reason: newBlockReason },
              ],
            }
          : item,
      ),
    );
    setNewBlockDate("");
    setNewBlockReason("");
    setShowBlockForm(false);
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
            {configuration.status === "Completed"
              ? "Read-only historical record"
              : "Upcoming changes are editable"}
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
                Only future dates can be added or removed from an active or
                upcoming configuration.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowBlockForm(false)}
              className="text-slate-400"
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
              onClick={addBlock}
              className="rounded-xl bg-[#0261F3] px-4 py-2.5 text-sm font-bold text-white"
            >
              Add date
            </button>
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <DetailStat
            label="Booking window"
            value={`${configuration.bookingWindow} days`}
          />
          <DetailStat
            label="Slot capacity"
            value={`${configuration.capacity} vehicles`}
          />
          <DetailStat
            label="Temporary hold"
            value={`${configuration.hold} minutes`}
          />
          <DetailStat
            label="Cancellation policy"
            value={`${configuration.cancellation} hours`}
          />
          <DetailStat
            label="Slot duration"
            value={`${configuration.duration} minutes`}
          />
          <DetailStat
            label="Daily hours"
            value={`${configuration.opening} – ${configuration.closing}`}
          />
          <DetailStat
            label="Operating days"
            value={`${configuration.operatingDays.length} days / week`}
          />
          <DetailStat
            label="Blocked dates"
            value={`${configuration.blockedDates.length} dates`}
          />
        </div>
        <div className="mt-6 border-t border-slate-100 pt-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Operating days
          </p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className={`rounded-lg px-3 py-2 text-xs font-bold ${configuration.operatingDays.includes(day) ? "bg-blue-50 text-[#0261F3]" : "bg-slate-50 text-slate-300"}`}
              >
                {day.slice(0, 3)}
              </span>
            ))}
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
                Daily capacity view
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
            ) : !configuration.operatingDays.includes(selectedDay) ? (
              <StatusPill status="Closed" />
            ) : (
              <span className="text-sm font-semibold text-slate-500">
                {selectedDay}
              </span>
            )}
          </div>
          {blocked || !configuration.operatingDays.includes(selectedDay) ? (
            <div className="flex min-h-64 flex-col items-center justify-center text-center">
              <LockKeyhole size={25} className="text-slate-300" />
              <p className="mt-3 font-bold text-slate-700">
                {blocked ? "This date is blocked" : "The workshop is closed"}
              </p>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Choose another date within this configuration window to inspect
                its slots.
              </p>
            </div>
          ) : (
            <>
              {showOccupancy && (
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <CapacitySummary
                    label="Available slots"
                    value={
                      slots.filter(
                        (slot) =>
                          !slot.isBreak && slot.booked < configuration.capacity,
                      ).length
                    }
                    color="text-emerald-600"
                  />
                  <CapacitySummary
                    label="Full slots"
                    value={
                      slots.filter(
                        (slot) =>
                          !slot.isBreak &&
                          slot.booked >= configuration.capacity,
                      ).length
                    }
                    color="text-rose-600"
                  />
                  <CapacitySummary
                    label="Held slots"
                    value={slots.reduce((sum, slot) => sum + slot.held, 0)}
                    color="text-amber-600"
                  />
                </div>
              )}
              <div className="mt-5 space-y-2">
                {slots.map((slot) => {
                  const full =
                    !slot.isBreak && slot.booked >= configuration.capacity;
                  const hold = !full && slot.held > 0;
                  const status = slot.isBreak
                    ? "Break"
                    : full
                      ? "Full"
                      : hold
                        ? "Break"
                        : "Available";
                  return (
                    <div
                      key={slot.label}
                      className="grid grid-cols-[80px_1fr_auto] items-center gap-4 rounded-xl border border-slate-100 px-4 py-3"
                    >
                      <span className="text-sm font-bold text-slate-700">
                        {slot.label}
                      </span>
                      <div>
                        {slot.isBreak ? (
                          <p className="text-sm font-semibold text-amber-700">
                            Break
                          </p>
                        ) : showOccupancy ? (
                          <>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${full ? "bg-rose-400" : hold ? "bg-amber-400" : "bg-emerald-400"}`}
                                style={{
                                  width: `${Math.max(10, (slot.booked / configuration.capacity) * 100)}%`,
                                }}
                              />
                            </div>
                            <p className="mt-1 text-xs text-slate-500">
                              {slot.booked} booked ·{" "}
                              {configuration.capacity - slot.booked} remaining ·{" "}
                              {slot.held} held
                              {slot.users?.length
                                ? ` · ${slot.users.join(", ")}`
                                : ""}
                            </p>
                          </>
                        ) : null}
                      </div>
                      {(slot.isBreak || showOccupancy) && (
                        <StatusPill status={status} />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
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
          {configuration.blockedDates.length ? (
            configuration.blockedDates.map((item) => (
              <div
                key={item.date}
                className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    {formatDate(item.date)}
                  </p>
                  <p className="text-xs text-slate-500">{item.reason}</p>
                </div>
                {canEditBlockedDates && item.date > TODAY && (
                  <button
                    type="button"
                    onClick={() => removeBlock(item.date)}
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

function CapacitySummary({ label, value, color }) {
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
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
          const isBlocked = configuration.blockedDates.some(
            (item) => item.date === date,
          );
          const isOutside =
            date < configuration.startDate || date > configuration.endDate;
          const isSelected = date === selectedDate;
          const isClosed = !configuration.operatingDays.includes(
            WEEKDAYS[(day.date.getDay() + 6) % 7],
          );
          return (
            <button
              type="button"
              key={date}
              disabled={isOutside}
              onClick={() => setSelectedDate(date)}
              className={`relative flex h-9 items-center justify-center rounded-lg text-xs font-semibold transition ${isOutside ? "cursor-not-allowed text-slate-200" : isSelected ? "bg-[#0261F3] text-white" : isBlocked ? "bg-rose-50 text-rose-600" : isClosed ? "bg-slate-50 text-slate-400" : "text-slate-700 hover:bg-blue-50 hover:text-[#0261F3]"}`}
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
  for (let index = 0; index < 42; index += 1)
    days.push({
      date: new Date(month.getFullYear(), month.getMonth(), index - offset + 1),
    });
  return days;
}

function ConfigurationWizard({ configurations, setConfigurations, navigate }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    startDate: "2027-01-01",
    bookingWindow: 30,
    opening: "08:00",
    closing: "17:00",
    capacity: 5,
    hold: 15,
    cancellation: 24,
    duration: 60,
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    breaks: [],
    blockedDates: [],
  });
  const [breakDay, setBreakDay] = useState("Monday");
  const [breakStart, setBreakStart] = useState("12:00");
  const [breakEnd, setBreakEnd] = useState("13:00");
  const [blockedDate, setBlockedDate] = useState("");
  const [blockedReason, setBlockedReason] = useState("");
  const previous = configurations.find(
    (item) => item.endDate >= form.startDate,
  );
  const calculatedEnd = useMemo(() => {
    const date = new Date(`${form.startDate}T12:00:00`);
    date.setDate(date.getDate() + Number(form.bookingWindow) - 1);
    while (
      !form.operatingDays.includes(WEEKDAYS[(date.getDay() + 6) % 7]) ||
      form.blockedDates.some((item) => item.date === toDateInput(date))
    )
      date.setDate(date.getDate() + 1);
    return toDateInput(date);
  }, [
    form.startDate,
    form.bookingWindow,
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
  const addBreak = () =>
    setForm((current) => ({
      ...current,
      breaks: [
        ...current.breaks,
        { day: breakDay, start: breakStart, end: breakEnd },
      ],
    }));
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
          { date: blockedDate, reason: blockedReason },
        ],
      }));
      setBlockedDate("");
      setBlockedReason("");
    }
  };
  const submit = () => {
    const item = {
      ...form,
      id: `config-${configurations.length + 1}`,
      name: `Config ${configurations.length + 1}`,
      endDate: calculatedEnd,
      status: "Upcoming",
    };
    setConfigurations((current) => [...current, item]);
    navigate(ROUTES.ADMIN_SCHEDULING);
  };
  const canProceed =
    form.startDate &&
    form.operatingDays.length &&
    form.opening < form.closing &&
    (!previous || form.startDate > previous.endDate);

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
              value={form.bookingWindow}
              onChange={update("bookingWindow")}
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
          {previous && (
            <p className="flex items-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <Info size={16} />
              This date overlaps {previous.name} (
              {formatDate(previous.startDate)} – {formatDate(previous.endDate)}
              ). Choose a later date.
            </p>
          )}
          <div>
            <h2 className="font-bold text-slate-900">Operating days</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {WEEKDAYS.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => toggleDay(day)}
                  className={`rounded-xl border px-3.5 py-2.5 text-sm font-semibold ${form.operatingDays.includes(day) ? "border-blue-200 bg-blue-50 text-[#0261F3]" : "border-slate-200 text-slate-500"}`}
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
                value={form.opening}
                onChange={update("opening")}
              />
              <Field
                label="Closing time"
                type="time"
                value={form.closing}
                onChange={update("closing")}
              />
            </div>
            {form.opening >= form.closing && (
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
                  key={`${item.day}-${index}`}
                  className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
                >
                  <span>
                    <b>{item.day}</b> · {item.start} – {item.end}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((current) => ({
                        ...current,
                        breaks: current.breaks.filter(
                          (_, itemIndex) => itemIndex !== index,
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
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            <Field
              label="Capacity / slot"
              type="number"
              min="1"
              value={form.capacity}
              onChange={update("capacity")}
            />
            <Field
              label="Temporary hold (min)"
              type="number"
              min="1"
              value={form.hold}
              onChange={update("hold")}
            />
            <Field
              label="Cancellation (hours)"
              type="number"
              min="0"
              value={form.cancellation}
              onChange={update("cancellation")}
            />
            <Field
              label="Slot duration (min)"
              type="number"
              min="15"
              value={form.duration}
              onChange={update("duration")}
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
            {form.blockedDates.map((item) => (
              <div
                key={item.date}
                className="mt-2 flex justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"
              >
                <span>
                  <b>{formatDate(item.date)}</b> · {item.reason}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      blockedDates: current.blockedDates.filter(
                        (entry) => entry.date !== item.date,
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
        className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${complete ? "bg-emerald-500 text-white" : active ? "bg-[#0261F3] text-white" : "bg-slate-100"}`}
      >
        {complete ? <Check size={14} /> : number}
      </span>
      <span className="text-sm font-bold">{label}</span>
    </div>
  );
}

function SummaryStep({ form, calculatedEnd, setStep, submit }) {
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
            {form.bookingWindow} booking days · {form.operatingDays.join(", ")}
          </p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Daily hours
          </p>
          <p className="mt-2 text-lg font-bold text-slate-900">
            {form.opening} – {form.closing}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {form.duration} minute slots · {form.capacity} vehicle capacity
          </p>
        </div>
      </div>
      <div className="mt-6 border-t border-slate-100 pt-5">
        <h3 className="font-bold text-slate-900">Simulated slots</h3>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {form.operatingDays.map((day) => (
            <div key={day} className="rounded-xl border border-slate-100 p-4">
              <div className="flex items-center justify-between">
                <p className="font-bold text-slate-800">{day}</p>
                <span className="text-xs font-semibold text-slate-400">
                  {getSlots({ ...form, endDate: calculatedEnd }, day).length}{" "}
                  slots
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {getSlots({ ...form, endDate: calculatedEnd }, day)
                  .slice(0, 6)
                  .map((slot) => (
                    <span
                      key={slot.label}
                      className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${slot.isBreak ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}
                    >
                      {slot.label}
                      {slot.isBreak ? " (Break)" : ""}
                    </span>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-col-reverse justify-between gap-3 border-t border-slate-100 pt-5 sm:flex-row">
        <button
          type="button"
          onClick={() => setStep(1)}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700"
        >
          Back to edit
        </button>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="rounded-xl px-5 py-3 text-sm font-bold text-slate-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={submit}
            className="rounded-xl bg-[#0261F3] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20"
          >
            Publish configuration
          </button>
        </div>
      </div>
    </section>
  );
}

export default SchedulePage;
