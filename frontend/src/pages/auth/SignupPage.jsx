import { useState } from "react";

import { Link, useNavigate } from "react-router-dom";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  UserPlus,
} from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";

import FormInput from "../../components/forms/FormInput";

import Button from "../../components/common/Button";

import { ROUTES } from "../../constants/routes";

import { validateSignup } from "../../validation/authValidation";

import PhoneInput from "../../components/forms/PhoneInput";

import { signupUser } from "../../features/auth/authApi";

function SignupPage() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+95",
    password: "",
    confirmPassword: "",
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

    const validationErrors = validateSignup(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const signupData = {
        fullName: values.name.trim(),
        email: values.email.trim(),
        phone: `${values.countryCode}${values.phone}`,
        password: values.password,
      };

      await signupUser(signupData);

      setSubmitSuccess(
        "Account created successfully. Redirecting you to sign in...",
      );

      setTimeout(() => {
        navigate(ROUTES.LOGIN);
      }, 1200);
    } catch (error) {
      setSubmitError(
        error.message || "Unable to create account. Please try again.",
      );
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

      <div className="mb-7">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <UserPlus size={23} />
        </div>

        <h2 className="text-3xl font-bold text-slate-900">
          Create your account
        </h2>

        <p className="mt-2 text-slate-500">
          Start managing your vehicle service digitally.
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Full name"
          name="name"
          placeholder="Your full name"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          required
        />

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

        <PhoneInput
          label="Phone number"
          name="phone"
          countryCode={values.countryCode}
          value={values.phone}
          onChange={handleChange}
          onCountryCodeChange={(countryCode) =>
            setValues((previous) => ({
              ...previous,
              countryCode,
            }))
          }
          error={errors.phone}
          required
        />

        <FormInput
          label="Password"
          name="password"
          type="password"
          placeholder="At least 8 characters"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          required
        />

        <FormInput
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Repeat your password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          required
        />

        <label className="flex gap-2 py-2 text-xs leading-5 text-slate-500">
          <input
            type="checkbox"
            required
            className="mt-1 rounded border-slate-300"
          />

          <span>
            I agree to the RepairLink Terms of Service and Privacy Policy.
          </span>
        </label>

        <Button
          type="submit"
          className="w-full disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <LoaderCircle size={16} className="mr-2 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to={ROUTES.LOGIN}
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
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default SignupPage;
