const API_BASE_URL = "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("repairlink_auth_token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getActiveAppointments() {
  const response = await fetch(`${API_BASE_URL}/customer/appointments/active`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    let message = "Failed to load active appointments.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}

export async function getAppointmentDetail(appointmentId) {
  const response = await fetch(`${API_BASE_URL}/customer/appointments/${appointmentId}`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

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

export async function cancelCustomerAppointment(appointmentId, reason) {
  const response = await fetch(`${API_BASE_URL}/customer/appointments/${appointmentId}/cancel`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify({ reason }),
  });

  if (!response.ok) {
    let message = "Failed to cancel appointment.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {}
    throw new Error(message);
  }

  return response.json();
}
