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
      "Pick an available arrival time. We'll hold your selection for 50 seconds.",
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

export const HOLD_DURATION = 50 * 1000;

export const MAX_PHOTOS = 5;
export const MAX_PHOTO_SIZE = 10 * 1024 * 1024; // 10MB
export const ACCEPTED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export function createInitialState(vehicles = [], initialVehicleId = "") {
  const hasInitialVehicle = Boolean(initialVehicleId);
  return {
    step: hasInitialVehicle ? 1 : 0,
    vehicles: vehicles.map((v) => ({ ...v })),
    vehicleId: initialVehicleId || "",
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
    slotsMessage: "",
    slotHolding: false,
    activeVehicleIds: [], // array of vehicle IDs with active service requests
    error: "",
    pageError: "",
    submitting: false,
    submittedRequest: null,
  };
}

export function getSecondsLeft(holdUntil, now) {
  return holdUntil ? Math.max(0, Math.ceil((holdUntil - now) / 1000)) : 0;
}

export function getLocalDateString(d = new Date()) {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function validateStep(state, step = state.step) {
  if (step === 0) {
    if (!state.vehicles.some((v) => v.id === state.vehicleId))
      return "Please select a vehicle.";
    if (state.activeVehicleIds?.includes(state.vehicleId))
      return "This vehicle already has an active service request. You cannot submit another request until the current one is cancelled or rejected.";
  }
  if (step === 1 && state.problem.trim().length < 10)
    return "Please describe the problem (at least 10 characters).";
  if (step === 3) {
    if (!state.date) return "Please select a preferred date.";
    const today = getLocalDateString();
    if (state.date < today) return "Preferred date cannot be in the past.";
    if (
      state.scheduleWindow?.startDate &&
      state.date < state.scheduleWindow.startDate
    ) {
      return `Appointments must be booked at least 2 available working days in advance (earliest is ${state.scheduleWindow.startDate}).`;
    }
    if (
      state.scheduleWindow?.endDate &&
      state.date > state.scheduleWindow.endDate
    ) {
      return `Preferred date cannot be after ${state.scheduleWindow.endDate}.`;
    }
  }
  if (step === 4) {
    if (state.holdExpired)
      return "Your slot hold has expired. Please select a time slot again.";
    if (!state.slot) return "Please select a time slot.";
  }
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
  const updatedSlots = (state.availableSlots || []).map((s) => {
    if (s.isHeldByCurrentUser || (state.slot && s.label === state.slot)) {
      return {
        ...s,
        isHeld: false,
        isHeldByCurrentUser: false,
        isSelectable: true,
        closureReason: null,
      };
    }
    return s;
  });

  return {
    ...state,
    slot: "",
    holdUntil: null,
    secondsLeft: 0,
    holdExpired: true,
    availableSlots: updatedSlots,
  };
}

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
      if (action.field === "date" && action.value !== state.date) {
        return {
          ...next,
          slot: "",
          holdUntil: null,
          secondsLeft: 0,
          holdExpired: false,
          pageError: "",
          slotsMessage: "",
          availableSlots: [],
          slotsLoading: true,
        };
      }
      return next;
    }
    case "SET_VEHICLES": {
      const vehicles = action.vehicles.map((v) => ({ ...v }));
      if (vehicles.length === 0) {
        return { ...state, vehicles };
      }
      const targetId = action.preselectedVehicleId || state.vehicleId;
      const matched = vehicles.find((v) => v.id === targetId);
      const vehicleId = matched ? matched.id : "";
      let step = state.step;
      if (action.preselectedVehicleId && matched && state.step === 0) {
        step = 1;
      } else if (targetId && !matched && state.step === 1 && !state.problem) {
        step = 0;
      }
      return { ...state, vehicles, vehicleId, step, error: "" };
    }
    case "PRESELECT_VEHICLE": {
      const targetId = action.vehicleId;
      return {
        ...state,
        vehicleId: targetId,
        step: state.step === 0 ? 1 : state.step,
        error: "",
      };
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

    // Active vehicle ids
    case "SET_ACTIVE_VEHICLE_IDS":
      return { ...state, activeVehicleIds: action.ids || [] };

    // Schedule window
    case "SET_SCHEDULE_WINDOW":
      return { ...state, scheduleWindow: action.window };

    // Slots
    case "SET_SLOTS_LOADING":
      return { ...state, slotsLoading: action.loading };
    case "SET_AVAILABLE_SLOTS":
      return { ...state, availableSlots: action.slots, slotsLoading: false };
    case "SET_SLOTS_MESSAGE":
      return { ...state, slotsMessage: action.message || "" };

    // Slot selection & holds
    case "HOLD_SLOT_START":
      return { ...state, slotHolding: true, pageError: "", error: "" };
    case "HOLD_SLOT_SUCCESS": {
      const expiresMs = action.expiresAt
        ? new Date(action.expiresAt).getTime()
        : action.now + HOLD_DURATION;
      const secondsLeft =
        action.secondsLeft != null
          ? action.secondsLeft
          : getSecondsLeft(expiresMs, action.now);
      return {
        ...state,
        slot: action.label,
        holdUntil: expiresMs,
        secondsLeft,
        holdExpired: false,
        slotHolding: false,
        error: "",
        pageError: "",
      };
    }
    case "HOLD_SLOT_ERROR":
      return {
        ...state,
        slotHolding: false,
        pageError: action.message || "Failed to hold slot.",
      };
    case "SELECT_SLOT": {
      if (!state.date || !action.label) return state;
      const expiresMs = action.expiresAt
        ? new Date(action.expiresAt).getTime()
        : action.now + HOLD_DURATION;
      return {
        ...state,
        slot: action.label,
        holdUntil: expiresMs,
        secondsLeft: action.secondsLeft != null ? action.secondsLeft : 50,
        holdExpired: false,
        slotHolding: false,
        error: "",
        pageError: "",
      };
    }
    case "EXPIRE_HOLD":
      return expireHold(state);
    case "TICK": {
      if (!state.holdUntil) return state;
      const secondsLeft = getSecondsLeft(state.holdUntil, action.now);
      return secondsLeft === 0 ? expireHold(state) : { ...state, secondsLeft };
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
      const isExpired =
        state.holdUntil && getSecondsLeft(state.holdUntil, action.now) === 0;
      let current = isExpired ? expireHold(state) : state;
      if (current.step > 4 && (current.holdExpired || !current.slot)) {
        return {
          ...current,
          step: 4,
          pageError:
            "Your time slot hold has expired. Please select a time slot again.",
          error: "",
        };
      }
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
