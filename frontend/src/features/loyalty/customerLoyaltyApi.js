const API_BASE_URL = "http://localhost:8080/api";

export async function getCustomerLoyalty() {
  const token = localStorage.getItem("repairlink_auth_token");

  if (!token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(`${API_BASE_URL}/customers/loyalty`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    let message = "Unable to load loyalty details.";
    try {
      const payload = await response.json();
      message = payload?.message || payload?.error || message;
    } catch {
      // Keep the default message when the response has no JSON body.
    }
    throw new Error(message);
  }

  return response.json();
}
