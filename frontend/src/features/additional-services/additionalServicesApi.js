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
    let message = "Additional services request failed.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // Fallback to default message when body is empty or non-JSON
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

export function listAdditionalServices({
  search = "",
  status = "ALL",
  applicability = "ALL",
  page = 0,
  size = 25,
} = {}) {
  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (status && status !== "ALL") params.append("status", status);
  if (applicability && applicability !== "ALL")
    params.append("applicability", applicability);
  params.append("page", String(page));
  params.append("size", String(size));
  return request(`/admin/additional-services?${params.toString()}`);
}

export function createAdditionalService(data) {
  return request("/admin/additional-services", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateAdditionalService(serviceId, data) {
  return request(`/admin/additional-services/${serviceId}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function changeServiceStatus(serviceId, status) {
  return request(`/admin/additional-services/${serviceId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
