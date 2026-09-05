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
    let message = "Parts request failed.";
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

export function listParts({
  search = "",
  status = "All",
  lowStock = false,
  page = 0,
  size = 10,
} = {}) {
  const params = new URLSearchParams({
    search,
    status,
    lowStock: String(lowStock),
    page: String(page),
    size: String(size),
  });

  return request(`/admin/parts?${params.toString()}`);
}

export function createPart(part) {
  return request("/admin/parts", {
    method: "POST",
    body: JSON.stringify(part),
  });
}

export function updatePart(id, part) {
  return request(`/admin/parts/${id}`, {
    method: "PUT",
    body: JSON.stringify(part),
  });
}

export function updatePartStatus(id, status) {
  return request(`/admin/parts/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
