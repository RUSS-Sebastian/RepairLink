import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Crown,
  History,
  Info,
  LoaderCircle,
  Percent,
  Plus,
  RefreshCw,
  RotateCcw,
  Shield,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import {
  getCustomerLoyalty,
  resetCustomerLoyalty,
} from "../../features/loyalty/customerLoyaltyApi";
import { ROUTES } from "../../constants/routes";

export default function CustomerLoyaltyPage() {
  const [loyaltyData, setLoyaltyData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetFeedback, setResetFeedback] = useState("");

  const fetchLoyalty = useCallback(async (showSpinner = true) => {
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const data = await getCustomerLoyalty();
      setLoyaltyData(data);
    } catch (err) {
      if (showSpinner) {
        setError(err.message || "Failed to load loyalty rewards information.");
      }
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  const handleConfirmReset = async () => {
    setIsResetting(true);
    setError("");
    try {
      const updated = await resetCustomerLoyalty();
      setLoyaltyData(updated);
      setShowResetModal(false);
      setResetFeedback("All loyalty data, balance, and point transaction history have been reset.");
      setTimeout(() => setResetFeedback(""), 7000);
    } catch (err) {
      setError(err.message || "Failed to reset loyalty data.");
    } finally {
      setIsResetting(false);
    }
  };

  useEffect(() => {
    fetchLoyalty(true);

    // Live update when an appointment is cancelled or notification arrives
    const handleCancelled = () => {
      fetchLoyalty(false);
    };

    const handleNotification = (event) => {
      const noti = event.detail;
      if (
        noti?.type === "APPOINTMENT_CANCELLED" ||
        noti?.type === "APPOINTMENT_CONFIRMED"
      ) {
        fetchLoyalty(false);
      }
    };

    window.addEventListener(
      "repairlink_appointment_cancelled_by_customer",
      handleCancelled
    );
    window.addEventListener(
      "repairlink_customer_notification_received",
      handleNotification
    );

    return () => {
      window.removeEventListener(
        "repairlink_appointment_cancelled_by_customer",
        handleCancelled
      );
      window.removeEventListener(
        "repairlink_customer_notification_received",
        handleNotification
      );
    };
  }, [fetchLoyalty]);

  const formatDateTime = (isoString) => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const getRankBadgeColors = (rankName) => {
    const r = (rankName || "").toUpperCase();
    if (r.includes("PLATINUM")) {
      return {
        bg: "bg-slate-900 text-white border-slate-700",
        pill: "bg-slate-800 text-slate-200 border-slate-700",
        accent: "text-slate-300",
      };
    }
    if (r.includes("GOLD")) {
      return {
        bg: "bg-amber-500 text-white border-amber-400",
        pill: "bg-amber-100 text-amber-800 border-amber-200",
        accent: "text-amber-500",
      };
    }
    if (r.includes("SILVER")) {
      return {
        bg: "bg-slate-400 text-white border-slate-300",
        pill: "bg-slate-100 text-slate-700 border-slate-200",
        accent: "text-slate-500",
      };
    }
    return {
      bg: "bg-amber-700 text-white border-amber-600",
      pill: "bg-amber-50 text-amber-900 border-amber-200",
      accent: "text-amber-700",
    };
  };

  const formatTransactionType = (type) => {
    switch (type) {
      case "APPOINTMENT_CANCELLATION_PENALTY":
        return "Cancellation Fee";
      case "SERVICE_COMPLETED":
        return "Service Completed";
      case "EARNED":
        return "Points Earned";
      case "REDEEMED":
        return "Reward Redeemed";
      default:
        return type ? type.replace(/_/g, " ") : "Points Adjustment";
    }
  };

  return (
    <div className="min-h-full bg-[#F3F8FF] pb-16">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ─── Hero Header ─── */}
        <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white shadow-xl shadow-blue-900/10 sm:px-8">
          <div className="absolute -right-12 -top-16 h-52 w-52 rounded-full border-[24px] border-amber-500/20" />
          <div className="absolute -bottom-10 right-32 h-36 w-36 rounded-full border-[16px] border-blue-500/10" />

          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-amber-300">
                <Crown size={13} className="text-amber-400" />
                RepairLink Rewards
              </div>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Loyalty & Points Program
              </h1>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300">
                Earn points on vehicle services, unlock exclusive tier discounts,
                and track your points history in real time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                disabled={loading || isResetting}
                className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3.5 py-2.5 text-xs font-bold text-red-300 transition hover:bg-red-500/20 hover:text-white"
                title="Reset loyalty data to 0 points"
              >
                <RotateCcw size={14} />
                Reset Loyalty
              </button>
              <button
                type="button"
                onClick={() => fetchLoyalty(true)}
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
                Book Service
              </Link>
            </div>
          </div>
        </header>

        {/* ─── Feedback Banner ─── */}
        {resetFeedback && (
          <div className="flex items-center justify-between rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-900 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
              <span>{resetFeedback}</span>
            </div>
            <button
              type="button"
              onClick={() => setResetFeedback("")}
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
              ×
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[350px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-12">
            <div className="flex flex-col items-center gap-3 text-center">
              <LoaderCircle size={36} className="animate-spin text-[#0261F3]" />
              <p className="text-sm font-semibold text-slate-600">
                Loading your loyalty rewards profile...
              </p>
            </div>
          </div>
        ) : loyaltyData ? (
          <>
            {/* ─── Metrics Grid ─── */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Current Points Balance */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Available Balance
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                    <Sparkles size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-extrabold text-slate-900 sm:text-4xl">
                    {loyaltyData.totalPoints.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-400">PTS</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Usable towards service discounts & rewards
                </p>
              </div>

              {/* Membership Tier */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Current Tier
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-[#0261F3]">
                    <Crown size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {loyaltyData.rankName || "Bronze"}
                  </span>
                  {loyaltyData.discountPercentage > 0 && (
                    <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                      {Number(loyaltyData.discountPercentage)}% Off
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  {loyaltyData.nextRankName
                    ? `Next tier: ${loyaltyData.nextRankName}`
                    : "Top membership tier achieved"}
                </p>
              </div>

              {/* Services Completed */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Completed Jobs
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <Wrench size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-extrabold text-slate-900 sm:text-4xl">
                    {loyaltyData.servicesCompleted}
                  </span>
                  <span className="text-xs font-bold text-slate-400">Services</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Successfully completed workshop visits
                </p>
              </div>

              {/* Lifetime Points */}
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Lifetime Earned
                  </span>
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
                    <Award size={20} />
                  </div>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-mono text-3xl font-extrabold text-slate-900 sm:text-4xl">
                    {loyaltyData.lifetimePoints.toLocaleString()}
                  </span>
                  <span className="text-xs font-bold text-slate-400">PTS</span>
                </div>
                <p className="mt-2 text-xs text-slate-500">
                  Total accumulated reward points
                </p>
              </div>
            </div>

            {/* ─── Tier Progress Bar ─── */}
            {loyaltyData.nextRankName && (
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Progress to {loyaltyData.nextRankName} Tier
                    </h3>
                    <p className="text-xs text-slate-500">
                      Earn {loyaltyData.pointsToNextRank.toLocaleString()} more points to unlock higher service discounts.
                    </p>
                  </div>
                  <span className="font-mono text-xs font-bold text-[#0261F3]">
                    {loyaltyData.pointsToNextRank.toLocaleString()} pts remaining
                  </span>
                </div>

                {/* Progress bar line */}
                <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-[#0261F3] transition-all duration-500"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.max(
                          10,
                          loyaltyData.rankMaximumPoints > loyaltyData.rankMinimumPoints
                            ? ((loyaltyData.totalPoints - loyaltyData.rankMinimumPoints) /
                                (loyaltyData.rankMaximumPoints - loyaltyData.rankMinimumPoints)) *
                                100
                            : 50
                        )
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* ─── Point Transaction History ─── */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <History size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Point Transaction History
                    </h2>
                    <p className="text-xs text-slate-500">
                      Audit trail of earned rewards and cancellation penalties.
                    </p>
                  </div>
                </div>

                <span className="text-xs text-slate-400 font-medium">
                  {loyaltyData.pointHistory?.length || 0} total transactions
                </span>
              </div>

              {/* Transactions List */}
              {!loyaltyData.pointHistory || loyaltyData.pointHistory.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
                    <History size={24} />
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-slate-800">
                    No Point Transactions Yet
                  </h4>
                  <p className="mt-1 max-w-sm text-xs text-slate-500 leading-relaxed">
                    When you complete vehicle repairs or if any appointment cancellation penalties occur, they will be logged here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {loyaltyData.pointHistory.map((tx) => {
                    const isDeduction = tx.pointsDelta < 0;
                    return (
                      <div
                        key={tx.transactionId}
                        className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between transition hover:bg-slate-50/50 rounded-xl px-3"
                      >
                        <div className="flex items-start gap-3.5">
                          {/* Indicator Icon */}
                          <div
                            className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                              isDeduction
                                ? "bg-red-50 text-red-600"
                                : "bg-emerald-50 text-emerald-600"
                            }`}
                          >
                            {isDeduction ? (
                              <ArrowDownRight size={20} />
                            ) : (
                              <ArrowUpRight size={20} />
                            )}
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">
                                {formatTransactionType(tx.transactionType)}
                              </span>
                              <span
                                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                                  isDeduction
                                    ? "bg-red-100 text-red-700"
                                    : "bg-emerald-100 text-emerald-700"
                                }`}
                              >
                                {isDeduction ? "Fee Deducted" : "Points Added"}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                              {tx.description}
                            </p>

                            <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
                              <Clock size={12} />
                              <span>{formatDateTime(tx.createdAt)}</span>
                            </div>
                          </div>
                        </div>

                        {/* Delta Points Badge */}
                        <div className="self-end sm:self-center">
                          <span
                            className={`font-mono text-base font-extrabold ${
                              isDeduction ? "text-red-600" : "text-emerald-600"
                            }`}
                          >
                            {isDeduction
                              ? `${tx.pointsDelta} pts`
                              : `+${tx.pointsDelta} pts`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        ) : null}
        {/* ─── Reset Confirmation Modal ─── */}
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
                  <RotateCcw size={22} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Reset Loyalty Data?
                  </h3>
                  <p className="text-xs text-slate-500">Clean customer rewards history</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                This action will wipe your current points to <strong>0</strong>, reset your lifetime points to <strong>0</strong>, restore your membership tier to <strong>Bronze</strong>, and permanently delete your transaction history. This action cannot be undone.
              </p>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  disabled={isResetting}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReset}
                  disabled={isResetting}
                  className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-red-700 disabled:opacity-50"
                >
                  {isResetting ? (
                    <>
                      <LoaderCircle size={14} className="animate-spin" />
                      Resetting...
                    </>
                  ) : (
                    "Yes, Reset Data"
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
