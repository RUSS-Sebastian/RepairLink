export function validateLogin(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(values.password)) {
    errors.password = "Password must contain at least one uppercase letter.";
  } else if (!/[a-z]/.test(values.password)) {
    errors.password = "Password must contain at least one lowercase letter.";
  } else if (!/[0-9]/.test(values.password)) {
    errors.password = "Password must contain at least one number.";
  } else if (!/[!@#$%^&*()_\-+={[\]}|\\:;"'<,>.?/]/.test(values.password)) {
    errors.password = "Password must contain at least one special character.";
  }

  return errors;
}

export function validateSignup(values) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Full name is required.";
  }

  if (!values.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/\S+@\S+\.\S+/.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }

  if (!values.phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!/^\d{10}$/.test(values.phone.trim())) {
    errors.phone = "Phone number must contain exactly 10 digits.";
  }

  if (!values.password) {
    errors.password = "Password is required.";
  } else if (values.password.length < 8) {
    errors.password = "Password must be at least 8 characters.";
  } else if (!/[A-Z]/.test(values.password)) {
    errors.password = "Password must contain at least one uppercase letter.";
  } else if (!/[a-z]/.test(values.password)) {
    errors.password = "Password must contain at least one lowercase letter.";
  } else if (!/[0-9]/.test(values.password)) {
    errors.password = "Password must contain at least one number.";
  } else if (!/[!@#$%^&*()_\-+={[\]}|\\:;"'<,>.?/]/.test(values.password)) {
    errors.password = "Password must contain at least one special character.";
  }

  if (values.password !== values.confirmPassword) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function validateProfileUpdate(changes) {
  const errors = {};

  if (changes.fullName !== undefined) {
    if (!changes.fullName.trim()) {
      errors.name = "Full name cannot be blank.";
    }
  }

  if (changes.email !== undefined) {
    if (!changes.email.trim()) {
      errors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(changes.email)) {
      errors.email = "Enter a valid email address.";
    }
  }

  if (changes.phone !== undefined) {
    if (!changes.phone.trim()) {
      errors.phone = "Phone number is required.";
    } else if (!/^\+\d{1,3}\d{10}$/.test(changes.phone.trim())) {
      errors.phone =
        "Phone number must include a valid country code and exactly 10 digits after it.";
    }
  }

  return errors;
}
