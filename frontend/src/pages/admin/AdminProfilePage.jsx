import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  LoaderCircle,
  Mail,
  Pencil,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";

import Button from "../../components/common/Button";
import { updateStoredAuthUser } from "../../utils/auth";
import {
  changeAdminPassword,
  getAdminProfile,
  updateAdminProfile,
} from "../../features/auth/authApi";
import {
  validatePasswordChange,
  validateProfileUpdate,
} from "../../validation/authValidation";

const EMPTY_PROFILE = {
  fullName: "",
  email: "",
  phone: "",
  memberSince: "",
};

const EMPTY_PASSWORD = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

function AdminProfilePage() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [draft, setDraft] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordDraft, setPasswordDraft] = useState(EMPTY_PASSWORD);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSubmitError, setPasswordSubmitError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        const response = await getAdminProfile();
        if (!isMounted) return;
        const nextProfile = {
          fullName: response.fullName || "",
          email: response.email || "",
          phone: response.phone || "",
          memberSince: response.memberSince || "",
        };
        setProfile(nextProfile);
        setDraft(nextProfile);
      } catch (error) {
        if (isMounted)
          setPageError(
            error.message || "Unable to load your profile right now.",
          );
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    if (!profile.fullName) return "A";
    return profile.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile.fullName]);

  const hasChanges =
    draft.fullName !== profile.fullName ||
    draft.email !== profile.email ||
    draft.phone !== profile.phone;

  const handleFieldChange = (field, value) => {
    setDraft((previous) => ({ ...previous, [field]: value }));
    setFieldErrors((previous) => ({ ...previous, [field]: "" }));
    setSubmitError("");
    setSuccessMessage("");
  };

  const handleProfileSubmit = async () => {
    const changes = {};
    if (draft.fullName !== profile.fullName)
      changes.fullName = draft.fullName.trim();
    if (draft.email !== profile.email) changes.email = draft.email.trim();
    if (draft.phone !== profile.phone) changes.phone = draft.phone.trim();

    const errors = validateProfileUpdate(changes);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;
    if (Object.keys(changes).length === 0) {
      setSuccessMessage("No changes were made.");
      return;
    }

    setIsSaving(true);
    setSubmitError("");
    try {
      const response = await updateAdminProfile(changes);
      const nextProfile = {
        fullName: response.fullName || "",
        email: response.email || "",
        phone: response.phone || "",
        memberSince: response.memberSince || profile.memberSince,
      };
      updateStoredAuthUser({
        fullName: nextProfile.fullName,
        email: nextProfile.email,
      });
      setProfile(nextProfile);
      setDraft(nextProfile);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully.");
    } catch (error) {
      setSubmitError(error.message || "Unable to save your profile right now.");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async () => {
    const errors = validatePasswordChange(passwordDraft);
    setPasswordErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setIsChangingPassword(true);
    setPasswordSubmitError("");
    setPasswordSuccess("");
    try {
      await changeAdminPassword(passwordDraft);
      setPasswordDraft(EMPTY_PASSWORD);
      setPasswordErrors({});
      setPasswordSuccess("Password updated successfully.");
    } catch (error) {
      setPasswordSubmitError(
        error.message || "Unable to update your password right now.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading)
    return (
      <StatusMessage
        icon={<LoaderCircle size={18} className="animate-spin" />}
        text="Loading profile..."
      />
    );
  if (pageError)
    return (
      <StatusMessage icon={<AlertCircle size={18} />} text={pageError} error />
    );

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Admin Profile
        </h1>
        <p className="text-sm text-slate-500">
          Manage your account information and security.
        </p>
      </div>

      {successMessage && <Notice success text={successMessage} />}
      {submitError && <Notice text={submitError} />}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-sm">
              {initials}
            </div>
            <div>
              <p className="text-xl font-semibold text-slate-900">
                {profile.fullName}
              </p>
              <p className="text-sm text-slate-500">{profile.email}</p>
              <span className="mt-2 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                Administrator
              </span>
            </div>
          </div>
          {!isEditing ? (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={() => setIsEditing(true)}
            >
              <Pencil size={14} className="mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={() => {
                  setDraft(profile);
                  setFieldErrors({});
                  setIsEditing(false);
                }}
                disabled={isSaving}
              >
                <X size={14} className="mr-2" />
                Cancel
              </Button>
              <Button
                className="flex-1 sm:flex-none"
                onClick={handleProfileSubmit}
                disabled={isSaving || !hasChanges}
              >
                <Save size={14} className="mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <h2 className="mb-5 text-lg font-semibold text-slate-900">
          Account Information
        </h2>
        {isEditing ? (
          <div className="space-y-4">
            <EditField
              label="Full Name"
              value={draft.fullName}
              error={fieldErrors.name}
              onChange={(value) => handleFieldChange("fullName", value)}
            />
            <EditField
              label="Email"
              type="email"
              value={draft.email}
              error={fieldErrors.email}
              onChange={(value) => handleFieldChange("email", value)}
            />
            <EditField
              label="Phone"
              type="tel"
              value={draft.phone}
              error={fieldErrors.phone}
              onChange={(value) => handleFieldChange("phone", value)}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <InfoRow
              icon={<User size={16} />}
              label="Full Name"
              value={profile.fullName}
            />
            <InfoRow
              icon={<Mail size={16} />}
              label="Email"
              value={profile.email}
            />
            <InfoRow
              icon={<Phone size={16} />}
              label="Phone"
              value={profile.phone}
            />
            <InfoRow
              icon={<CalendarDays size={16} />}
              label="Member Since"
              value={profile.memberSince}
            />
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <LockKeyhole size={19} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Password &amp; Security
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep your administrator account secure with a fresh password.
            </p>
          </div>
        </div>
        {passwordSuccess && <Notice success text={passwordSuccess} />}
        {passwordSubmitError && <Notice text={passwordSubmitError} />}
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="Current password"
            value={passwordDraft.currentPassword}
            error={passwordErrors.currentPassword}
            onChange={(value) =>
              setPasswordDraft({ ...passwordDraft, currentPassword: value })
            }
          />
          <div className="hidden sm:block" />
          <PasswordField
            label="New password"
            value={passwordDraft.newPassword}
            error={passwordErrors.newPassword}
            onChange={(value) =>
              setPasswordDraft({ ...passwordDraft, newPassword: value })
            }
          />
          <PasswordField
            label="Confirm new password"
            value={passwordDraft.confirmPassword}
            error={passwordErrors.confirmPassword}
            onChange={(value) =>
              setPasswordDraft({ ...passwordDraft, confirmPassword: value })
            }
          />
        </div>
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs leading-5 text-slate-400">
            Use at least 8 characters with uppercase, lowercase, a number, and a
            special character.
          </p>
          <Button
            className="shrink-0"
            onClick={handlePasswordSubmit}
            disabled={isChangingPassword}
          >
            <LockKeyhole size={15} className="mr-2" />
            {isChangingPassword ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </section>
    </div>
  );
}

function StatusMessage({ icon, text, error = false }) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Admin Profile
        </h1>
        <p className="text-sm text-slate-500">
          Manage your account information and security.
        </p>
      </div>
      <div
        className={`flex items-start gap-3 rounded-2xl border p-4 text-sm ${error ? "border-red-200 bg-red-50 text-red-700" : "border-slate-200 bg-white text-slate-600"}`}
      >
        {icon}
        <span>{text}</span>
      </div>
    </div>
  );
}

function Notice({ text, success = false }) {
  return (
    <div
      className={`mt-5 flex items-start gap-3 rounded-xl border p-3 text-sm ${success ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-red-200 bg-red-50 text-red-700"}`}
    >
      {success ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
      <span>{text}</span>
    </div>
  );
}

function EditField({ label, type = "text", value, error, onChange }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={`w-full rounded-xl border px-3 py-3 text-sm text-slate-900 outline-none transition ${error ? "border-red-400" : "border-slate-200 focus:border-blue-500"}`}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function PasswordField({ label, value, error, onChange }) {
  const [visible, setVisible] = useState(false);
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          autoComplete="new-password"
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-xl border px-3 py-3 pr-11 text-sm text-slate-900 outline-none ${error ? "border-red-400" : "border-slate-200 focus:border-blue-500"}`}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={visible ? `Hide ${label}` : `Show ${label}`}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg bg-white text-slate-500 shadow-sm">
        {icon}
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-800">
          {value || "Not provided"}
        </p>
      </div>
    </div>
  );
}

export default AdminProfilePage;
