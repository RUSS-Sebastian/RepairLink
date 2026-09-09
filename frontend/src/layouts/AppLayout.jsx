import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useStaffNotifications } from "../hooks/useStaffNotifications";
import { useCustomerNotifications } from "../hooks/useCustomerNotifications";
import {
  Activity,
  AlertCircle,
  Bell,
  CalendarDays,
  Car,
  CheckCircle2,
  CreditCard,
  ChevronLeft,
  ChevronRight,
  FileText,
  Gauge,
  History,
  House,
  LogOut,
  MessageSquareText,
  Truck,
  User,
  UserCheck,
  Users,
  Wrench,
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
  { label: "Staff Accounts", path: ROUTES.ADMIN_STAFF, icon: Users },
  { label: "Notifications", path: ROUTES.ADMIN_NOTIFICATIONS, icon: Bell },
  { label: "Admin Profile", path: ROUTES.ADMIN_PROFILE, icon: User },
];

const staffNavigationItems = [
  { label: "Dashboard", path: ROUTES.STAFF_DASHBOARD, icon: House },
  { label: "Service Requests", path: ROUTES.STAFF_SERVICE_REQUESTS, icon: Gauge },
  { label: "Appointments", path: ROUTES.STAFF_APPOINTMENTS, icon: CalendarDays },
  { label: "Check In", path: ROUTES.STAFF_CHECKIN, icon: UserCheck },
  { label: "Vehicles", path: ROUTES.STAFF_VEHICLES, icon: Car },
  { label: "Estimates", path: ROUTES.STAFF_ESTIMATES, icon: FileText },
  { label: "Work Orders", path: ROUTES.STAFF_WORK_ORDERS, icon: Wrench },
  { label: "Additional Work", path: ROUTES.STAFF_ADDITIONAL_WORK, icon: Activity },
  { label: "Customers", path: ROUTES.STAFF_CUSTOMERS, icon: Users },
  { label: "Pickup & Delivery", path: ROUTES.STAFF_PICKUP_DELIVERY, icon: Truck },
  { label: "Notifications", path: ROUTES.STAFF_NOTIFICATIONS, icon: Bell },
  { label: "Profile", path: ROUTES.STAFF_PROFILE, icon: User },
];

function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [session, setSession] = useState(() => getStoredAuthSession());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleAuthUpdate = () => {
      setSession(getStoredAuthSession());
    };

    window.addEventListener("repairlink_auth_updated", handleAuthUpdate);

    return () => {
      window.removeEventListener("repairlink_auth_updated", handleAuthUpdate);
    };
  }, []);

  const userRole = session.user?.role;
  const isAdmin = userRole === "ADMIN";
  const isStaff = userRole === "STAFF" || userRole === "CENTER_STAFF";
  const isCustomer = userRole === "CUSTOMER";

  const {
    unreadCount: staffUnreadCount,
    latestToast: staffLatestToast,
    dismissToast: dismissStaffToast,
    markReferenceAsRead,
  } = useStaffNotifications();

  const {
    unreadCount: customerUnreadCount,
    latestToast: customerLatestToast,
    dismissToast: dismissCustomerToast,
  } = useCustomerNotifications();

  const activeUnreadCount = isStaff ? staffUnreadCount : isCustomer ? customerUnreadCount : 0;
  const activeToast = isStaff ? staffLatestToast : isCustomer ? customerLatestToast : null;
  const dismissActiveToast = isStaff ? dismissStaffToast : dismissCustomerToast;

  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      dismissActiveToast();
    }, 8500);
    return () => clearTimeout(timer);
  }, [activeToast, dismissActiveToast]);

  const navigationItems = isAdmin
    ? adminNavigationItems
    : isStaff
      ? staffNavigationItems
      : customerNavigationItems;

  const consoleLabel = isAdmin
    ? "ADMIN CONSOLE"
    : isStaff
      ? "STAFF CONSOLE"
      : "Customer Portal";

  const handleLogout = () => {
    clearStoredAuthSession();
    sessionStorage.setItem(
      "repairlink_logout_success",
      "You have been logged out successfully.",
    );
    navigate(ROUTES.LOGIN, { replace: true });
  };

  const displayName =
    session.user?.fullName ||
    session.user?.username ||
    (isAdmin ? "Administrator" : isStaff ? "Staff Member" : "Customer");
  const displayEmail =
    session.user?.email ||
    (isAdmin
      ? "admin@repairlink.com"
      : isStaff
        ? "staff@repairlink.com"
        : "customer@repairlink.com");
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

                    const isNotificationSection = label === "Notifications";

                    return (
                      <>
                        <div className="relative flex items-center justify-center">
                          <Icon
                            size={16}
                            className={
                              active ? "text-[#0261F3]" : "text-slate-500"
                            }
                          />
                          {isCollapsed && isNotificationSection && (isStaff || isCustomer) && activeUnreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
                          )}
                        </div>
                        {!isCollapsed && (
                          <div className="flex flex-1 items-center justify-between">
                            <span
                              className={
                                active
                                  ? "text-sm font-semibold text-[#0261F3]"
                                  : "text-sm font-medium text-slate-600"
                              }
                            >
                              {label}
                            </span>
                            {isNotificationSection && (isStaff || isCustomer) && activeUnreadCount > 0 && (
                              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white shadow-sm transition-all duration-200">
                                {activeUnreadCount > 99 ? "99+" : activeUnreadCount}
                              </span>
                            )}
                          </div>
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

      {/* Real-time floating toast alert for staff and customers */}
      {activeToast && (() => {
        const isAlertToast =
          activeToast.type === "SERVICE_REQUEST_CANCELLED" ||
          activeToast.type === "SERVICE_REQUEST_REJECTED" ||
          activeToast.type === "APPOINTMENT_CANCELLED";
        const isConfirmedToast = activeToast.type === "APPOINTMENT_CONFIRMED";

        return (
          <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in slide-in-from-bottom-5 duration-300">
            <div
              className={`flex items-start gap-3.5 rounded-2xl border bg-white p-4 shadow-2xl ${
                isAlertToast
                  ? "border-red-200"
                  : isConfirmedToast
                    ? "border-emerald-200"
                    : "border-blue-200"
              }`}
            >
              <div
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isAlertToast
                    ? "bg-red-50 text-red-600"
                    : isConfirmedToast
                      ? "bg-emerald-50 text-emerald-600"
                      : "bg-blue-50 text-[#0261F3]"
                }`}
              >
                {isAlertToast ? (
                  <AlertCircle size={20} />
                ) : isConfirmedToast ? (
                  <CheckCircle2 size={20} />
                ) : (
                  <Bell size={20} />
                )}
                <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                  <span
                    className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                      isAlertToast
                        ? "bg-red-400"
                        : isConfirmedToast
                          ? "bg-emerald-400"
                          : "bg-blue-400"
                    }`}
                  ></span>
                  <span
                    className={`relative inline-flex h-3 w-3 rounded-full ${
                      isAlertToast
                        ? "bg-red-600"
                        : isConfirmedToast
                          ? "bg-emerald-600"
                          : "bg-[#0261F3]"
                    }`}
                  ></span>
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p
                    className={`text-xs font-bold uppercase tracking-wider ${
                      isAlertToast
                        ? "text-red-600"
                        : isConfirmedToast
                          ? "text-emerald-700"
                          : "text-[#0261F3]"
                    }`}
                  >
                    {activeToast.title ||
                      (isAlertToast
                        ? "Notice"
                        : isConfirmedToast
                          ? "Appointment Confirmed"
                          : "Notification")}
                  </p>
                  {activeToast.referenceCode && (
                    <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                      {activeToast.referenceCode}
                    </span>
                  )}
                  {isAlertToast && (
                    <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-red-700">
                      {activeToast.type === "SERVICE_REQUEST_REJECTED"
                        ? "Declined"
                        : "Cancelled"}
                    </span>
                  )}
                  {isConfirmedToast && (
                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-emerald-700">
                      Scheduled
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  {activeToast.message}
                </p>

                <div className="mt-2.5 flex items-center gap-2">
                  {isStaff && activeToast.referenceId ? (
                    <Link
                      to={`/staff/service-requests/${activeToast.referenceId}`}
                      onClick={() => {
                        if (activeToast.referenceId) {
                          markReferenceAsRead(activeToast.referenceId);
                        }
                        dismissActiveToast();
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0261F3] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0256D6]"
                    >
                      View Request
                    </Link>
                  ) : isCustomer && isConfirmedToast ? (
                    <Link
                      to={`${ROUTES.APPOINTMENTS}${activeToast.referenceId ? `?id=${activeToast.referenceId}` : ""}`}
                      onClick={dismissActiveToast}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0261F3] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0256D6]"
                    >
                      View Appointment
                    </Link>
                  ) : (
                    <Link
                      to={isStaff ? ROUTES.STAFF_NOTIFICATIONS : ROUTES.NOTIFICATIONS}
                      onClick={dismissActiveToast}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#0261F3] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#0256D6]"
                    >
                      View Notifications
                    </Link>
                  )}

                  <button
                    type="button"
                    onClick={dismissActiveToast}
                    className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={dismissActiveToast}
                className="text-slate-400 transition hover:text-slate-600"
                aria-label="Dismiss alert"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        );
      })()}

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
