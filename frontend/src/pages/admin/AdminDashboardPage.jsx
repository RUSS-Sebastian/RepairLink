import { useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  Crown,
  Gauge,
  LoaderCircle,
  Package,
  Plus,
  Settings2,
  Sparkles,
  Users,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";

import Button from "../../components/common/Button";
import { ROUTES } from "../../constants/routes";
import { getAdminDashboardSummary } from "../../features/admin-dashboard/adminDashboardApi";
import { listAdditionalServices } from "../../features/additional-services/additionalServicesApi";
import { listParts } from "../../features/parts/partsApi";
import { listLoyaltyRanks } from "../../features/loyalty/loyaltyApi";
import { listScheduleConfigurations } from "../../features/schedule/scheduleApi";
import { getStoredAuthSession } from "../../utils/auth";

function AdminDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadDashboard() {
      const results = await Promise.allSettled([
        getAdminDashboardSummary(),
        listParts({ page: 0, size: 1 }),
        listAdditionalServices({ page: 0, size: 1 }),
        listLoyaltyRanks(),
        listScheduleConfigurations({ page: 0, size: 1 }),
      ]);

      if (!isMounted) return;

      const [customers, parts, services, loyalty, schedules] = results;
      const failed = results.filter((result) => result.status === "rejected");

      setData({
        customers: customers.status === "fulfilled" ? customers.value : null,
        parts: parts.status === "fulfilled" ? parts.value : null,
        services: services.status === "fulfilled" ? services.value : null,
        loyalty: loyalty.status === "fulfilled" ? loyalty.value : null,
        schedules: schedules.status === "fulfilled" ? schedules.value : null,
      });
      if (failed.length === results.length) {
        setError(
          "Dashboard data could not be loaded. Check that the backend is running.",
        );
      } else if (failed.length > 0) {
        setError("Some dashboard metrics are temporarily unavailable.");
      }
      setLoading(false);
    }

    loadDashboard();
    return () => {
      isMounted = false;
    };
  }, []);

  const session = getStoredAuthSession();
  const firstName = (session.user?.fullName || "Admin").split(" ")[0];
  const partsSummary = data?.parts?.summary;
  const servicesSummary = data?.services?.summary;
  const loyaltyRanks = data?.loyalty?.items || [];
  const scheduleMetrics = data?.schedules?.metrics;

  const metrics = [
    {
      label: "Total customers",
      value: data?.customers?.totalCustomers,
      detail: "Active customer accounts",
      icon: Users,
      tone: "blue",
    },
    {
      label: "Active loyalty ranks",
      value: data?.loyalty?.active,
      detail: `${data?.loyalty?.total ?? 0} ranks configured`,
      icon: Crown,
      tone: "violet",
    },
    {
      label: "Available parts",
      value: partsSummary?.total,
      detail: `${partsSummary?.lowStock ?? 0} low-stock items need attention`,
      icon: Package,
      tone: "emerald",
    },
    {
      label: "Active services",
      value: servicesSummary?.active,
      detail: `${servicesSummary?.total ?? 0} services in catalog`,
      icon: Wrench,
      tone: "amber",
    },
  ];

  return (
    <div className="space-y-6 pb-8">
      <section className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-slate-900/10 sm:px-8 sm:py-8">
        <div className="pointer-events-none absolute -right-12 -top-24 h-72 w-72 rounded-full border-[32px] border-blue-500/15" />
        <div className="pointer-events-none absolute -bottom-28 right-56 h-56 w-56 rounded-full border-[22px] border-emerald-400/10" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-blue-200">
              <Sparkles size={13} /> Operations overview
            </div>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Good morning, {firstName}.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300">
              Keep the workshop moving with a quick view of customers,
              inventory, rewards, and service readiness.
            </p>
          </div>
          <div className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-white/10 p-3 backdrop-blur-sm">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500 shadow-lg shadow-blue-500/30">
              <Gauge size={21} />
            </div>
            <div className="pr-3">
              <p className="text-xs text-slate-400">Schedule coverage</p>
              <p className="mt-0.5 text-sm font-semibold">
                {scheduleMetrics?.totalConfigurations ?? "-"} configurations
              </p>
            </div>
            <Link
              to={ROUTES.ADMIN_SCHEDULING}
              className="inline-flex items-center gap-1 rounded-xl bg-white px-3.5 py-2.5 text-xs font-bold text-slate-900 transition hover:bg-blue-50"
            >
              Open schedule <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} loading={loading} />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Inventory pulse
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Parts that need attention
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                A quick read on your current parts catalog.
              </p>
            </div>
            <Link
              to={ROUTES.ADMIN_PARTS}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              title="Manage parts"
            >
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <InventoryStat
              label="Catalog total"
              value={partsSummary?.total}
              icon={<Package size={17} />}
              tone="blue"
            />
            <InventoryStat
              label="Low stock"
              value={partsSummary?.lowStock}
              icon={<CircleAlert size={17} />}
              tone="amber"
            />
            <InventoryStat
              label="Out of stock"
              value={partsSummary?.outOfStock}
              icon={<AlertCircle size={17} />}
              tone="rose"
            />
          </div>
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <CircleAlert size={17} />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  Stock health
                </p>
                <p className="text-xs text-slate-500">
                  {partsSummary?.lowStock
                    ? "Review low-stock items before the next service cycle."
                    : "Your current catalog has no low-stock alerts."}
                </p>
              </div>
            </div>
            <Link
              to={ROUTES.ADMIN_PARTS}
              className="text-xs font-bold text-blue-600 hover:text-blue-700"
            >
              Review parts <ChevronRight size={14} className="inline" />
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Rewards program
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Loyalty ladder
              </h2>
            </div>
            <Link
              to={ROUTES.ADMIN_LOYALTY}
              className="rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
              title="Manage loyalty"
            >
              <ArrowUpRight size={17} />
            </Link>
          </div>
          {loyaltyRanks.length ? (
            <div className="mt-6 space-y-3">
              {loyaltyRanks.slice(0, 4).map((rank) => (
                <div
                  key={rank.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-xs font-bold text-white">
                      {rank.rankOrder}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {rank.rankName}
                      </p>
                      <p className="text-xs text-slate-500">
                        {rank.minimumPoints.toLocaleString()}+ points
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-600">
                    {rank.discountPercentage}%
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <UnavailableState text="Loyalty data is loading." />
          )}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
            Customer activity
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">
            Recent requests
          </h2>
          <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
            <Clock3 size={25} className="mx-auto text-slate-400" />
            <p className="mt-3 text-sm font-semibold text-slate-700">
              Request tracking is coming next
            </p>
            <p className="mx-auto mt-1 max-w-xs text-xs leading-5 text-slate-500">
              The request workflow is not connected to the backend yet, so no
              placeholder activity is shown here.
            </p>
            <Button variant="secondary" className="mt-4" disabled>
              View requests
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Workspace shortcuts
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                Quick actions
              </h2>
            </div>
            <Settings2 size={20} className="text-slate-400" />
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <QuickAction
              to={ROUTES.ADMIN_PARTS}
              icon={<Package size={18} />}
              title="Manage parts"
              detail="Inventory and stock"
              tone="blue"
            />
            <QuickAction
              to={ROUTES.ADMIN_ADDITIONAL_SERVICES}
              icon={<Wrench size={18} />}
              title="Manage services"
              detail="Catalog and pricing"
              tone="emerald"
            />
            <QuickAction
              to={ROUTES.ADMIN_SCHEDULING}
              icon={<CalendarDays size={18} />}
              title="Configure schedules"
              detail="Hours and blocked dates"
              tone="violet"
            />
            <QuickAction
              to={ROUTES.ADMIN_LOYALTY}
              icon={<Crown size={18} />}
              title="Manage loyalty"
              detail="Ranks and discounts"
              tone="amber"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
  loading: isLoading,
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone]}`}
        >
          <Icon size={20} />
        </div>
        <CheckCircle2 size={17} className="text-emerald-500" />
      </div>
      <p className="mt-5 text-3xl font-bold tracking-tight text-slate-900">
        {isLoading ? (
          <LoaderCircle size={25} className="animate-spin text-slate-300" />
        ) : (
          (value ?? "-")
        )}
      </p>
      <p className="mt-1 text-sm font-semibold text-slate-700">{label}</p>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </div>
  );
}
function InventoryStat({ label, value, icon, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
  };
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${tones[tone]}`}
      >
        {icon}
      </div>
      <p className="mt-4 text-2xl font-bold text-slate-900">{value ?? "-"}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}
function QuickAction({ to, icon, title, detail, tone }) {
  const tones = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
  };
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 rounded-2xl border border-slate-200 p-3.5 transition hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-sm"
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tones[tone]}`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-slate-800">{title}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{detail}</p>
      </div>
      <ChevronRight
        size={16}
        className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-blue-500"
      />
    </Link>
  );
}
function UnavailableState({ text }) {
  return (
    <div className="flex items-center gap-2 py-8 text-sm text-slate-500">
      <LoaderCircle size={16} className="animate-spin" />
      {text}
    </div>
  );
}

export default AdminDashboardPage;
