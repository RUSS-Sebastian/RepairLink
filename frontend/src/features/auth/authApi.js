const API_BASE_URL = "http://localhost:8080/api";

async function parseApiError(response) {
  try {
    const payload = await response.json();
    return (
      payload?.message ||
      payload?.error ||
      payload?.errorCode ||
      "Request failed."
    );
  } catch {
    return "Request failed.";
  }
}

export async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }

  return response.json();
}

export async function signupUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }

  return response.json();
}

export async function getCustomerProfile() {
  const token = localStorage.getItem("repairlink_auth_token");

  if (!token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(`${API_BASE_URL}/auth/customers/profile`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }

  return response.json();
}

export async function updateCustomerProfile(payload) {
  const token = localStorage.getItem("repairlink_auth_token");

  if (!token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(`${API_BASE_URL}/auth/customers/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await parseApiError(response);
    throw new Error(message);
  }

  return response.json();
}
