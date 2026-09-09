import { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  createVehicle as createVehicleApi,
  deleteVehicle as deleteVehicleApi,
  listVehicles,
  updateVehicle as updateVehicleApi,
} from "../features/vehicles/vehicleApi";
import { getStoredAuthSession } from "../utils/auth";

const VehicleContext = createContext(null);

export function VehicleProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVehicles = useCallback(async () => {
    const session = getStoredAuthSession();
    if (!session.token || session.user?.role !== "CUSTOMER") {
      setVehicles([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const response = await listVehicles();
      setVehicles(response.map(normalizeVehicle));
      setError("");
    } catch (requestError) {
      setError(requestError.message || "Unable to load vehicles.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadVehicles();

    const handleAuthUpdate = () => {
      loadVehicles();
    };

    window.addEventListener("repairlink_auth_updated", handleAuthUpdate);
    return () => {
      window.removeEventListener("repairlink_auth_updated", handleAuthUpdate);
    };
  }, [loadVehicles]);

  const addVehicle = async (vehicle) => {
    const savedVehicle = await createVehicleApi(vehicle);
    const newVehicle = normalizeVehicle(savedVehicle);

    setVehicles((current) => [...current, newVehicle]);
    return newVehicle;
  };

  const updateVehicle = async (id, updatedVehicle) => {
    const savedVehicle = await updateVehicleApi(id, updatedVehicle);
    const normalizedVehicle = normalizeVehicle(savedVehicle);

    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === id ? normalizedVehicle : vehicle,
      ),
    );

    return normalizedVehicle;
  };

  const deleteVehicle = async (id) => {
    await deleteVehicleApi(id);
    setVehicles((current) => current.filter((vehicle) => vehicle.id !== id));
  };

  const getVehicle = (id) => {
    return vehicles.find((vehicle) => vehicle.id === id);
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
        isLoading,
        error,
        addVehicle,
        updateVehicle,
        deleteVehicle,
        getVehicle,
        reloadVehicles: loadVehicles,
      }}
    >
      {children}
    </VehicleContext.Provider>
  );
}

function normalizeVehicle(vehicle) {
  return {
    ...vehicle,
    mileage: vehicle.currentMileage ?? 0,
    mileageUnit: (vehicle.mileageUnit || "MI").toLowerCase(),
    plateHistory: vehicle.plateHistory?.map((item) => ({
      plate: item.licensePlate,
      date: item.changedAt?.split("T")[0],
      current: item.current,
    })),
  };
}

export function useVehicles() {
  const context = useContext(VehicleContext);

  if (!context) {
    throw new Error("useVehicles must be used inside VehicleProvider");
  }

  return context;
}
