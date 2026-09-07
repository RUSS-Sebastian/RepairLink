export const MOCK_VEHICLES = [
  {
    id: "vehicle-corolla",
    nickname: "Daily Driver",
    make: "Toyota",
    model: "Corolla",
    year: 2023,
    licensePlate: "YGN-3A-2023",
    vehicleType: "Normal Car",
    color: "Pearl White",
    mileage: 18500,
    fuelType: "Petrol",
    transmission: "Automatic",
  },
  {
    id: "vehicle-tesla",
    nickname: "EV Beast",
    make: "Tesla",
    model: "Model 3",
    year: 2024,
    licensePlate: "YGN-7E-2024",
    vehicleType: "EV",
    color: "Midnight Silver",
    mileage: 8200,
    fuelType: null,
    transmission: null,
  },
];

export const TIME_SLOTS = [
  { time: "09:00", spaces: 2, full: false },
  { time: "10:00", spaces: 1, full: false },
  { time: "11:00", spaces: 0, full: true },
  { time: "12:00", spaces: 3, full: false },
  { time: "14:00", spaces: 2, full: false },
  { time: "15:00", spaces: 1, full: false },
  { time: "16:00", spaces: 0, full: true },
];

export const ADDITIONAL_SERVICES = [
  "Interior vacuum & cleaning",
  "Exterior wash & wax",
  "Tire rotation",
  "AC system check",
  "Battery health check",
];

export const STEPS = [
  {
    label: "Vehicle",
    title: "Which vehicle needs a little care?",
    description: "Select the vehicle you’d like to book a service for.",
  },
  {
    label: "Problem",
    title: "Tell us what’s going on.",
    description:
      "Describe what you’ve noticed. Leave the diagnosis to our technicians.",
  },
  {
    label: "Media",
    title: "A little context goes a long way.",
    description:
      "Add photos or a video to help explain the symptoms. This step is optional.",
  },
  {
    label: "Date",
    title: "Let’s find a day that works.",
    description:
      "Choose your preferred service date. The service center will confirm your appointment.",
  },
  {
    label: "Time slot",
    title: "Make time for a smoother ride.",
    description:
      "Pick an available arrival time. We’ll hold your selection for five minutes.",
  },
  {
    label: "Handover",
    title: "How will your vehicle get here?",
    description: "A pickup at your doorstep or a drop-off on your terms.",
  },
  {
    label: "Extras",
    title: "A little extra care?",
    description:
      "Round out your visit with optional non-repair services. No extras? No problem.",
  },
  {
    label: "Review",
    title: "Everything look good?",
    description:
      "Take a moment to review your request. Go back to make any changes.",
  },
  {
    label: "Submit",
    title: "Ready to Submit",
    description:
      "Click submit to send your service request. The service center will review it and confirm your appointment.",
  },
];

export const HOLD_DURATION = 5 * 60 * 1000;
export const SLOT_UNAVAILABLE_MESSAGE =
  "Selected slot is no longer available. Your other information has been preserved. Please choose another slot.";

export function createInitialState(vehicles = MOCK_VEHICLES) {
  return {
    step: 0,
    vehicles: vehicles.map((vehicle) => ({ ...vehicle })),
    vehicleId: "",
    problem: "",
    media: [],
    date: "",
    slot: "",
    holdUntil: null,
    secondsLeft: 0,
    holdExpired: false,
    handover: "Drop-off",
    pickupLocation: "",
    additionalServices: [],
    error: "",
    pageError: "",
    unavailableSlots: [],
    requests: [],
    submittedRequest: null,
  };
}

export function getSecondsLeft(holdUntil, now) {
  return holdUntil ? Math.max(0, Math.ceil((holdUntil - now) / 1000)) : 0;
}

export function validateStep(state, step = state.step) {
  if (
    step === 0 &&
    !state.vehicles.some((vehicle) => vehicle.id === state.vehicleId)
  )
    return "Please select a vehicle.";
  if (step === 1 && state.problem.trim().length < 10)
    return "Please describe the problem (at least 10 characters).";
  if (step === 3 && !state.date) return "Please select a preferred date.";
  if (step === 4 && !state.slot) return "Please select a time slot.";
  if (step === 5 && state.handover === "Pickup" && !state.pickupLocation.trim())
    return "Please enter your pickup location.";
  return "";
}

export function createMockMedia(
  sequence,
  failed = false,
  random = Math.random,
) {
  const type = random() < 0.5 ? "image" : "video";
  return {
    id: `media-${sequence}`,
    type,
    filename:
      type === "image"
        ? `photo_${sequence}.jpg`
        : `vehicle_clip_${sequence}.mp4`,
    size: Number((0.5 + random() * (type === "image" ? 7.5 : 39.5)).toFixed(1)),
    status: failed ? "Upload Failed" : "Uploaded",
  };
}

function expireHold(state) {
  return {
    ...state,
    slot: "",
    holdUntil: null,
    secondsLeft: 0,
    holdExpired: true,
  };
}

// Time, randomness, and IDs arrive in actions to keep transitions pure and testable.
export function serviceRequestReducer(state, action) {
  if (state.submittedRequest && action.type !== "START_NEW") return state;

  switch (action.type) {
    case "UPDATE": {
      if (
        ![
          "vehicleId",
          "problem",
          "date",
          "handover",
          "pickupLocation",
        ].includes(action.field)
      )
        return state;
      const next = { ...state, [action.field]: action.value, error: "" };
      return action.field === "date" && action.value !== state.date
        ? {
            ...next,
            slot: "",
            holdUntil: null,
            secondsLeft: 0,
            holdExpired: false,
            pageError: "",
          }
        : next;
    }
    case "SET_VEHICLES": {
      const vehicles = action.vehicles.map((vehicle) => ({ ...vehicle }));
      const vehicleId = vehicles.some(
        (vehicle) => vehicle.id === state.vehicleId,
      )
        ? state.vehicleId
        : "";
      return { ...state, vehicles, vehicleId, error: "" };
    }
    case "ADD_VEHICLE":
      return {
        ...state,
        vehicles: [...state.vehicles, action.vehicle],
        vehicleId: action.vehicle.id,
        error: "",
      };
    case "ADD_MEDIA":
      return { ...state, media: [...state.media, action.file] };
    case "REMOVE_MEDIA":
      return {
        ...state,
        media: state.media.filter((file) => file.id !== action.id),
      };
    case "TOGGLE_SERVICE":
      if (!ADDITIONAL_SERVICES.includes(action.service)) return state;
      return {
        ...state,
        additionalServices: state.additionalServices.includes(action.service)
          ? state.additionalServices.filter(
              (service) => service !== action.service,
            )
          : [...state.additionalServices, action.service],
      };
    case "SELECT_SLOT": {
      const slot = TIME_SLOTS.find((item) => item.time === action.time);
      if (
        !state.date ||
        !slot ||
        slot.full ||
        state.unavailableSlots.includes(`${state.date}/${action.time}`)
      )
        return state;
      return {
        ...state,
        slot: slot.time,
        holdUntil: action.now + HOLD_DURATION,
        secondsLeft: 300,
        holdExpired: false,
        error: "",
        pageError: "",
      };
    }
    case "TICK": {
      if (!state.holdUntil) return state;
      const secondsLeft = getSecondsLeft(state.holdUntil, action.now);
      return secondsLeft === 0 ? expireHold(state) : { ...state, secondsLeft };
    }
    case "BACK":
      return { ...state, step: Math.max(0, state.step - 1), error: "" };
    case "GO_BACK":
      return action.step >= 0 && action.step < state.step
        ? { ...state, step: action.step, error: "" }
        : state;
    case "NEXT": {
      const current =
        state.holdUntil && getSecondsLeft(state.holdUntil, action.now) === 0
          ? expireHold(state)
          : state;
      const error = validateStep(current);
      return error
        ? { ...current, error }
        : { ...current, step: Math.min(8, current.step + 1), error: "" };
    }
    case "SUBMIT": {
      if (state.step !== 8) return state;
      const current = !getSecondsLeft(state.holdUntil, action.now)
        ? expireHold(state)
        : state;
      for (const step of [0, 1, 3, 4, 5]) {
        const error = validateStep(current, step);
        if (error) return { ...current, step, error };
      }
      if (action.random < 0.2) {
        return {
          ...current,
          step: 4,
          slot: "",
          holdUntil: null,
          secondsLeft: 0,
          holdExpired: false,
          error: "",
          pageError: SLOT_UNAVAILABLE_MESSAGE,
          unavailableSlots: [
            ...current.unavailableSlots,
            `${current.date}/${state.slot}`,
          ],
        };
      }
      const request = {
        id: action.id,
        createdAt: new Date(action.now).toISOString(),
        status: "Pending Service Center Review",
        vehicle: {
          ...current.vehicles.find(
            (vehicle) => vehicle.id === current.vehicleId,
          ),
        },
        problem: current.problem.trim(),
        media: current.media.map((file) => ({ ...file })),
        preferredDate: current.date,
        timeSlot: current.slot,
        handover: current.handover,
        pickupLocation:
          current.handover === "Pickup" ? current.pickupLocation.trim() : null,
        additionalServices: [...current.additionalServices],
      };
      return {
        ...current,
        holdUntil: null,
        secondsLeft: 0,
        error: "",
        pageError: "",
        submittedRequest: request,
        requests: [...current.requests, request],
      };
    }
    case "START_NEW":
      return {
        ...createInitialState(state.vehicles),
        requests: state.requests,
        unavailableSlots: state.unavailableSlots,
      };
    default:
      return state;
  }
}
