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
    let message = "Schedule request failed.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // Keep the generic message when the server has no JSON error body.
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

export function listScheduleConfigurations({
  dateFrom = "",
  dateTo = "",
  page = 0,
  size = 4,
} = {}) {
  const params = new URLSearchParams();
  if (dateFrom) params.append("dateFrom", dateFrom);
  if (dateTo) params.append("dateTo", dateTo);
  params.append("page", String(page));
  params.append("size", String(size));

  return request(`/admin/schedule-configurations?${params.toString()}`);
}

export function getScheduleConfiguration(id) {
  return request(`/admin/schedule-configurations/${id}`);
}

export function createScheduleConfiguration(data) {
  return request("/admin/schedule-configurations", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function deleteScheduleConfiguration(id) {
  return request(`/admin/schedule-configurations/${id}`, {
    method: "DELETE",
  });
}

export function addBlockedDate(configId, { blockedDate, reason }) {
  return request(`/admin/schedule-configurations/${configId}/blocked-dates`, {
    method: "POST",
    body: JSON.stringify({ blockedDate, reason }),
  });
}

export function removeBlockedDate(configId, blockedDateId) {
  return request(
    `/admin/schedule-configurations/${configId}/blocked-dates/${blockedDateId}`,
    {
      method: "DELETE",
    },
  );
}

export function simulateSchedule(data) {
  return request("/admin/schedule-configurations/simulate", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function getDailySlots(date) {
  const params = new URLSearchParams({ date });
  return request(`/schedule/slots?${params.toString()}`);
}

export function getAdminDailySlots(configId, date) {
  const params = new URLSearchParams({ date });
  return request(
    `/admin/schedule-configurations/${configId}/daily-slots?${params.toString()}`,
  );
}
