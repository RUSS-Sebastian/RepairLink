import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import { ArrowRight, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";

import Button from "../../components/common/Button";
import { ROUTES } from "../../constants/routes";
import { clearStoredAuthSession, getStoredAuthSession } from "../../utils/auth";

function CustomerDashboardPage() {
  const navigate = useNavigate();
  const session = getStoredAuthSession();

  useEffect(() => {
    if (!session.token || session.user?.role !== "CUSTOMER") {
      navigate(ROUTES.LOGIN, { replace: true });
    }
  }, [navigate, session.token, session.user?.role]);

  if (!session.token || session.user?.role !== "CUSTOMER") {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  const handleLogout = () => {
    clearStoredAuthSession();
    navigate(ROUTES.LOGIN, { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-600">
              Customer portal
            </p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">
              Welcome back, {session.user?.fullName || "Customer"}
            </h1>
          </div>

          <Button variant="secondary" onClick={handleLogout} className="gap-2">
            <LogOut size={16} />
            Logout
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className=" rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <UserCircle2 size={22} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Profile</h2>
            <p className="mt-2 text-sm text-slate-600">
              Manage your account details and contact information.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck size={22} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">
              Service Status
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Track your vehicle repair, approvals, and service updates.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <ArrowRight size={22} />
            </div>
            <h2 className="text-xl font-semibold text-slate-900">Next Steps</h2>
            <p className="mt-2 text-sm text-slate-600">
              Continue to your estimate, billing, and vehicle history flow.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomerDashboardPage;
