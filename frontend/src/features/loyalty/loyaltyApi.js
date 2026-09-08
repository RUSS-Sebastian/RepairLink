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
    let message = "Loyalty request failed.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // Use the default message when the server returns no JSON body.
    }
    throw new Error(message);
  }

  return response.json();
}

export function listLoyaltyRanks() {
  return request("/admin/loyalty-ranks");
}

export function createLoyaltyRank(payload) {
  return request("/admin/loyalty-ranks", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateLoyaltyRank(rankId, payload) {
  return request(`/admin/loyalty-ranks/${rankId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function setLoyaltyRankActive(rankId, active) {
  return request(
    `/admin/loyalty-ranks/${rankId}/${active ? "activate" : "deactivate"}`,
    {
      method: "PATCH",
    },
  );
}
