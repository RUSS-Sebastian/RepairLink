export const initialVehicles = [
  {
    id: "vehicle-1",
    nickname: "Daily Driver",
    year: 2023,
    make: "Toyota",
    model: "Corolla",
    type: "Normal Car",
    fuelType: "Petrol",
    transmission: "Automatic",
    color: "Silver",
    licensePlate: "SLV-4821",
    mileage: 24850,
    mileageUnit: "mi",
    plateHistory: [
      {
        plate: "SLV-4821",
        date: "2023-04-02",
        current: true,
      },
      {
        plate: "TMP-0901",
        date: "2023-03-20",
        current: false,
      },
    ],
  },

  {
    id: "vehicle-2",
    nickname: "EV Beast",
    year: 2024,
    make: "Tesla",
    model: "Model 3",
    type: "EV",
    fuelType: "Electric",
    transmission: "Automatic",
    color: "Midnight Blue",
    licensePlate: "EVT-2024",
    mileage: 8120,
    mileageUnit: "mi",
    plateHistory: [
      {
        plate: "EVT-2024",
        date: "2024-02-12",
        current: true,
      },
    ],
  },
];