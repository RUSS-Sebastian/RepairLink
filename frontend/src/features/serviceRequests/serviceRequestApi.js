const API_BASE_URL = "http://localhost:8080/api";

function getToken() {
  const token = localStorage.getItem("repairlink_auth_token");
  if (!token) throw new Error("Authentication required.");
  return token;
}

export async function getCurrentScheduleWindow() {
  const response = await fetch(`${API_BASE_URL}/schedule/current-window`);
  if (!response.ok) throw new Error("Failed to load schedule window.");
  return response.json();
}

export async function getAvailableSlots(date) {
  const token = localStorage.getItem("repairlink_auth_token");
  const headers = {};
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`${API_BASE_URL}/schedule/slots?date=${date}`, {
    headers,
  });
  if (!response.ok) throw new Error("Failed to load available slots.");
  return response.json();
}

export async function holdSlot(date, timeSlot) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/schedule/slots/hold`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ date, timeSlot }),
  });
  if (!response.ok) {
    let message = "Failed to hold slot.";
    let code = null;
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
      code = payload?.code;
    } catch {}
    const err = new Error(message);
    err.status = response.status;
    err.code = code;
    throw err;
  }
  return response.json();
}

export async function releaseSlotHold() {
  const token = localStorage.getItem("repairlink_auth_token");
  if (!token) return;
  try {
    await fetch(`${API_BASE_URL}/schedule/slots/hold`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
  } catch {
    // silent catch
  }
}

export async function getAdditionalServices(vehicleType) {
  const token = getToken();
  const params = vehicleType ? `?vehicleType=${vehicleType}` : "";
  const response = await fetch(
    `${API_BASE_URL}/customer/additional-services${params}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok) throw new Error("Failed to load additional services.");
  return response.json();
}

export async function submitServiceRequest(formData) {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/customer/service-requests`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData, // FormData — browser sets Content-Type automatically with boundary
  });
  if (!response.ok) {
    let message = "Failed to submit service request.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }
  return response.json();
}

export async function getCustomerServiceRequests() {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}/customer/service-requests`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    let message = "Failed to load your service requests.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }
  return response.json();
}

export async function deleteServiceRequest(id) {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/customer/service-requests/${id}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok && response.status !== 204) {
    let message = "Failed to delete service request.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }
  return true;
}

export async function cancelServiceRequest(id) {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/customer/service-requests/${id}/cancel`,
    {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok && response.status !== 204) {
    let message = "Failed to cancel service request.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // fallback
    }
    throw new Error(message);
  }
  return true;
}

export async function getActiveVehicleIds() {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/customer/service-requests/active-vehicle-ids`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok) return [];
  return response.json();
}

export async function getActiveVehicles() {
  const token = getToken();
  const response = await fetch(
    `${API_BASE_URL}/customer/service-requests/active-vehicles`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  if (!response.ok) return [];
  return response.json();
}
