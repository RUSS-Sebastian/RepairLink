import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  CarFront,
  CheckCircle2,
  Clock3,
  FileSpreadsheet,
  Gauge,
  Plus,
  ShieldCheck,
  TrendingUp,
  Truck,
  UserCheck,
  Users,
  Wrench,
  ArrowUpRight,
} from "lucide-react";

import { ROUTES } from "../../constants/routes";
import { getStoredAuthSession } from "../../utils/auth";

export default function StaffDashboardPage() {
  const session = getStoredAuthSession();
  const displayName = session.user?.fullName || session.user?.username || "Staff Member";
  const userRole = session.user?.role || "CENTER_STAFF";

  const formattedRole =
    userRole === "CENTER_STAFF"
      ? "Center Staff"
      : userRole === "MECHANIC"
        ? "Mechanic"
        : userRole === "DELIVERY_STAFF"
          ? "Delivery Driver"
          : "Staff Member";

  const quickStats = [
    {
      title: "Today's Appointments",
      value: "8",
      subtext: "2 completed, 6 pending",
      icon: CalendarDays,
      color: "blue",
      link: ROUTES.STAFF_APPOINTMENTS,
    },
    {
      title: "Service Requests",
      value: "5",
      subtext: "Awaiting front-desk review",
      icon: Gauge,
      color: "amber",
      link: ROUTES.STAFF_SERVICE_REQUESTS,
    },
    {
      title: "Active Work Orders",
      value: "4",
      subtext: "In repair / diagnostic bay",
      icon: Wrench,
      color: "emerald",
      link: ROUTES.STAFF_WORK_ORDERS,
    },
    {
      title: "Pickup & Delivery",
      value: "3",
      subtext: "Scheduled for transport",
      icon: Truck,
      color: "violet",
      link: ROUTES.STAFF_PICKUP_DELIVERY,
    },
  ];

  const quickActions = [
    {
      label: "Customer Check In",
      description: "Process arriving customer vehicle and intake",
      path: ROUTES.STAFF_CHECKIN,
      icon: UserCheck,
      color: "bg-blue-50 text-[#0261F3] hover:bg-blue-100",
    },
    {
      label: "Review Requests",
      description: "Approve customer slot holds and service bookings",
      path: ROUTES.STAFF_SERVICE_REQUESTS,
      icon: Gauge,
      color: "bg-amber-50 text-amber-600 hover:bg-amber-100",
    },
    {
      label: "Manage Work Orders",
      description: "Assign mechanics and track vehicle repair progress",
      path: ROUTES.STAFF_WORK_ORDERS,
      icon: Wrench,
      color: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100",
    },
    {
      label: "Vehicle Directory",
      description: "Search customer vehicles, history and license plates",
      path: ROUTES.STAFF_VEHICLES,
      icon: CarFront,
      color: "bg-purple-50 text-purple-600 hover:bg-purple-100",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Welcome, {displayName}
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#0261F3]">
              <ShieldCheck size={14} />
              {formattedRole}
            </span>
          </div>
          <p className="mt-1.5 text-sm text-slate-500">
            Staff Console overview and center operations center.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={ROUTES.STAFF_CHECKIN}
            className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0256D6]"
          >
            <UserCheck size={16} />
            Check In Vehicle
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {quickStats.map(({ title, value, subtext, icon: Icon, color, link }) => {
          const colorClasses = {
            blue: "bg-blue-50 text-[#0261F3]",
            amber: "bg-amber-50 text-amber-600",
            emerald: "bg-emerald-50 text-emerald-600",
            violet: "bg-purple-50 text-purple-600",
          }[color];

          return (
            <Link
              key={title}
              to={link}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${colorClasses} transition group-hover:scale-105`}
                >
                  <Icon size={22} />
                </div>
                <ArrowUpRight
                  size={18}
                  className="text-slate-300 transition group-hover:text-slate-500"
                />
              </div>

              <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="mt-1 text-3xl font-bold tracking-tight text-slate-900">
                  {value}
                </p>
                <p className="mt-1 text-xs text-slate-400">{subtext}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Quick Action Hub */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold text-slate-900">Center Quick Actions</h2>
        <p className="mt-1 text-sm text-slate-500">
          Frequently used staff operations and workshop workflows.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ label, description, path, icon: Icon, color }) => (
            <Link
              key={label}
              to={path}
              className="flex flex-col justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-5 transition hover:border-slate-200 hover:bg-slate-50 hover:shadow-sm"
            >
              <div>
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
                >
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 text-base font-bold text-slate-900">
                  {label}
                </h3>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {description}
                </p>
              </div>

              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#0261F3]">
                Open module <ArrowUpRight size={14} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
