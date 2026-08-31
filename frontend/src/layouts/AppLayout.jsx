import { useMemo, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  CalendarDays,
  Car,
  CreditCard,
  Gauge,
  History,
  House,
  LogOut,
  MessageSquareText,
  User,
  X,
} from "lucide-react";

import { ROUTES } from "../constants/routes";
import { clearStoredAuthSession, getStoredAuthSession } from "../utils/auth";

const navigationItems = [
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: House },
  { label: "My Vehicles", path: ROUTES.MY_VEHICLES, icon: Car },
  { label: "Service Request", path: ROUTES.SERVICE_REQUEST, icon: Gauge },
  { label: "Appointments", path: ROUTES.APPOINTMENTS, icon: CalendarDays },
  { label: "Active Service", path: ROUTES.ACTIVE_SERVICE, icon: Activity },
  { label: "Loyalty", path: ROUTES.LOYALTY, icon: CreditCard },
  { label: "Service History", path: ROUTES.SERVICE_HISTORY, icon: History },
  { label: "Reviews", path: ROUTES.REVIEWS, icon: MessageSquareText },
  { label: "Notifications", path: ROUTES.NOTIFICATIONS, icon: Bell },
  { label: "Profile", path: ROUTES.PROFILE, icon: User },
];

function AppLayout({ children }) {
  const navigate = useNavigate();
  const session = useMemo(() => getStoredAuthSession(), []);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    clearStoredAuthSession();
    sessionStorage.setItem(
      "repairlink_logout_success",
      "You have been logged out successfully.",
    );
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const displayName = session.user?.fullName || "Customer";
  const displayEmail = session.user?.email || "customer@repairlink.com";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside className="flex w-full max-w-[290px] flex-col border-r border-slate-200 bg-white">
        <div className="flex items-center gap-3 border-b border-slate-200 px-5 py-5">
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#0261F3] p-0 shadow-sm">
            <img
              src="/images/repairlink-logo.png"
              alt="RepairLink logo"
              className="h-full w-full object-cover"
            />
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Customer Portal
            </p>
          </div>
        </div>

        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0261F3] text-sm font-bold text-white shadow-sm">
              {initials}
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {displayName}
              </p>
              <p className="truncate text-xs text-slate-500">{displayEmail}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4">
          <ul className="space-y-1.5">
            {navigationItems.map(({ label, path, icon: Icon }) => (
              <li key={label}>
                <NavLink
                  to={path}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#0261F3] text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ")
                  }
                >
                  {({ isActive }) => (
                    <>
                      <Icon
                        size={16}
                        className={isActive ? "text-white" : "text-slate-500"}
                      />
                      <span>{label}</span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="border-t border-slate-200 px-3 py-4">
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
          >
            <LogOut size={16} className="text-slate-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 bg-slate-50">
        <div className="h-full p-8">{children}</div>
      </main>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Confirm logout
                </p>
                <h3 className="mt-2 text-xl font-bold text-slate-900">
                  Are you sure you want to log out?
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close logout confirmation"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm leading-6 text-slate-600">
              You will be signed out of your RepairLink account and redirected
              to the login page.
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
              >
                No
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Yes, log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AppLayout;
