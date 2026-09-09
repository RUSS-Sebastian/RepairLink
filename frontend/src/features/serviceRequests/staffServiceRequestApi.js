const API_BASE_URL = "http://localhost:8080/api";

function getAuthHeaders() {
  const token = localStorage.getItem("repairlink_auth_token");
  if (!token) {
    throw new Error("Authentication required.");
  }
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
}

async function parseApiError(response) {
  try {
    const payload = await response.json();
    return (
      payload?.message ||
      payload?.error ||
      payload?.errorCode ||
      "Service request action failed."
    );
  } catch {
    return "Service request action failed.";
  }
}

export async function listStaffServiceRequests() {
  const response = await fetch(`${API_BASE_URL}/staff/service-requests`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function getStaffServiceRequestDetail(serviceRequestId) {
  const response = await fetch(
    `${API_BASE_URL}/staff/service-requests/${serviceRequestId}`,
    {
      method: "GET",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}
