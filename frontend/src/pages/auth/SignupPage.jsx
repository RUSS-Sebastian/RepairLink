import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  Mail,
  Phone,
  User,
} from "lucide-react";

import AuthLayout from "../../layouts/AuthLayout";
import FormInput from "../../components/forms/FormInput";
import Button from "../../components/common/Button";
import { validateSignupForm } from "../../validation/authValidation";

function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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

    const validationErrors = validateSignupForm(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    /*
      This is the exact JSON structure required by the backend.

      confirmPassword is intentionally NOT included.
    */
    const signupPayload = {
      fullName: formData.fullName.trim(),
      email: formData.email.trim(),
      phone: formData.phone.trim(),
      password: formData.password,
    };

    console.log("Signup JSON sent to backend:", signupPayload);

    setSubmitted(true);
  };

  return (
    <AuthLayout
      title="Create your RepairLink account"
      subtitle="Register as a customer to manage your vehicle service."
    >

      {submitted && (
        <div className="success-message">
          Registration data is ready to be sent to the backend.
          Open the browser Console to see the JSON payload.
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>

        <div className="form-grid">

          <FormInput
            label="Full Name"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            icon={User}
            error={errors.fullName}
          />

          <FormInput
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            icon={Mail}
            error={errors.email}
          />

          <FormInput
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+1234567890"
            icon={Phone}
            error={errors.phone}
          />

          <FormInput
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Minimum 8 characters"
            icon={Lock}
            error={errors.password}
            showPassword={showPassword}
            onTogglePassword={() =>
              setShowPassword((previous) => !previous)
            }
          />

          <FormInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Enter your password again"
            icon={Lock}
            error={errors.confirmPassword}
            showPassword={showConfirmPassword}
            onTogglePassword={() =>
              setShowConfirmPassword((previous) => !previous)
            }
          />

        </div>

        <Button type="submit">
          Create Account
        </Button>

      </form>

      <div className="auth-divider">
        <span>Already have an account?</span>
      </div>

      <Link to="/login" className="secondary-button">
        Sign In
      </Link>

      <Link to="/landing" className="back-link">
        <ArrowLeft size={16} />
        Back to RepairLink
      </Link>

    </AuthLayout>
  );
}

export default SignupPage;