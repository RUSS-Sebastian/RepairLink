import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  LoaderCircle,
  Mail,
  Pencil,
  Phone,
  Save,
  User,
  X,
} from "lucide-react";

import Button from "../../components/common/Button";
import {
  getCustomerProfile,
  updateCustomerProfile,
} from "../../features/auth/authApi";
import { validateProfileUpdate } from "../../validation/authValidation";

const EMPTY_PROFILE = {
  fullName: "",
  email: "",
  phone: "",
  memberSince: "",
  vehicleCount: 0,
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

    return () => {
      isMounted = false;
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
                  Silver Member
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  {profile.vehicleCount}{" "}
                  {profile.vehicleCount === 1 ? "Vehicle" : "Vehicles"}
                </span>
                <span className="rounded-full bg-slate-100 px-2.5 py-1">
                  2 Services
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

      <LoyaltySummary />
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

function LoyaltySummary() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">Loyalty Summary</h2>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            Rank
          </p>
          <p className="mt-3 text-xl font-bold text-slate-900">Silver</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            Points
          </p>
          <p className="mt-3 text-xl font-bold text-slate-900">1,850</p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
            Discount
          </p>
          <p className="mt-3 text-xl font-bold text-slate-900">5%</p>
        </div>
      </div>

      <div className="mt-5">
        <Button
          variant="secondary"
          className="w-full justify-center sm:w-auto"
          disabled
        >
          View Loyalty Details
        </Button>
      </div>
    </div>
  );
}

export default ProfilePage;
