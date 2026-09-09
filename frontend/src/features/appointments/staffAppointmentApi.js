const API_BASE_URL = "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("repairlink_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getStaffScheduleWindow() {
  const response = await fetch(`${API_BASE_URL}/staff/appointments/config-window`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let message = "Failed to load staff schedule configuration window.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export async function getStaffAppointments(date) {
  const url = date
    ? `${API_BASE_URL}/staff/appointments?date=${date}`
    : `${API_BASE_URL}/staff/appointments`;
  const response = await fetch(url, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let message = "Failed to load staff appointments.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export async function getStaffAppointmentCounts(startDate, endDate) {
  const response = await fetch(
    `${API_BASE_URL}/staff/appointments/counts?startDate=${startDate}&endDate=${endDate}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Failed to load appointment counts.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export async function getStaffAppointmentDetail(appointmentId) {
  const response = await fetch(
    `${API_BASE_URL}/staff/appointments/${appointmentId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Failed to load appointment details.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export async function markAppointmentArrived(appointmentId) {
  const response = await fetch(
    `${API_BASE_URL}/staff/appointments/${appointmentId}/arrived`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Failed to mark vehicle as arrived.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export async function markAppointmentNoShow(appointmentId) {
  const response = await fetch(
    `${API_BASE_URL}/staff/appointments/${appointmentId}/no-show`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    let message = "Failed to mark appointment as no-show.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}
