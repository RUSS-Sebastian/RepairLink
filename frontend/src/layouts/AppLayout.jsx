import { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  Bell,
  CalendarDays,
  Car,
  CreditCard,
  ChevronLeft,
  ChevronRight,
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

const customerNavigationItems = [
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

const adminNavigationItems = [
  { label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD, icon: House },
  { label: "Parts", path: ROUTES.ADMIN_PARTS, icon: Car },
  { label: "Labor Rates", path: ROUTES.ADMIN_LABOR_RATES, icon: Gauge },
  {
    label: "Additional Services",
    path: ROUTES.ADMIN_ADDITIONAL_SERVICES,
    icon: Activity,
  },
  { label: "Scheduling", path: ROUTES.ADMIN_SCHEDULING, icon: CalendarDays },
  { label: "Loyalty", path: ROUTES.ADMIN_LOYALTY, icon: CreditCard },
  { label: "Notifications", path: ROUTES.ADMIN_NOTIFICATIONS, icon: Bell },
  { label: "Audit Log", path: ROUTES.ADMIN_AUDIT_LOG, icon: History },
  { label: "Admin Profile", path: ROUTES.ADMIN_PROFILE, icon: User },
];

function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const session = useMemo(() => getStoredAuthSession(), []);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const userRole = session.user?.role;
  const navigationItems =
    userRole === "ADMIN" ? adminNavigationItems : customerNavigationItems;
  const consoleLabel =
    userRole === "ADMIN" ? "ADMIN CONSOLE" : "Customer Portal";

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
    <div className="flex h-screen overflow-hidden bg-slate-100 text-slate-900">
      <aside
        className={`flex h-screen shrink-0 flex-col overflow-hidden border-r border-slate-200 bg-white transition-[width,flex-basis,max-width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          isCollapsed ? "w-[92px]" : "w-[290px]"
        }`}
      >
        <div
          className={`flex flex-none items-center border-b border-slate-200 ${
            isCollapsed ? "justify-center px-2 py-4" : "gap-3 px-5 py-5"
          }`}
        >
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#0261F3] p-0 shadow-sm">
            <img
              src="/images/repairlink-logo.png"
              alt="RepairLink logo"
              className="h-full w-full object-cover"
            />
          </div>

          {!isCollapsed && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                {consoleLabel}
              </p>
            </div>
          )}
        </div>

        <div
          className={`flex-none border-b border-slate-200 ${
            isCollapsed ? "px-2 py-4" : "px-5 py-5"
          }`}
        >
          <div
            className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"}`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0261F3] text-sm font-bold text-white shadow-sm">
              {initials}
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">
                  {displayName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {displayEmail}
                </p>
              </div>
            )}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ul className="space-y-1.5">
            {navigationItems.map(({ label, path, icon: Icon }) => (
              <li key={label}>
                <NavLink
                  to={path}
                  title={isCollapsed ? label : undefined}
                  className={({ isActive }) => {
                    const isVehicleSection = label === "My Vehicles";
                    const isVehicleRoute =
                      location.pathname === "/my-vehicles" ||
                      location.pathname.startsWith("/my-vehicles/") ||
                      location.pathname === "/customer/vehicles" ||
                      location.pathname.startsWith("/customer/vehicles/");
                    const active =
                      isActive || (isVehicleSection && isVehicleRoute);

                    return [
                      "flex items-center rounded-xl transition-all duration-300 ease-out",
                      isCollapsed
                        ? "justify-center px-2 py-2.5"
                        : "gap-3 px-3 py-2.5",
                      active
                        ? "bg-[#EAF3FF] text-[#0261F3] shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                    ].join(" ");
                  }}
                >
                  {({ isActive }) => {
                    const isVehicleSection = label === "My Vehicles";
                    const isVehicleRoute =
                      location.pathname === "/my-vehicles" ||
                      location.pathname.startsWith("/my-vehicles/") ||
                      location.pathname === "/customer/vehicles" ||
                      location.pathname.startsWith("/customer/vehicles/");
                    const active =
                      isActive || (isVehicleSection && isVehicleRoute);

                    return (
                      <>
                        <Icon
                          size={16}
                          className={
                            active ? "text-[#0261F3]" : "text-slate-500"
                          }
                        />
                        {!isCollapsed && (
                          <span
                            className={
                              active
                                ? "text-sm font-semibold text-[#0261F3]"
                                : "text-sm font-medium text-slate-600"
                            }
                          >
                            {label}
                          </span>
                        )}
                      </>
                    );
                  }}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div
          className={`flex-none border-t border-slate-200 ${isCollapsed ? "px-2 py-3" : "px-3 py-3"}`}
        >
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            title={isCollapsed ? "Logout" : undefined}
            className={`flex items-center justify-center rounded-xl text-sm font-medium text-slate-600 transition-all duration-300 ease-out hover:bg-slate-100 hover:text-slate-900 ${
              isCollapsed ? "w-full px-2 py-2.5" : "w-full gap-3 px-3 py-2.5"
            }`}
          >
            <LogOut size={16} className="stroke-[2.2] text-slate-500" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>

        <div
          className={`flex-none border-t border-slate-200 ${isCollapsed ? "px-2 py-3" : "px-3 py-3"}`}
        >
          <button
            type="button"
            onClick={() => setIsCollapsed((current) => !current)}
            className="flex w-full items-center justify-center rounded-xl border border-slate-200 bg-white p-2 text-slate-600 transition-all duration-300 ease-out hover:border-slate-300 hover:text-slate-900"
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto bg-[#F3F8FF]">
        <div className="h-full min-h-full p-8">{children}</div>
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
