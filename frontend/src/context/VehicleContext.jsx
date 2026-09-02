import { createContext, useContext, useState } from "react";
import { initialVehicles } from "../features/vehicles/mockVehicles";

const VehicleContext = createContext(null);

export function VehicleProvider({ children }) {
  const [vehicles, setVehicles] = useState(initialVehicles);

  const addVehicle = (vehicle) => {
    const newVehicle = {
      ...vehicle,
      id: `vehicle-${Date.now()}`,
      mileage: Number(vehicle.mileage) || 0,
      plateHistory: [
        {
          plate: vehicle.licensePlate,
          date: new Date().toISOString().split("T")[0],
          current: true,
        },
      ],
    };

    setVehicles((current) => [...current, newVehicle]);
  };

  const updateVehicle = (id, updatedVehicle) => {
    setVehicles((current) =>
      current.map((vehicle) =>
        vehicle.id === id
          ? {
              ...vehicle,
              ...updatedVehicle,
              mileage: Number(updatedVehicle.mileage) || 0,
            }
          : vehicle
      )
    );
  };

  const deleteVehicle = (id) => {
    setVehicles((current) =>
      current.filter((vehicle) => vehicle.id !== id)
    );
  };

  const getVehicle = (id) => {
    return vehicles.find((vehicle) => vehicle.id === id);
  };

  return (
    <VehicleContext.Provider
      value={{
        vehicles,
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

export function useVehicles() {
  const context = useContext(VehicleContext);

  if (!context) {
    throw new Error(
      "useVehicles must be used inside VehicleProvider"
    );
  }

  return context;
}