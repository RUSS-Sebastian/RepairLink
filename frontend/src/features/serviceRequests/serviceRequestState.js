export const STEPS = [
  {
    label: "Vehicle",
    title: "Which vehicle needs a little care?",
    description: "Select the vehicle you'd like to book a service for.",
  },
  {
    label: "Problem",
    title: "Tell us what's going on.",
    description:
      "Describe what you've noticed. Leave the diagnosis to our technicians.",
  },
  {
    label: "Photos",
    title: "A picture is worth a thousand words.",
    description:
      "Add photos to help explain the symptoms. This step is optional. Max 5 photos, 10MB each.",
  },
  {
    label: "Date",
    title: "Let's find a day that works.",
    description:
      "Choose your preferred service date from the current scheduling window.",
  },
  {
    label: "Time slot",
    title: "Make time for a smoother ride.",
    description:
      "Pick an available arrival time. We'll hold your selection for five minutes.",
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
      "Round out your visit with optional services. No extras? No problem.",
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

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function createInitialState(vehicles = []) {
  return {
    step: 0,
    vehicles: vehicles.map((v) => ({ ...v })),
    vehicleId: "",
    problem: "",
    media: [], // { id, file: File, filename, sizeMb, previewUrl, status: 'Ready' }
    date: "",
    slot: "", // full slot label like "09:00 \u2013 10:00"
    holdUntil: null,
    secondsLeft: 0,
    holdExpired: false,
    handover: "Drop-off",
    pickupLocation: "",
    selectedServiceIds: [], // array of UUID strings
    availableServicesList: [], // from backend
    scheduleWindow: null, // { startDate, endDate, operatingDays, ... }
    availableSlots: [], // SlotDto[] from backend
    slotsLoading: false,
    error: "",
    pageError: "",
    submitting: false,
    submittedRequest: null,
  };
}

export function getSecondsLeft(holdUntil, now) {
  return holdUntil ? Math.max(0, Math.ceil((holdUntil - now) / 1000)) : 0;
}

export function validateStep(state, step = state.step) {
  if (
    step === 0 &&
    !state.vehicles.some((v) => v.id === state.vehicleId)
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

export function validatePhoto(file) {
  if (!ACCEPTED_PHOTO_TYPES.includes(file.type)) {
    return `"${file.name}" is not a supported image type. Use JPEG, PNG, or WebP.`;
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return `"${file.name}" exceeds the 10MB size limit.`;
  }
  return "";
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

export function serviceRequestReducer(state, action) {
  if (state.submittedRequest && action.type !== "START_NEW") return state;

  switch (action.type) {
    case "UPDATE": {
      if (
        !["vehicleId", "problem", "date", "handover", "pickupLocation"].includes(
          action.field,
        )
      )
        return state;
      const next = { ...state, [action.field]: action.value, error: "" };
      if (action.field === "date" && action.value !== state.date) {
        return {
          ...next,
          slot: "",
          holdUntil: null,
          secondsLeft: 0,
          holdExpired: false,
          pageError: "",
          availableSlots: [],
          slotsLoading: true,
        };
      }
      return next;
    }
    case "SET_VEHICLES": {
      const vehicles = action.vehicles.map((v) => ({ ...v }));
      const vehicleId = vehicles.some((v) => v.id === state.vehicleId)
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

    // Photo actions
    case "ADD_PHOTOS": {
      const newMedia = [...state.media];
      for (const entry of action.photos) {
        if (newMedia.length >= MAX_PHOTOS) break;
        newMedia.push(entry);
      }
      return { ...state, media: newMedia, error: "" };
    }
    case "REMOVE_PHOTO": {
      const removed = state.media.find((m) => m.id === action.id);
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return {
        ...state,
        media: state.media.filter((m) => m.id !== action.id),
      };
    }

    // Schedule window
    case "SET_SCHEDULE_WINDOW":
      return { ...state, scheduleWindow: action.window };

    // Slots
    case "SET_SLOTS_LOADING":
      return { ...state, slotsLoading: action.loading };
    case "SET_AVAILABLE_SLOTS":
      return { ...state, availableSlots: action.slots, slotsLoading: false };

    // Slot selection
    case "SELECT_SLOT": {
      if (!state.date || !action.label) return state;
      return {
        ...state,
        slot: action.label,
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
      return secondsLeft === 0
        ? expireHold(state)
        : { ...state, secondsLeft };
    }

    // Additional services (from DB)
    case "SET_AVAILABLE_SERVICES":
      return { ...state, availableServicesList: action.services };
    case "TOGGLE_SERVICE_BY_ID": {
      const id = action.serviceId;
      return {
        ...state,
        selectedServiceIds: state.selectedServiceIds.includes(id)
          ? state.selectedServiceIds.filter((s) => s !== id)
          : [...state.selectedServiceIds, id],
      };
    }

    // Navigation
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

    // Submit lifecycle
    case "SUBMIT_START":
      return { ...state, submitting: true, error: "", pageError: "" };
    case "SUBMIT_SUCCESS":
      return {
        ...state,
        submitting: false,
        holdUntil: null,
        secondsLeft: 0,
        error: "",
        pageError: "",
        submittedRequest: action.response,
      };
    case "SUBMIT_ERROR":
      return { ...state, submitting: false, pageError: action.message };

    case "START_NEW":
      return createInitialState(state.vehicles);

    default:
      return state;
  }
}
