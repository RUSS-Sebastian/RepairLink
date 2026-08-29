import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, UserPlus } from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";
import FormInput from "../../components/forms/FormInput";
import Button from "../../components/common/Button";
import { ROUTES } from "../../constants/routes";
import { validateSignup } from "../../validation/authValidation";

function SignupPage() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;

    setValues((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateSignup(values);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // Temporary frontend-only behavior.
      navigate(ROUTES.LOGIN);
    }
  };

  return (
    <AuthLayout>
      <Link
        to={ROUTES.LANDING}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600"
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

        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Sign in
        </Link>
      </p>
    </AuthLayout>
  );
}

export default SignupPage;