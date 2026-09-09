const API_BASE_URL = "http://localhost:8080/api";

async function request(path, options = {}) {
  const token = localStorage.getItem("repairlink_auth_token");
  if (!token) throw new Error("Authentication required.");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let message = "Staff account request failed.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // Keep default message
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

export function listStaffAccounts({ role = "ALL", search = "" } = {}) {
  const params = new URLSearchParams();
  if (role && role !== "ALL") params.append("role", role);
  if (search) params.append("search", search);

  const query = params.toString();
  return request(`/admin/staff${query ? `?${query}` : ""}`);
}

export function createStaffAccount(data) {
  return request("/admin/staff", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateStaffAccount(userId, data) {
  return request(`/admin/staff/${userId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteStaffAccount(userId) {
  return request(`/admin/staff/${userId}`, {
    method: "DELETE",
  });
}

export function toggleStaffStatus(userId) {
  return request(`/admin/staff/${userId}/status`, {
    method: "PATCH",
  });
}
