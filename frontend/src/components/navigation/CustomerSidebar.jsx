import {
  LayoutDashboard,
  CarFront,
  Wrench,
  CalendarDays,
  History,
  FileText,
  LogOut,
  X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

function CustomerSidebar({ mobileOpen = false, onClose }) {
  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/customer/dashboard",
    },
    {
      label: "My Vehicles",
      icon: CarFront,
      path: "/customer/vehicles",
    },
    {
      label: "Service Requests",
      icon: Wrench,
      path: "/customer/service-requests",
    },
    {
      label: "Appointments",
      icon: CalendarDays,
      path: "/customer/appointments",
    },
    {
      label: "Service History",
      icon: History,
      path: "/customer/service-history",
    },
    {
      label: "Invoices",
      icon: FileText,
      path: "/customer/invoices",
    },
  ];

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 lg:hidden"
          aria-label="Close sidebar"
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-72
          flex-col border-r border-slate-200 bg-white
          transition-transform duration-300
          lg:static lg:z-auto lg:translate-x-0
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }
        `}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
              <CarFront size={22} strokeWidth={2.2} />
            </div>

            <div>
              <p className="text-lg font-bold tracking-tight text-slate-900">
                Repair<span className="text-blue-600">Link</span>
              </p>

              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Customer Portal
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Menu
          </p>

          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `
                    flex items-center gap-3 rounded-xl px-3 py-3
                    text-sm font-medium transition
                    ${
                      isActive
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                    `
                  }
                >
                  <Icon size={19} strokeWidth={2} />

                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User section */}
        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-slate-50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
              BM
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                Customer
              </p>

              <p className="truncate text-xs text-slate-500">
                customer@example.com
              </p>
            </div>
          </div>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-red-50 hover:text-red-600"
          >
            <LogOut size={19} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default CustomerSidebar;