import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Mail,
} from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";
import FormInput from "../../components/forms/FormInput";
import Button from "../../components/common/Button";
import { validateLoginForm } from "../../validation/authValidation";

function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((previous) => ({
        ...previous,
        [name]: "",
      }));
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const validationErrors = validateLoginForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const loginPayload = {
      email: formData.email.trim(),
      password: formData.password,
    };

    console.log("Login JSON sent to backend:", loginPayload);

    setSubmitted(true);
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your RepairLink customer account."
    >

      {submitted && (
        <div className="success-message">
          Login data is ready to be sent to the backend.
          Open the browser Console to see the JSON payload.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="customer@example.com"
          icon={Mail}
          error={errors.email}
        />

        <FormInput
          label="Password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          icon={Lock}
          error={errors.password}
          showPassword={showPassword}
          onTogglePassword={() =>
            setShowPassword((previous) => !previous)
          }
        />

        <Button type="submit">
          Sign In
        </Button>

      </form>

      <div className="auth-divider">
        <span>New to RepairLink?</span>
      </div>

      <Link to="/signup" className="secondary-button">
        Create Account
      </Link>

      <Link to="/landing" className="back-link">
        <ArrowLeft size={16} />
        Back to RepairLink
      </Link>

    </AuthLayout>
  );
}

export default LoginPage;