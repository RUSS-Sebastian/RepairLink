import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, LockKeyhole } from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";
import FormInput from "../../components/forms/FormInput";
import Button from "../../components/common/Button";
import { ROUTES } from "../../constants/routes";
import { validateLogin } from "../../validation/authValidation";

function LoginPage() {
  const navigate = useNavigate();

  const [values, setValues] = useState({
    email: "",
    password: "",
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

    const validationErrors = validateLogin(values);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      // Temporary frontend-only behavior.
      navigate("/customer/vehicles");
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

      <div className="mb-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <LockKeyhole size={23} />
        </div>

        <h2 className="text-3xl font-bold text-slate-900">
          Welcome back
        </h2>

        <p className="mt-2 text-slate-500">
          Sign in to manage your vehicle service.
        </p>
      </div>

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

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2 text-slate-600">
            <input type="checkbox" className="rounded border-slate-300" />
            Remember me
          </label>

          <button
            type="button"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Forgot password?
          </button>
        </div>

        <Button type="submit" className="w-full">
          Sign In
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Don't have an account?{" "}
        <Link
          to={ROUTES.SIGNUP}
          className="font-semibold text-blue-600 hover:text-blue-700"
        >
          Create one
        </Link>
      </p>
    </AuthLayout>
  );
}

export default LoginPage;
