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
      "Notification request failed."
    );
  } catch {
    return "Notification request failed.";
  }
}

export async function getStaffNotifications() {
  const response = await fetch(`${API_BASE_URL}/staff/notifications`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function markNotificationAsRead(notificationId) {
  const response = await fetch(
    `${API_BASE_URL}/staff/notifications/${notificationId}/read`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function markAllNotificationsAsRead() {
  const response = await fetch(
    `${API_BASE_URL}/staff/notifications/read-all`,
    {
      method: "PATCH",
      headers: getAuthHeaders(),
    }
  );

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}
