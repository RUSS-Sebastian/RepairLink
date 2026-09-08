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
  const response = await fetch(`${API_BASE_URL}/schedule/slots?date=${date}`);
  if (!response.ok) throw new Error("Failed to load available slots.");
  return response.json();
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
