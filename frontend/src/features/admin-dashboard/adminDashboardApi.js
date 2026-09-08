const API_BASE_URL = "http://localhost:8080/api";

async function request(path) {
  const token = localStorage.getItem("repairlink_auth_token");
  if (!token) throw new Error("Authentication required.");

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = "Dashboard request failed.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // Keep the generic message when no JSON error is returned.
    }
    throw new Error(message);
  }

  return response.json();
}

export function getAdminDashboardSummary() {
  return request("/admin/dashboard/summary");
}
