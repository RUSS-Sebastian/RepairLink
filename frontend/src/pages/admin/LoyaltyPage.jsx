import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  BarChart3,
  CheckCircle2,
  CircleDollarSign,
  ChevronRight,
  Info,
  LoaderCircle,
  Pencil,
  Plus,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  Trophy,
  X,
} from "lucide-react";

import Button from "../../components/common/Button";
import {
  createLoyaltyRank,
  listLoyaltyRanks,
  setLoyaltyRankActive,
  updateLoyaltyRank,
} from "../../features/loyalty/loyaltyApi";

const EMPTY_FORM = {
  rankName: "",
  minimumPoints: "",
  maximumPoints: "",
  discountPercentage: "",
};

function LoyaltyPage() {
  const [ranks, setRanks] = useState([]);
  const [summary, setSummary] = useState({ total: 0, active: 0, inactive: 0 });
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [notice, setNotice] = useState("");
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [changingId, setChangingId] = useState(null);

  const loadRanks = async () => {
    try {
      setLoading(true);
      setPageError("");
      const response = await listLoyaltyRanks();
      setRanks(response.items || []);
      setSummary({
        total: response.total ?? 0,
        active: response.active ?? 0,
        inactive: response.inactive ?? 0,
      });
    } catch (error) {
      setPageError(error.message || "Unable to load loyalty ranks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRanks();
  }, []);

  const nextMinimumPoints = useMemo(() => {
    if (ranks.length === 0) return 0;
    return Number(ranks[ranks.length - 1].maximumPoints) + 1;
  }, [ranks]);

  const highestRank = ranks[ranks.length - 1];
  const averageDiscount = ranks.length
    ? ranks.reduce(
        (total, rank) => total + Number(rank.discountPercentage),
        0,
      ) / ranks.length
    : 0;

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, minimumPoints: String(nextMinimumPoints) });
    setFormError("");
    setModal("create");
  };

  const openEdit = (rank) => {
    setForm({
      rankName: rank.rankName,
      minimumPoints: String(rank.minimumPoints),
      maximumPoints: String(rank.maximumPoints),
      discountPercentage: String(rank.discountPercentage),
    });
    setFormError("");
    setModal(rank);
  };

  const handleSave = async (event) => {
    event.preventDefault();
    const payload = {
      rankName: form.rankName.trim(),
      minimumPoints: Number(form.minimumPoints),
      maximumPoints: Number(form.maximumPoints),
      discountPercentage: Number(form.discountPercentage),
    };

    if (
      !payload.rankName ||
      !Number.isFinite(payload.minimumPoints) ||
      !Number.isFinite(payload.maximumPoints) ||
      !Number.isFinite(payload.discountPercentage)
    ) {
      setFormError("Complete all fields with valid values.");
      return;
    }
    if (
      payload.minimumPoints < 0 ||
      payload.maximumPoints < payload.minimumPoints ||
      payload.discountPercentage < 0 ||
      payload.discountPercentage > 100
    ) {
      setFormError("Check the point range and discount percentage.");
      return;
    }

    try {
      setSaving(true);
      const response =
        modal === "create"
          ? await createLoyaltyRank(payload)
          : await updateLoyaltyRank(modal.id, payload);
      setRanks((current) =>
        modal === "create"
          ? [...current, response].sort(
              (a, b) => a.minimumPoints - b.minimumPoints,
            )
          : current.map((rank) => (rank.id === response.id ? response : rank)),
      );
      setSummary((current) => ({
        ...current,
        total: modal === "create" ? current.total + 1 : current.total,
        active: modal === "create" ? current.active + 1 : current.active,
      }));
      setModal(null);
      setNotice(
        modal === "create"
          ? "Loyalty rank created successfully."
          : "Loyalty rank updated successfully.",
      );
      if (modal !== "create") await loadRanks();
    } catch (error) {
      setFormError(error.message || "Unable to save this loyalty rank.");
    } finally {
      setSaving(false);
    }
  };

  const toggleRank = async (rank) => {
    try {
      setChangingId(rank.id);
      const response = await setLoyaltyRankActive(rank.id, !rank.active);

      const latest = await listLoyaltyRanks();
      setRanks(latest.items || []);
      setSummary({
        total: latest.total ?? 0,
        active: latest.active ?? 0,
        inactive: latest.inactive ?? 0,
      });
      setNotice(
        `${rank.rankName} is now ${response.active ? "active" : "inactive"}.`,
      );
    } catch (error) {
      setPageError(error.message || "Unable to change rank status.");
    } finally {
      setChangingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-20 h-64 w-64 rounded-full border-[28px] border-blue-500/15" />
        <div className="pointer-events-none absolute -bottom-24 right-40 h-48 w-48 rounded-full border-[18px] border-emerald-400/10" />
        <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">
              <Trophy size={13} /> Rewards configuration
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Loyalty ranks
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Build a clear path from first visit to loyal advocate with point
              thresholds and meaningful rewards.
            </p>
          </div>
          <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg shadow-blue-500/30">
              <BarChart3 size={21} />
            </div>
            <div className="pr-3">
              <p className="text-xs font-medium text-slate-400">
                Current program
              </p>
              <p className="mt-0.5 text-sm font-semibold text-white">
                {summary.active} active tiers
              </p>
            </div>
            <Button onClick={openCreate} className="px-4 py-2.5">
              <Plus size={16} className="mr-2" /> Add rank
            </Button>
          </div>
        </div>
      </header>

      {notice && <Notice success text={notice} onClose={() => setNotice("")} />}
      {pageError && (
        <Notice text={pageError} onClose={() => setPageError("")} />
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          icon={<Trophy size={19} />}
          label="Total ranks"
          value={summary.total}
          tone="blue"
        />
        <Stat
          icon={<ShieldCheck size={19} />}
          label="Active ranks"
          value={summary.active}
          tone="emerald"
        />
        <Stat
          icon={<ToggleLeft size={19} />}
          label="Inactive ranks"
          value={summary.inactive}
          tone="amber"
        />
        <Stat
          icon={<CircleDollarSign size={19} />}
          label="Average discount"
          value={`${averageDiscount.toFixed(1)}%`}
          tone="violet"
        />
      </div>

      {ranks.length > 0 && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Member journey
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                The path to {highestRank.rankName}
              </h2>
            </div>
            <p className="text-xs font-medium text-slate-400">
              {highestRank.maximumPoints.toLocaleString()} points in the top
              configured range
            </p>
          </div>
          <div className="mt-6 flex overflow-x-auto pb-2">
            {ranks.map((rank, index) => (
              <div
                key={rank.id}
                className="flex min-w-[190px] flex-1 items-center"
              >
                <div className="min-w-0 flex-1">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl text-lg font-bold shadow-sm ${index === ranks.length - 1 ? "bg-slate-900 text-white" : "bg-blue-50 text-blue-600"}`}
                  >
                    {rank.rankOrder ?? index + 1}
                  </div>
                  <p className="mt-3 truncate text-sm font-bold text-slate-900">
                    {rank.rankName}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {Number(rank.discountPercentage)}% reward
                  </p>
                </div>
                {index < ranks.length - 1 && (
                  <ChevronRight
                    size={18}
                    className="mx-3 shrink-0 text-slate-300"
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Rank ladder
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Ranges are continuous so every loyalty point belongs to one rank.
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700">
            <Info size={15} /> First rank starts at 0 points
          </div>
        </div>
        {loading ? (
          <div className="flex items-center gap-3 px-6 py-12 text-sm text-slate-500">
            <LoaderCircle size={18} className="animate-spin" />
            Loading loyalty ranks...
          </div>
        ) : ranks.length === 0 ? (
          <EmptyState onAdd={openCreate} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] border-separate border-spacing-0 text-left">
              <thead className="bg-slate-950 text-[11px] uppercase tracking-[0.16em] text-slate-300">
                <tr>
                  <th className="rounded-tl-xl px-6 py-4 font-semibold">
                    Tier identity
                  </th>
                  <th className="px-6 py-4 font-semibold">Progression range</th>
                  <th className="px-6 py-4 font-semibold">Member reward</th>
                  <th className="px-6 py-4 font-semibold">Availability</th>
                  <th className="rounded-tr-xl px-6 py-4 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {ranks.map((rank) => (
                  <tr
                    key={rank.id}
                    className="group transition hover:bg-blue-50/40"
                  >
                    <td className="border-b border-slate-100 px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-blue-600 font-bold text-white shadow-sm">
                          <span className="absolute -right-3 -top-3 h-7 w-7 rounded-full bg-white/20" />
                          {rank.rankOrder ?? "-"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate font-bold text-slate-900 transition group-hover:text-blue-700">
                              {rank.rankName}
                            </p>
                            {rank.protectedRank && (
                              <ShieldCheck
                                size={14}
                                className="shrink-0 text-blue-500"
                              />
                            )}
                          </div>
                          {rank.protectedRank && (
                            <p className="mt-1 text-xs font-medium text-slate-400">
                              Protected foundation tier
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-6 py-6">
                      <div className="flex items-center justify-between gap-4">
                        <p className="font-bold text-slate-700">
                          {rank.minimumPoints.toLocaleString()} -{" "}
                          {rank.maximumPoints.toLocaleString()}
                        </p>
                        <span className="text-xs font-semibold text-slate-400">
                          pts
                        </span>
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-6 py-6">
                      <div className="inline-flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-3.5 py-2.5">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm">
                          <CircleDollarSign size={15} />
                        </div>
                        <div>
                          <p className="text-lg font-bold leading-none text-emerald-700">
                            {rank.discountPercentage}%
                          </p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-emerald-600/70">
                            discount
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="border-b border-slate-100 px-6 py-6">
                      <span
                        className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${rank.active ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-500"}`}
                      >
                        <span
                          className={`h-2 w-2 rounded-full ${rank.active ? "bg-emerald-500 shadow-[0_0_0_3px] shadow-emerald-100" : "bg-slate-400"}`}
                        />
                        {rank.active ? (
                          <ToggleRight size={15} className="hidden" />
                        ) : (
                          <ToggleLeft size={15} className="hidden" />
                        )}
                        {rank.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="border-b border-slate-100 px-6 py-6">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(rank)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
                        >
                          <Pencil size={14} />
                          Edit
                        </button>
                        {!rank.protectedRank && (
                          <button
                            type="button"
                            disabled={changingId === rank.id}
                            onClick={() => toggleRank(rank)}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs font-bold text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600 disabled:opacity-50"
                          >
                            {changingId === rank.id
                              ? "Saving..."
                              : rank.active
                                ? "Deactivate"
                                : "Activate"}
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
      </section>

      {modal && (
        <RankModal
          modal={modal}
          form={form}
          setForm={setForm}
          error={formError}
          saving={saving}
          onClose={() => setModal(null)}
          onSubmit={handleSave}
        />
      )}
    </div>
  );
}

function RankModal({ modal, form, setForm, error, saving, onClose, onSubmit }) {
  const fields = [
    { key: "rankName", label: "Rank name", type: "text" },
    { key: "minimumPoints", label: "Minimum points", type: "number" },
    { key: "maximumPoints", label: "Maximum points", type: "number" },
    { key: "discountPercentage", label: "Discount percentage", type: "number" },
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {modal === "create"
                ? "Add loyalty rank"
                : `Edit ${modal.rankName}`}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Keep the points ladder continuous.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <form onSubmit={onSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div className="flex gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle size={17} className="shrink-0" />
              {error}
            </div>
          )}
          {fields.map((field) => (
            <label key={field.key} className="block">
              <span className="mb-1.5 block text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                {field.label}
              </span>
              <input
                type={field.type}
                min="0"
                step={field.key === "discountPercentage" ? "0.01" : "1"}
                value={form[field.key]}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field.key]: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 px-3.5 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                required
              />
            </label>
          ))}
          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : modal === "create"
                  ? "Create rank"
                  : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Stat({ icon, label, value, tone }) {
  const styles = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-xl ${styles[tone]}`}
        >
          {icon}
        </div>
        <p className="text-3xl font-bold text-slate-900">{value}</p>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

function Notice({ text, success = false, onClose }) {
  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-xl border p-4 text-sm ${success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}
    >
      <div className="flex items-start gap-2">
        {success ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
        <span>{text}</span>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Dismiss"
        className="opacity-70 hover:opacity-100"
      >
        <X size={16} />
      </button>
    </div>
  );
}

function EmptyState({ onAdd }) {
  return (
    <div className="px-6 py-14 text-center">
      <Trophy size={28} className="mx-auto text-slate-300" />
      <h3 className="mt-3 font-semibold text-slate-900">
        No loyalty ranks configured
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        Create the first rank to start your rewards ladder.
      </p>
      <Button className="mt-5" onClick={onAdd}>
        <Plus size={16} className="mr-2" />
        Add first rank
      </Button>
    </div>
  );
}

export default LoyaltyPage;
