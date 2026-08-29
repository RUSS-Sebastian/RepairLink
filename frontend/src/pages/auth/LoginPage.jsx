import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  LockKeyhole,
} from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";
import FormInput from "../../components/forms/FormInput";
import Button from "../../components/common/Button";
import { ROUTES } from "../../constants/routes";
import { validateLogin } from "../../validation/authValidation";
import { loginUser } from "../../features/auth/authApi";
import { setStoredAuthSession } from "../../utils/auth";

function LoginPage() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }

    if (submitError) {
      setSubmitError("");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError("");
    setSubmitSuccess("");

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await loginUser({
        email: values.email.trim(),
        password: values.password,
      });

      setStoredAuthSession({
        accessToken: response.accessToken,
        tokenType: response.tokenType,
        user: response.user,
      });

      setSubmitSuccess("Login successful. Redirecting to your dashboard...");

      setTimeout(() => {
        navigate(ROUTES.CUSTOMER_DASHBOARD, { replace: true });
      }, 800);
    } catch (error) {
      setSubmitError(error.message || "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <Link
        to={ROUTES.LANDING}
        onClick={(event) => {
          if (isSubmitting) {
            event.preventDefault();
          }
        }}
        aria-disabled={isSubmitting}
        tabIndex={isSubmitting ? -1 : 0}
        className={`mb-8 inline-flex items-center gap-2 text-sm font-medium ${
          isSubmitting
            ? "pointer-events-none cursor-not-allowed text-slate-400"
            : "text-slate-500 hover:text-blue-600"
        }`}
      >
        <ArrowLeft size={16} />
        Back to RepairLink
      </Link>

      <div className="mb-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <LockKeyhole size={23} />
        </div>

        <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>

        <p className="mt-2 text-slate-500">
          Sign in to manage your vehicle service.
        </p>
      </div>

      {submitError && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {submitSuccess && (
        <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
          <span>{submitSuccess}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <FormInput
          label="Email address"
          name="email"
          type="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          required
        />

        <FormInput
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <Button
          type="submit"
          className="w-full disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle size={16} className="mr-2 animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to={ROUTES.SIGNUP}
          onClick={(event) => {
            if (isSubmitting) {
              event.preventDefault();
            }
          }}
          aria-disabled={isSubmitting}
          tabIndex={isSubmitting ? -1 : 0}
          className={`font-semibold ${
            isSubmitting
              ? "pointer-events-none cursor-not-allowed text-slate-400"
              : "text-blue-600 hover:text-blue-700"
          }`}
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
