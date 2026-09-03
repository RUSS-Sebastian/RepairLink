import { createContext, useContext, useEffect, useState } from "react";
import {
  createVehicle as createVehicleApi,
  deleteVehicle as deleteVehicleApi,
  listVehicles,
  updateVehicle as updateVehicleApi,
} from "../features/vehicles/vehicleApi";

const VehicleContext = createContext(null);

export function VehicleProvider({ children }) {
  const [vehicles, setVehicles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadVehicles = async () => {
      try {
        const response = await listVehicles();

        if (isMounted) {
          setVehicles(response.map(normalizeVehicle));
          setError("");
        }
      } catch (requestError) {
        if (isMounted) {
          setError(requestError.message || "Unable to load vehicles.");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadVehicles();

    return () => {
      isMounted = false;
    };
  }, []);

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
