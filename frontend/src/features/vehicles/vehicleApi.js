const API_BASE_URL = "http://localhost:8080/api";

async function parseApiError(response) {
  try {
    const payload = await response.json();
    return (
      payload?.message ||
      payload?.error ||
      payload?.errorCode ||
      "Vehicle request failed."
    );
  } catch {
    return "Vehicle request failed.";
  }
}

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

export async function listVehicles() {
  const response = await fetch(`${API_BASE_URL}/vehicles`, {
    method: "GET",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function createVehicle(vehicle) {
  const payload = {
    nickname: vehicle.nickname || null,
    make: vehicle.make,
    model: vehicle.model,
    year: Number(vehicle.year),
    licensePlate: vehicle.licensePlate,
    vehicleType: vehicle.vehicleType,
    fuelType: vehicle.vehicleType === "EV" ? null : vehicle.fuelType,
    transmission: vehicle.vehicleType === "EV" ? null : vehicle.transmission,
    color: vehicle.color,
    currentMileage: Number(vehicle.mileage) || 0,
    mileageUnit: vehicle.mileageUnit === "km" ? "KM" : "MI",
  };

  const response = await fetch(`${API_BASE_URL}/vehicles`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}

export async function deleteVehicle(vehicleId) {
  const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
}

export async function updateVehicle(vehicleId, vehicle) {
  const payload = { ...vehicle };

  delete payload.mileage;

  if ("year" in payload) {
    payload.year = payload.year === "" ? null : Number(payload.year);
  }

  if ("currentMileage" in payload) {
    payload.currentMileage =
      payload.currentMileage === ""
        ? null
        : Number(payload.currentMileage) || 0;
  }

  if ("mileageUnit" in payload) {
    payload.mileageUnit = payload.mileageUnit
      ? payload.mileageUnit.toUpperCase()
      : null;
  }

  const response = await fetch(`${API_BASE_URL}/vehicles/${vehicleId}`, {
    method: "PATCH",
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }

  return response.json();
}
