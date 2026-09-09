import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Plus,
  Search,
  LoaderCircle,
  Pencil,
  Trash2,
  X,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Wrench,
  Truck,
  ShieldCheck,
  Eye,
  EyeOff,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  listStaffAccounts,
  createStaffAccount,
  updateStaffAccount,
  deleteStaffAccount,
  toggleStaffStatus,
} from "../../features/staff/staffApi";

/* ─── Role Constants & Styles ─── */
const ROLE_OPTIONS = [
  { id: "ALL", label: "All Roles" },
  { id: "CENTER_STAFF", label: "Staff", icon: ShieldCheck },
  { id: "MECHANIC", label: "Mechanic", icon: Wrench },
  { id: "DELIVERY_STAFF", label: "Driver", icon: Truck },
];

const FORM_ROLES = [
  {
    code: "CENTER_STAFF",
    label: "Center Staff",
    description: "Front-desk, customer check-in and service coordination",
    icon: ShieldCheck,
    color: "blue",
  },
  {
    code: "MECHANIC",
    label: "Mechanic",
    description: "Vehicle inspection, diagnostics, and repairs",
    icon: Wrench,
    color: "amber",
  },
  {
    code: "DELIVERY_STAFF",
    label: "Delivery Driver",
    description: "Vehicle pickup, home delivery, and transport",
    icon: Truck,
    color: "purple",
  },
];

const ROLE_STYLES = {
  CENTER_STAFF: "border-blue-200 bg-blue-50 text-blue-700",
  MECHANIC: "border-amber-200 bg-amber-50 text-amber-700",
  DELIVERY_STAFF: "border-purple-200 bg-purple-50 text-purple-700",
};

const ROLE_ICONS = {
  CENTER_STAFF: ShieldCheck,
  MECHANIC: Wrench,
  DELIVERY_STAFF: Truck,
};

function formatRoleName(code) {
  if (code === "CENTER_STAFF") return "Staff";
  if (code === "MECHANIC") return "Mechanic";
  if (code === "DELIVERY_STAFF") return "Driver";
  return code || "";
}

function RoleBadge({ role }) {
  const Icon = ROLE_ICONS[role] || Users;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${ROLE_STYLES[role] || "border-slate-200 bg-slate-100 text-slate-700"}`}
    >
      <Icon size={12} />
      {formatRoleName(role)}
    </span>
  );
}

function StatusBadge({ status }) {
  const isActive = status === "ACTIVE";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        isActive
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-100 text-slate-600"
      }`}
    >
      {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
      {isActive ? "Active" : "Inactive"}
    </span>
  );
}

export default function StaffAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");

  // Modals state
  const [modalMode, setModalMode] = useState(null); // 'create' | 'edit'
  const [editingAccount, setEditingAccount] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Form fields
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    role: "CENTER_STAFF",
    password: "",
    confirmPassword: "",
    accountStatus: "ACTIVE",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const fetchAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const data = await listStaffAccounts({
        role: selectedRole,
        search,
      });
      setAccounts(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Failed to load staff accounts.");
    } finally {
      setLoading(false);
    }
  }, [selectedRole, search]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  // Summary counts
  const stats = useMemo(() => {
    const total = accounts.length;
    const staff = accounts.filter((a) => a.role === "CENTER_STAFF").length;
    const mechanics = accounts.filter((a) => a.role === "MECHANIC").length;
    const drivers = accounts.filter((a) => a.role === "DELIVERY_STAFF").length;
    const active = accounts.filter((a) => a.accountStatus === "ACTIVE").length;
    return { total, staff, mechanics, drivers, active };
  }, [accounts]);

  // Open Create Modal
  const openCreateModal = () => {
    setFormData({
      username: "",
      fullName: "",
      email: "",
      phone: "",
      role: "CENTER_STAFF",
      password: "",
      confirmPassword: "",
      accountStatus: "ACTIVE",
    });
    setFormError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setEditingAccount(null);
    setModalMode("create");
  };

  // Open Edit Modal
  const openEditModal = (account) => {
    setEditingAccount(account);
    setFormData({
      username: account.username || "",
      fullName: account.fullName || "",
      email: account.email || "",
      phone: account.phone || "",
      role: account.role || "CENTER_STAFF",
      password: "",
      confirmPassword: "",
      accountStatus: account.accountStatus || "ACTIVE",
    });
    setFormError("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setModalMode("edit");
  };

  // Submit Create / Edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.username.trim()) {
      setFormError("Username is required.");
      return;
    }
    if (formData.username.trim().length < 3) {
      setFormError("Username must be at least 3 characters.");
      return;
    }
    if (!formData.email.trim()) {
      setFormError("Email address is required.");
      return;
    }

    if (modalMode === "create") {
      if (!formData.password) {
        setFormError("Password is required.");
        return;
      }
      if (formData.password.length < 8) {
        setFormError("Password must be at least 8 characters long.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        setFormError("Passwords do not match.");
        return;
      }
    } else if (modalMode === "edit") {
      if (formData.password) {
        if (formData.password.length < 8) {
          setFormError("New password must be at least 8 characters long.");
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setFormError("Passwords do not match.");
          return;
        }
      }
    }

    try {
      setActionLoading(true);
      if (modalMode === "create") {
        await createStaffAccount({
          username: formData.username.trim(),
          fullName: formData.fullName.trim() || formData.username.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          role: formData.role,
          password: formData.password,
        });
      } else {
        await updateStaffAccount(editingAccount.userId, {
          username: formData.username.trim(),
          fullName: formData.fullName.trim() || formData.username.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim() || null,
          role: formData.role,
          accountStatus: formData.accountStatus,
          newPassword: formData.password || null,
        });
      }
      setModalMode(null);
      fetchAccounts();
    } catch (err) {
      setFormError(err.message || "Failed to save staff account.");
    } finally {
      setActionLoading(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (account) => {
    try {
      await toggleStaffStatus(account.userId);
      fetchAccounts();
    } catch (err) {
      alert(err.message || "Failed to update account status.");
    }
  };

  // Delete account
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setActionLoading(true);
      await deleteStaffAccount(deleteTarget.userId);
      setDeleteTarget(null);
      fetchAccounts();
    } catch (err) {
      alert(err.message || "Failed to delete account.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0261F3]">
            Administration
          </p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
            Staff Accounts
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, update, and manage staff, mechanic, and delivery driver
            accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0261F3] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={16} />
          Create Staff Account
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Total Staff
          </p>
          <p className="mt-1 text-2xl font-black text-slate-950">
            {stats.total}
          </p>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
            Center Staff
          </p>
          <p className="mt-1 text-2xl font-black text-blue-900">
            {stats.staff}
          </p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700">
            Mechanics
          </p>
          <p className="mt-1 text-2xl font-black text-amber-900">
            {stats.mechanics}
          </p>
        </div>
        <div className="rounded-2xl border border-purple-100 bg-purple-50/50 p-4 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-700">
            Drivers
          </p>
          <p className="mt-1 text-2xl font-black text-purple-900">
            {stats.drivers}
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Role Pills */}
        <div className="flex flex-wrap gap-1.5">
          {ROLE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedRole(opt.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition ${
                selectedRole === opt.id
                  ? "bg-slate-900 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name, username, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Content Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-slate-400">
            <LoaderCircle size={20} className="animate-spin text-[#0261F3]" />
            Loading staff accounts...
          </div>
        ) : error ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
            <AlertCircle size={32} className="text-rose-500" />
            <p className="mt-2 text-sm font-bold text-slate-800">{error}</p>
            <button
              type="button"
              onClick={fetchAccounts}
              className="mt-3 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-[#0261F3] hover:bg-blue-100"
            >
              Retry
            </button>
          </div>
        ) : accounts.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
            <div className="rounded-full bg-slate-100 p-3 text-slate-400">
              <Users size={28} />
            </div>
            <p className="mt-3 font-bold text-slate-800">
              No staff accounts found
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {search
                ? "Try adjusting your search criteria or role filters."
                : "Get started by creating your first staff, mechanic, or driver account."}
            </p>
            {!search && (
              <button
                type="button"
                onClick={openCreateModal}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-3.5 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                <Plus size={14} />
                Create Account
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-100 bg-slate-50/70 text-slate-400 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Joined</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {accounts.map((acc) => (
                  <tr
                    key={acc.userId}
                    className="transition hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-4">
                      <div>
                        <p className="font-bold text-slate-900">
                          {acc.fullName || acc.username}
                        </p>
                        {acc.username && (
                          <p className="text-[11px] text-slate-400">
                            @{acc.username}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <RoleBadge role={acc.role} />
                    </td>
                    <td className="px-5 py-4">
                      <div className="space-y-0.5">
                        <p className="font-medium text-slate-800">
                          {acc.email}
                        </p>
                        {acc.phone && (
                          <p className="text-[11px] text-slate-400">
                            {acc.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={acc.accountStatus} />
                    </td>
                    <td className="px-5 py-4 text-slate-500">
                      {acc.createdAt
                        ? new Date(acc.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(acc)}
                          title={
                            acc.accountStatus === "ACTIVE"
                              ? "Deactivate account"
                              : "Activate account"
                          }
                          className={`rounded-lg p-1.5 transition ${
                            acc.accountStatus === "ACTIVE"
                              ? "text-slate-400 hover:bg-amber-50 hover:text-amber-600"
                              : "text-slate-400 hover:bg-emerald-50 hover:text-emerald-600"
                          }`}
                        >
                          {acc.accountStatus === "ACTIVE" ? (
                            <UserX size={15} />
                          ) : (
                            <UserCheck size={15} />
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(acc)}
                          title="Edit account"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-blue-50 hover:text-[#0261F3] transition"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(acc)}
                          title="Delete account"
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Create or Edit Account */}
      {modalMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {modalMode === "create"
                    ? "Create Staff Account"
                    : "Edit Staff Account"}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {modalMode === "create"
                    ? "Enter credentials and assign a role for the new team member."
                    : `Updating details for @${editingAccount?.username || editingAccount?.fullName}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setModalMode(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Error Banner */}
            {formError && (
              <div className="mt-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs font-semibold text-rose-700">
                <AlertCircle size={15} className="shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-5 space-y-4">
              {/* Role Selection Cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Role <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {FORM_ROLES.map((r) => {
                    const isSelected = formData.role === r.code;
                    const Icon = r.icon;
                    return (
                      <button
                        key={r.code}
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, role: r.code })
                        }
                        className={`flex flex-col items-center justify-center rounded-xl border p-3 text-center transition ${
                          isSelected
                            ? "border-[#0261F3] bg-blue-50/50 text-[#0261F3] ring-1 ring-[#0261F3]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <Icon
                          size={20}
                          className={
                            isSelected ? "text-[#0261F3]" : "text-slate-400"
                          }
                        />
                        <span className="mt-1.5 text-xs font-bold">
                          {r.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Username & Full Name Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. john_driver"
                    value={formData.username}
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. John Doe"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Email (Gmail) & Phone Grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email (Gmail) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@gmail.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Phone (Optional)
                  </label>
                  <input
                    type="tel"
                    placeholder="+1234567890"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {modalMode === "create" ? (
                      <>
                        Password <span className="text-rose-500">*</span>
                      </>
                    ) : (
                      "New Password (leave blank to keep current)"
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required={modalMode === "create"}
                      placeholder="Min. 8 characters"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 py-2 pl-3 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {modalMode === "create" ? (
                      <>
                        Confirm Password{" "}
                        <span className="text-rose-500">*</span>
                      </>
                    ) : (
                      "Confirm New Password"
                    )}
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required={
                        modalMode === "create" || Boolean(formData.password)
                      }
                      placeholder="Re-enter password"
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          confirmPassword: e.target.value,
                        })
                      }
                      className={`w-full rounded-xl border py-2 pl-3 pr-8 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 ${
                        formData.confirmPassword &&
                        formData.password !== formData.confirmPassword
                          ? "border-rose-300 focus:border-rose-500 focus:ring-rose-500"
                          : "border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff size={14} />
                      ) : (
                        <Eye size={14} />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Status in Edit Mode */}
              {modalMode === "edit" && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Account Status
                  </label>
                  <select
                    value={formData.accountStatus}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountStatus: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-4 py-2 text-xs font-bold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {actionLoading && (
                    <LoaderCircle size={14} className="animate-spin" />
                  )}
                  {modalMode === "create" ? "Create Account" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-center rounded-full bg-rose-100 w-12 h-12 text-rose-600 mx-auto">
              <Trash2 size={24} />
            </div>
            <h3 className="mt-4 text-center text-base font-bold text-slate-900">
              Delete Staff Account?
            </h3>
            <p className="mt-1.5 text-center text-xs text-slate-500">
              Are you sure you want to delete the account for{" "}
              <strong className="text-slate-800">
                {deleteTarget.fullName || deleteTarget.username}
              </strong>{" "}
              (<code>{deleteTarget.email}</code>)? This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition disabled:opacity-50"
              >
                {actionLoading && (
                  <LoaderCircle size={14} className="animate-spin" />
                )}
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
