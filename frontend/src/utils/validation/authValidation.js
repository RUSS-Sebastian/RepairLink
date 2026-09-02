export function validatePassword(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long.");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least 1 uppercase letter.");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Password must contain at least 1 number.");
  }

  if (!/[!@#$%^&*(),.?":{}|<>_\-\\[\]\/;'`~+=]/.test(password)) {
    errors.push("Password must contain at least 1 special character.");
  }

  return errors;
}

export function isValidPassword(password) {
  return validatePassword(password).length === 0;
}

export function validateSignup(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Full name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email address is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }

  const passwordErrors = validatePassword(values.password);

  if (passwordErrors.length > 0) {
    errors.password = passwordErrors.join(" ");
  }

  if (!values.confirmPassword) {
    errors.confirmPassword = "Please confirm your password.";
  } else if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}