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
  Sparkles,
  TrendingUp,
  User,
  X,
} from "lucide-react";

import Button from "../../components/common/Button";
import { updateStoredAuthUser } from "../../utils/auth";
import { getCustomerLoyalty } from "../../features/loyalty/customerLoyaltyApi";
import {
  changeCustomerPassword,
  getCustomerProfile,
  updateCustomerProfile,
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
  vehicleCount: 0,
};

const EMPTY_LOYALTY = {
  totalPoints: 0,
  lifetimePoints: 0,
  servicesCompleted: 0,
  rankName: "Bronze",
  discountPercentage: 0,
  rankMinimumPoints: 0,
  rankMaximumPoints: 0,
  nextRankName: null,
  pointsToNextRank: 0,
};

function ProfilePage() {
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [draft, setDraft] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pageError, setPageError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [passwordDraft, setPasswordDraft] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordSubmitError, setPasswordSubmitError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [loyalty, setLoyalty] = useState(EMPTY_LOYALTY);
  const [loyaltyLoading, setLoyaltyLoading] = useState(true);
  const [loyaltyError, setLoyaltyError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function loadProfile() {
      try {
        setLoading(true);
        setPageError("");
        setSubmitError("");
        setSuccessMessage("");

        const response = await getCustomerProfile();

        if (!isMounted) {
          return;
        }

        const nextProfile = {
          fullName: response.fullName || "",
          email: response.email || "",
          phone: response.phone || "",
          memberSince: response.memberSince || "",
          vehicleCount: response.vehicleCount ?? 0,
        };

        setProfile(nextProfile);
        setDraft(nextProfile);
      } catch (loadError) {
        if (!isMounted) {
          return;
        }

        setPageError(
          loadError.message || "Unable to load your profile right now.",
        );
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadProfile();

    let isLoyaltyMounted = true;

    getCustomerLoyalty()
      .then((response) => {
        if (isLoyaltyMounted) {
          setLoyalty(response);
          setLoyaltyError("");
        }
      })
      .catch((error) => {
        if (isLoyaltyMounted) {
          setLoyaltyError(error.message || "Unable to load loyalty details.");
        }
      })
      .finally(() => {
        if (isLoyaltyMounted) {
          setLoyaltyLoading(false);
        }
      });

    return () => {
      isMounted = false;
      isLoyaltyMounted = false;
    };
  }, []);

  const initials = useMemo(() => {
    if (!profile.fullName) {
      return "U";
    }

    return profile.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [profile.fullName]);

  const hasChanges = useMemo(() => {
    return (
      draft.fullName !== profile.fullName ||
      draft.email !== profile.email ||
      draft.phone !== profile.phone
    );
  }, [draft, profile]);

  const handleFieldChange = (field, value) => {
    setDraft((previous) => ({
      ...previous,
      [field]: value,
    }));

    if (fieldErrors[field]) {
      setFieldErrors((previous) => ({
        ...previous,
        [field]: "",
      }));
    }

    if (submitError) {
      setSubmitError("");
    }

    if (successMessage) {
      setSuccessMessage("");
    }
  };

  const startEditing = () => {
    setDraft(profile);
    setFieldErrors({});
    setSubmitError("");
    setSuccessMessage("");
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setDraft(profile);
    setFieldErrors({});
    setSubmitError("");
    setSuccessMessage("");
    setIsEditing(false);
  };

  const handleSubmit = async () => {
    const changes = {};

    if (draft.fullName !== profile.fullName) {
      changes.fullName = draft.fullName.trim();
    }

    if (draft.email !== profile.email) {
      changes.email = draft.email.trim();
    }

    if (draft.phone !== profile.phone) {
      changes.phone = draft.phone.trim();
    }

    const validationErrors = validateProfileUpdate(changes);
    setFieldErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (Object.keys(changes).length === 0) {
      setSuccessMessage("No changes were made.");
      return;
    }

    setIsSaving(true);
    setSubmitError("");
    setSuccessMessage("");

    try {
      const response = await updateCustomerProfile(changes);

      const nextProfile = {
        fullName: response.fullName || "",
        email: response.email || "",
        phone: response.phone || "",
        memberSince: response.memberSince || profile.memberSince,
        vehicleCount: response.vehicleCount ?? profile.vehicleCount,
      };

      updateStoredAuthUser({
        fullName: nextProfile.fullName,
        email: nextProfile.email,
      });
      setProfile(nextProfile);
      setDraft(nextProfile);
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully.");
    } catch (submitError) {
      setSubmitError(
        submitError.message || "Unable to save your profile right now.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordFieldChange = (field, value) => {
    setPasswordDraft((previous) => ({
      ...previous,
      [field]: value,
    }));

    setPasswordErrors((previous) => ({
      ...previous,
      [field]: "",
    }));
    setPasswordSubmitError("");
    setPasswordSuccess("");
  };

  const handlePasswordSubmit = async () => {
    const validationErrors = validatePasswordChange(passwordDraft);
    setPasswordErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsChangingPassword(true);
    setPasswordSubmitError("");
    setPasswordSuccess("");

    try {
      await changeCustomerPassword(passwordDraft);
      setPasswordDraft({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordErrors({});
      setPasswordSuccess("Password updated successfully.");
    } catch (passwordError) {
      setPasswordSubmitError(
        passwordError.message || "Unable to update your password right now.",
      );
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Profile
          </h1>
          <p className="text-sm text-slate-500">
            Manage your account information.
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm">
          <LoaderCircle size={18} className="animate-spin text-slate-500" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (pageError) {
    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Profile
          </h1>
          <p className="text-sm text-slate-500">
            Manage your account information.
          </p>
        </div>

        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{pageError}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Profile
        </h1>
        <p className="text-sm text-slate-500">
          Manage your account information.
        </p>
      </div>

      {successMessage && (
        <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {submitError && (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white shadow-sm">
              {initials || "U"}
            </div>

            <div>
              <p className="text-xl font-semibold text-slate-900">
                {profile.fullName}
              </p>
              <p className="text-sm text-slate-500">{profile.email}</p>

              <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-600">
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {loyaltyLoading
                    ? "Loading membership..."
                    : `${loyalty.rankName} Member`}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {profile.vehicleCount}{" "}
                  {profile.vehicleCount === 1 ? "Vehicle" : "Vehicles"}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {loyaltyLoading
                    ? "Loading services..."
                    : `${loyalty.servicesCompleted} Services`}
                </span>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={startEditing}
            >
              <Pencil size={14} className="mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex w-full gap-2 sm:w-auto">
              <Button
                variant="secondary"
                className="flex-1 sm:flex-none"
                onClick={cancelEditing}
                disabled={isSaving}
              >
                <X size={14} className="mr-2" />
                Cancel
              </Button>
              <Button
                className="flex-1 sm:flex-none"
                onClick={handleSubmit}
                disabled={isSaving || !hasChanges}
              >
                <Save size={14} className="mr-2" />
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Account Information
          </h2>
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Full Name
              </label>
              <input
                value={draft.fullName}
                onChange={(event) =>
                  handleFieldChange("fullName", event.target.value)
                }
                className={`w-full rounded-xl border px-3 py-3 text-sm text-slate-900 outline-none transition ${
                  fieldErrors.name
                    ? "border-red-400"
                    : "border-slate-200 focus:border-blue-500"
                }`}
              />
              {fieldErrors.name && (
                <p className="mt-1.5 text-sm text-red-500">
                  {fieldErrors.name}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={draft.email}
                onChange={(event) =>
                  handleFieldChange("email", event.target.value)
                }
                className={`w-full rounded-xl border px-3 py-3 text-sm text-slate-900 outline-none transition ${
                  fieldErrors.email
                    ? "border-red-400"
                    : "border-slate-200 focus:border-blue-500"
                }`}
              />
              {fieldErrors.email && (
                <p className="mt-1.5 text-sm text-red-500">
                  {fieldErrors.email}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-semibold text-slate-700">
                Phone
              </label>
              <input
                type="tel"
                value={draft.phone}
                onChange={(event) =>
                  handleFieldChange("phone", event.target.value)
                }
                className={`w-full rounded-xl border px-3 py-3 text-sm text-slate-900 outline-none transition ${
                  fieldErrors.phone
                    ? "border-red-400"
                    : "border-slate-200 focus:border-blue-500"
                }`}
              />
              {fieldErrors.phone && (
                <p className="mt-1.5 text-sm text-red-500">
                  {fieldErrors.phone}
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <InfoRow
              icon={<User size={16} className="text-slate-500" />}
              label="Full Name"
              value={profile.fullName}
            />
            <InfoRow
              icon={<Mail size={16} className="text-slate-500" />}
              label="Email"
              value={profile.email}
            />
            <InfoRow
              icon={<Phone size={16} className="text-slate-500" />}
              label="Phone"
              value={profile.phone}
            />
            <InfoRow
              icon={<CalendarDays size={16} className="text-slate-500" />}
              label="Member Since"
              value={profile.memberSince}
            />
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <LockKeyhole size={19} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Password &amp; Security
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Keep your account secure with a fresh password.
            </p>
          </div>
        </div>

        {passwordSuccess && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
            <CheckCircle2 size={17} className="mt-0.5 shrink-0" />
            <span>{passwordSuccess}</span>
          </div>
        )}

        {passwordSubmitError && (
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{passwordSubmitError}</span>
          </div>
        )}

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <PasswordField
            label="Current password"
            value={passwordDraft.currentPassword}
            autoComplete="current-password"
            error={passwordErrors.currentPassword}
            onChange={(value) =>
              handlePasswordFieldChange("currentPassword", value)
            }
          />
          <div className="hidden sm:block" />
          <PasswordField
            label="New password"
            value={passwordDraft.newPassword}
            autoComplete="new-password"
            error={passwordErrors.newPassword}
            onChange={(value) =>
              handlePasswordFieldChange("newPassword", value)
            }
          />
          <PasswordField
            label="Confirm new password"
            value={passwordDraft.confirmPassword}
            autoComplete="new-password"
            error={passwordErrors.confirmPassword}
            onChange={(value) =>
              handlePasswordFieldChange("confirmPassword", value)
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
      </div>

      <LoyaltySummary
        loyalty={loyalty}
        loading={loyaltyLoading}
        error={loyaltyError}
      />
    </div>
  );
}

function PasswordField({ label, value, autoComplete, error, onChange }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          onChange={(event) => onChange(event.target.value)}
          className={`w-full rounded-xl border px-3 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-slate-200 focus:border-blue-500"
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword((visible) => !visible)}
          aria-label={showPassword ? `Hide ${label}` : `Show ${label}`}
          title={showPassword ? `Hide ${label}` : `Show ${label}`}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
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

      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
          {label}
        </p>
        <p className="mt-1 text-sm font-medium text-slate-800">{value}</p>
      </div>
    </div>
  );
}

function LoyaltySummary({ loyalty, loading, error }) {
  const range = Math.max(
    loyalty.rankMaximumPoints - loyalty.rankMinimumPoints + 1,
    1,
  );
  const earnedInRank = Math.max(
    loyalty.totalPoints - loyalty.rankMinimumPoints,
    0,
  );
  const progress = Math.min(100, Math.round((earnedInRank / range) * 100));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative overflow-hidden bg-slate-950 p-5 text-white sm:p-6">
        <div className="pointer-events-none absolute -right-8 -top-12 h-36 w-36 rounded-full border-[18px] border-amber-300/10" />
        <div className="relative flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-amber-200">
              <Sparkles size={14} /> Member rewards
            </div>
            <h2 className="mt-2 text-2xl font-bold">Your loyalty journey</h2>
            <p className="mt-1 text-sm text-slate-300">
              Earn points through every completed service.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-right backdrop-blur-sm">
            <p className="text-xs text-slate-400">Current rank</p>
            <p className="mt-1 text-lg font-bold text-amber-200">
              {loading ? "..." : loyalty.rankName}
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {error && (
          <div className="mb-5 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            <AlertCircle size={17} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Current points
            </p>
            <p className="mt-3 text-2xl font-bold text-blue-700">
              {loading ? "-" : loyalty.totalPoints.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Lifetime points
            </p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {loading ? "-" : loyalty.lifetimePoints.toLocaleString()}
            </p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
              Member discount
            </p>
            <p className="mt-3 text-2xl font-bold text-emerald-700">
              {loading ? "-" : `${loyalty.discountPercentage}%`}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Rank progress
              </p>
              <p className="mt-1 text-xs text-slate-500">
                {loyalty.nextRankName
                  ? `${loyalty.pointsToNextRank.toLocaleString()} points to ${loyalty.nextRankName}`
                  : "You have reached the highest active rank."}
              </p>
            </div>
            <TrendingUp size={19} className="text-blue-600" />
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all"
              style={{ width: `${loading ? 0 : progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-400">
            <span>{loyalty.rankMinimumPoints.toLocaleString()} pts</span>
            <span>{loyalty.rankMaximumPoints.toLocaleString()} pts</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
          <span className="text-slate-500">Completed services</span>
          <span className="font-bold text-slate-900">
            {loading ? "-" : loyalty.servicesCompleted}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
