import { useEffect, useCallback, useReducer, useRef, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  CalendarDays,
  Camera,
  CarFront,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileImage,
  ImagePlus,
  LoaderCircle,
  Lock,
  MapPin,
  PackageCheck,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import {
  createInitialState,
  serviceRequestReducer,
  STEPS,
  HOLD_DURATION,
  MAX_PHOTOS,
  ACCEPTED_PHOTO_TYPES,
  validatePhoto,
  validateStep,
  getSecondsLeft,
  getLocalDateString,
} from "../../features/serviceRequests/serviceRequestState";
import {
  getCurrentScheduleWindow,
  getAvailableSlots,
  getAdditionalServices,
  submitServiceRequest,
  getActiveVehicleIds,
  holdSlot,
  releaseSlotHold,
} from "../../features/serviceRequests/serviceRequestApi";
import { useVehicles } from "../../context/VehicleContext";
import { ROUTES } from "../../constants/routes";

function ServiceRequestPage() {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const preselectedVehicleId =
    location.state?.selectedVehicleId ||
    location.state?.vehicleId ||
    searchParams.get("vehicleId") ||
    "";

  const {
    vehicles,
    isLoading: vehiclesLoading,
    error: vehiclesError,
  } = useVehicles();
  const [state, dispatch] = useReducer(
    serviceRequestReducer,
    preselectedVehicleId,
    (preselectedId) => createInitialState([], preselectedId),
  );
  const [photoError, setPhotoError] = useState("");
  const [activeVehicleWarning, setActiveVehicleWarning] = useState("");
  const autoAppliedRef = useRef(false);

  useEffect(() => {
    getActiveVehicleIds()
      .then((ids) => {
        const idStrings = (ids || []).map((x) => String(x).toLowerCase());
        dispatch({ type: "SET_ACTIVE_VEHICLE_IDS", ids: idStrings });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (
      preselectedVehicleId &&
      !autoAppliedRef.current &&
      vehicles.length > 0 &&
      state.activeVehicleIds !== undefined
    ) {
      const isBlocked = (state.activeVehicleIds || []).includes(
        String(preselectedVehicleId).toLowerCase(),
      );
      const targetVehicle = vehicles.find((v) => v.id === preselectedVehicleId);

      if (isBlocked && targetVehicle) {
        autoAppliedRef.current = true;
        setActiveVehicleWarning(
          `"${targetVehicle.nickname}" already has an active service request awaiting workshop review. You cannot create another request for this vehicle until the current one is cancelled or resolved.`,
        );
        dispatch({ type: "SET_VEHICLES", vehicles });
        dispatch({ type: "UPDATE", field: "vehicleId", value: "" });
        dispatch({ type: "GO_BACK", step: 0 });
      } else if (targetVehicle && !isBlocked) {
        autoAppliedRef.current = true;
        dispatch({
          type: "SET_VEHICLES",
          vehicles,
          preselectedVehicleId,
        });
      } else {
        dispatch({ type: "SET_VEHICLES", vehicles });
      }
    } else {
      dispatch({ type: "SET_VEHICLES", vehicles });
    }
  }, [vehicles, preselectedVehicleId, state.activeVehicleIds]);

  useEffect(() => {
    if (!state.holdUntil) return undefined;
    const timer = window.setInterval(
      () => dispatch({ type: "TICK", now: Date.now() }),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [state.holdUntil]);

  // Release hold on page unmount
  useEffect(() => {
    return () => {
      releaseSlotHold();
    };
  }, []);

  // Load schedule window once
  useEffect(() => {
    getCurrentScheduleWindow()
      .then((window) => dispatch({ type: "SET_SCHEDULE_WINDOW", window }))
      .catch(() => {});
  }, []);

  // Refresh slots callback
  const refreshSlots = useCallback(() => {
    if (!state.date) return;
    dispatch({ type: "SET_SLOTS_LOADING", loading: true });
    getAvailableSlots(state.date)
      .then((data) => {
        dispatch({ type: "SET_AVAILABLE_SLOTS", slots: data.slots || [] });
        if (!data.isOpen && (data.blockedReason || data.message)) {
          dispatch({
            type: "SET_SLOTS_MESSAGE",
            message: data.blockedReason || data.message,
          });
        } else {
          dispatch({ type: "SET_SLOTS_MESSAGE", message: "" });
        }
      })
      .catch(() => dispatch({ type: "SET_AVAILABLE_SLOTS", slots: [] }));
  }, [state.date]);

  // Load / refresh slots when date changes or whenever entering Step 4 (Time slot)
  useEffect(() => {
    if (!state.date) return;
    refreshSlots();
  }, [state.date, state.step, refreshSlots]);

  // When hold expires while on step 4 (Time slot), refresh available slots from backend
  useEffect(() => {
    if (state.holdExpired && state.step === 4) {
      refreshSlots();
    }
  }, [state.holdExpired, state.step, refreshSlots]);

  // Hold slot handler
  const handleSelectSlot = async (slot) => {
    if (!state.date || !slot?.label) return;
    if (!slot.isSelectable && !slot.isHeldByCurrentUser) {
      dispatch({
        type: "HOLD_SLOT_ERROR",
        message:
          slot.holdStatusMessage ||
          "This slot is currently unavailable. Please choose a different slot.",
      });
      refreshSlots();
      return;
    }

    dispatch({ type: "HOLD_SLOT_START" });
    try {
      const res = await holdSlot(state.date, slot.label);
      dispatch({
        type: "HOLD_SLOT_SUCCESS",
        label: slot.label,
        expiresAt: res.expiresAt,
        secondsLeft: res.secondsLeft,
        now: Date.now(),
      });
      refreshSlots();
    } catch (err) {
      dispatch({
        type: "HOLD_SLOT_ERROR",
        message:
          err.message ||
          "Could not hold this slot. It may have just been reserved by another customer.",
      });
      refreshSlots();
    }
  };

  // Date change handler (releases existing hold if date changed)
  const handleDateChange = (newDate) => {
    if (state.slot || state.holdUntil) {
      releaseSlotHold();
    }
    dispatch({ type: "UPDATE", field: "date", value: newDate });
  };

  // Load additional services when vehicle changes
  const selectedVehicle = state.vehicles.find((v) => v.id === state.vehicleId);
  useEffect(() => {
    if (!selectedVehicle) return;
    const vehicleType =
      selectedVehicle.vehicleType === "EV" ? "EV" : "NORMAL_CAR";
    getAdditionalServices(vehicleType)
      .then((services) =>
        dispatch({ type: "SET_AVAILABLE_SERVICES", services }),
      )
      .catch(() => dispatch({ type: "SET_AVAILABLE_SERVICES", services: [] }));
  }, [selectedVehicle?.id]);

  const step = STEPS[state.step];

  const goNext = () => {
    if (state.step > 4 && (state.holdExpired || !state.slot)) {
      dispatch({ type: "EXPIRE_HOLD" });
      dispatch({ type: "GO_BACK", step: 4 });
      return;
    }
    dispatch({ type: "NEXT", now: Date.now() });
  };
  const goBack = () => dispatch({ type: "BACK" });

  const submit = async () => {
    // Check if slot hold expired before submitting
    const isExpired =
      state.holdExpired ||
      !state.slot ||
      (state.holdUntil && getSecondsLeft(state.holdUntil, Date.now()) === 0);

    if (isExpired) {
      dispatch({ type: "EXPIRE_HOLD" });
      dispatch({ type: "GO_BACK", step: 4 });
      return;
    }

    // Validate all required steps
    for (const s of [0, 1, 3, 4, 5]) {
      const error = validateStep(state, s);
      if (error) {
        if (s === 4) {
          dispatch({ type: "GO_BACK", step: 4 });
        } else {
          dispatch({ type: "BACK" });
        }
        return;
      }
    }

    dispatch({ type: "SUBMIT_START" });

    const fd = new FormData();
    fd.append("vehicleId", state.vehicleId);
    fd.append("problem", state.problem.trim());
    fd.append("preferredDate", state.date);
    fd.append("timeSlot", state.slot);
    fd.append(
      "handoverMethod",
      state.handover === "Pickup" ? "PICKUP" : "DROP_OFF",
    );
    if (state.handover === "Pickup") {
      fd.append("pickupLocation", state.pickupLocation.trim());
    }
    state.selectedServiceIds.forEach((id) =>
      fd.append("additionalServiceIds", id),
    );
    state.media.forEach((m) => fd.append("photos", m.file));

    try {
      const response = await submitServiceRequest(fd);
      dispatch({ type: "SUBMIT_SUCCESS", response });
    } catch (err) {
      dispatch({ type: "SUBMIT_ERROR", message: err.message });
    }
  };

  if (state.submittedRequest) {
    return (
      <SubmittedView
        request={state.submittedRequest}
        onStartNew={() => dispatch({ type: "START_NEW" })}
      />
    );
  }

  return (
    <div className="min-h-full bg-[#f4f8ff]">
      <div className="mx-auto max-w-6xl space-y-6 pb-10">
        {state.pageError && <AlertBanner message={state.pageError} />}

        <header className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-7 text-white shadow-xl shadow-blue-900/10 sm:px-8">
          <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border-[22px] border-blue-500/20" />
          <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-blue-300">
                RepairLink / Service request
              </p>
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Let&apos;s get your vehicle back to feeling right.
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
                A few thoughtful details help our service team prepare before
                you arrive.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-blue-200">
              <Sparkles size={16} />
              {state.step + 1} of {STEPS.length}
            </div>
          </div>
        </header>

        <StepIndicator
          currentStep={state.step}
          onSelect={(target) => dispatch({ type: "GO_BACK", step: target })}
        />

        <main className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_250px]">
          <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-7 flex items-start justify-between gap-5 border-b border-slate-100 pb-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
                  Step {state.step + 1}
                </p>
                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                  {step.title}
                </h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {step.description}
                </p>
              </div>
              <div className="hidden rounded-2xl bg-blue-50 p-3 text-blue-600 sm:block">
                <StepIcon step={state.step} />
              </div>
            </div>
            {state.error && <AlertBanner message={state.error} />}
            {state.holdExpired && state.step === 4 && (
              <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                <AlertCircle size={18} />
                Your slot hold has expired. Please select a slot again.
              </div>
            )}
            <StepContent
              state={state}
              dispatch={dispatch}
              selectedVehicle={selectedVehicle}
              vehiclesLoading={vehiclesLoading}
              vehiclesError={vehiclesError}
              photoError={photoError}
              setPhotoError={setPhotoError}
              activeVehicleWarning={activeVehicleWarning}
              onClearWarning={() => setActiveVehicleWarning("")}
              onDateChange={handleDateChange}
              onSelectSlot={handleSelectSlot}
              onRefreshSlots={refreshSlots}
            />
            <div className="mt-8 flex items-center justify-between gap-3 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={goBack}
                disabled={state.step === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft size={17} />
                Back
              </button>
              <button
                type="button"
                onClick={state.step === STEPS.length - 1 ? submit : goNext}
                disabled={state.submitting}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50"
              >
                {state.submitting ? (
                  <>
                    <LoaderCircle size={17} className="animate-spin" />
                    Submitting...
                  </>
                ) : state.step === STEPS.length - 1 ? (
                  <>
                    <PackageCheck size={17} />
                    Submit Request
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight size={17} />
                  </>
                )}
              </button>
            </div>
          </section>
          <RequestRail state={state} selectedVehicle={selectedVehicle} />
        </main>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function StepIndicator({ currentStep, onSelect }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-[760px] items-center px-4 py-4 sm:min-w-0 sm:px-6">
        {STEPS.map((item, index) => (
          <div key={item.label} className="flex flex-1 items-center">
            <button
              type="button"
              disabled={index > currentStep}
              onClick={() => onSelect(index)}
              className={`group flex items-center gap-2 text-left ${index > currentStep ? "cursor-default" : "cursor-pointer"}`}
            >
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${index < currentStep ? "bg-emerald-500 text-white" : index === currentStep ? "bg-[#0261F3] text-white shadow-md shadow-blue-500/30" : "bg-slate-100 text-slate-400"}`}
              >
                {index < currentStep ? <Check size={15} /> : index + 1}
              </span>
              <span
                className={`hidden text-xs font-bold sm:block ${index === currentStep ? "text-slate-900" : index < currentStep ? "text-emerald-700" : "text-slate-400"}`}
              >
                {item.label}
              </span>
            </button>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-2 h-px flex-1 ${index < currentStep ? "bg-emerald-300" : "bg-slate-200"}`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StepIcon({ step }) {
  const icons = [
    CarFront,
    CircleHelp,
    Camera,
    CalendarDays,
    Clock3,
    MapPin,
    Sparkles,
    CheckCircle2,
    PackageCheck,
  ];
  const Icon = icons[step];
  return <Icon size={22} />;
}

function AlertBanner({ message }) {
  return (
    <div className="mb-5 flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
      <AlertCircle size={18} className="shrink-0" />
      {message}
    </div>
  );
}

function StepContent({
  state,
  dispatch,
  selectedVehicle,
  vehiclesLoading,
  vehiclesError,
  photoError,
  setPhotoError,
  activeVehicleWarning,
  onClearWarning,
  onDateChange,
  onSelectSlot,
  onRefreshSlots,
}) {
  switch (state.step) {
    case 0:
      return (
        <VehicleStep
          state={state}
          dispatch={dispatch}
          loading={vehiclesLoading}
          error={vehiclesError}
          activeVehicleWarning={activeVehicleWarning}
          onClearWarning={onClearWarning}
        />
      );
    case 1:
      return (
        <ProblemStep
          state={state}
          dispatch={dispatch}
          selectedVehicle={selectedVehicle}
        />
      );
    case 2:
      return (
        <PhotoStep
          state={state}
          dispatch={dispatch}
          photoError={photoError}
          setPhotoError={setPhotoError}
        />
      );
    case 3:
      return (
        <DateStep
          state={state}
          dispatch={dispatch}
          onDateChange={onDateChange}
        />
      );
    case 4:
      return (
        <TimeStep
          state={state}
          dispatch={dispatch}
          onSelectSlot={onSelectSlot}
          onRefreshSlots={onRefreshSlots}
        />
      );
    case 5:
      return <HandoverStep state={state} dispatch={dispatch} />;
    case 6:
      return <ExtrasStep state={state} dispatch={dispatch} />;
    case 7:
      return <ReviewStep state={state} selectedVehicle={selectedVehicle} />;
    case 8:
      return <SubmitStep />;
    default:
      return null;
  }
}

/* ── Step 0: Vehicle ── */
function VehicleStep({
  state,
  dispatch,
  loading,
  error,
  activeVehicleWarning,
  onClearWarning,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <LoaderCircle size={20} className="animate-spin text-[#0261F3]" />
        Loading vehicles...
      </div>
    );
  }
  if (error) {
    return <AlertBanner message={error} />;
  }
  if (!state.vehicles.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
        <CarFront size={28} className="mx-auto text-slate-300" />
        <p className="mt-3 text-sm font-bold text-slate-600">
          No vehicles found
        </p>
        <p className="mt-1 text-xs text-slate-400">
          Please add a vehicle first.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {activeVehicleWarning && (
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-semibold text-amber-800">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="shrink-0 text-amber-600" />
            <span>{activeVehicleWarning}</span>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={ROUTES.ACTIVE_SERVICE}
              className="shrink-0 rounded-xl bg-amber-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-amber-700"
            >
              View Active Service
            </Link>
            <button
              type="button"
              onClick={onClearWarning}
              className="rounded-lg p-1 text-amber-600 hover:bg-amber-100"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {state.vehicles.map((v) => {
          const isBlocked = (state.activeVehicleIds || []).includes(
            String(v.id).toLowerCase(),
          );

          if (isBlocked) {
            return (
              <div
                key={v.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-amber-200 bg-amber-50/40 p-4 text-left shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                        <CarFront size={20} />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-slate-800">
                          {v.nickname}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-500">
                          {v.year} {v.make} {v.model} · {v.licensePlate}
                        </p>
                      </div>
                    </div>

                    <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                      <Clock3 size={11} />
                      Active Request
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-amber-200/60 pt-2.5 text-xs">
                  <span className="text-[11px] text-amber-700">
                    Already has a pending service request
                  </span>
                  <Link
                    to={ROUTES.ACTIVE_SERVICE}
                    className="font-bold text-[#0261F3] hover:underline"
                  >
                    View Request
                  </Link>
                </div>
              </div>
            );
          }

          return (
            <button
              key={v.id}
              type="button"
              onClick={() => {
                if (activeVehicleWarning) onClearWarning();
                dispatch({ type: "UPDATE", field: "vehicleId", value: v.id });
              }}
              className={`group rounded-2xl border p-4 text-left transition ${
                state.vehicleId === v.id
                  ? "border-[#0261F3] bg-blue-50 ring-4 ring-blue-500/10"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                      state.vehicleId === v.id
                        ? "bg-[#0261F3] text-white"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    <CarFront size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {v.nickname}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {v.year} {v.make} {v.model} · {v.licensePlate}
                    </p>
                  </div>
                </div>
                {state.vehicleId === v.id && (
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#0261F3] text-white shadow-sm">
                    <Check size={14} />
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 1: Problem ── */
function ProblemStep({ state, dispatch, selectedVehicle }) {
  return (
    <div>
      {selectedVehicle && (
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-blue-100 bg-blue-50/70 p-3.5 text-xs text-slate-700">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0261F3] text-white shadow-sm">
              <CarFront size={18} />
            </span>
            <div>
              <p className="font-bold text-slate-900">
                Selected Vehicle: {selectedVehicle.nickname}
              </p>
              <p className="text-[11px] text-slate-500">
                {selectedVehicle.year} {selectedVehicle.make}{" "}
                {selectedVehicle.model} · {selectedVehicle.licensePlate}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: "GO_BACK", step: 0 })}
            className="inline-flex items-center gap-1 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-bold text-[#0261F3] shadow-sm transition hover:bg-blue-50"
          >
            Change Vehicle
          </button>
        </div>
      )}
      <textarea
        value={state.problem}
        onChange={(e) =>
          dispatch({ type: "UPDATE", field: "problem", value: e.target.value })
        }
        placeholder="e.g. There is a grinding noise when I brake, especially at lower speeds."
        rows={8}
        className="w-full resize-y rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-sm leading-7 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
      />
      <div className="mt-2 flex justify-between text-xs font-semibold text-slate-400">
        <span>
          Symptoms only, please. Our technicians will handle the diagnosis.
        </span>
        <span>{state.problem.length} characters</span>
      </div>
    </div>
  );
}

/* ── Step 2: Photos (REAL file picker) ── */
function PhotoStep({ state, dispatch, photoError, setPhotoError }) {
  const inputRef = useRef(null);

  const handleFiles = useCallback(
    (files) => {
      setPhotoError("");
      const remaining = MAX_PHOTOS - state.media.length;
      if (remaining <= 0) {
        setPhotoError(`Maximum ${MAX_PHOTOS} photos allowed.`);
        return;
      }

      const toAdd = [];
      for (const file of Array.from(files).slice(0, remaining)) {
        const err = validatePhoto(file);
        if (err) {
          setPhotoError(err);
          continue;
        }
        toAdd.push({
          id: `photo-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          filename: file.name,
          sizeMb: Number((file.size / (1024 * 1024)).toFixed(1)),
          previewUrl: URL.createObjectURL(file),
          status: "Ready",
        });
      }
      if (toAdd.length) dispatch({ type: "ADD_PHOTOS", photos: toAdd });
    },
    [state.media.length, dispatch, setPhotoError],
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div>
      {photoError && <AlertBanner message={photoError} />}

      {/* Dropzone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/60 px-5 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50/30"
      >
        <ImagePlus size={32} className="mx-auto text-slate-300" />
        <p className="mt-3 text-sm font-bold text-slate-600">
          Click to browse or drag & drop photos
        </p>
        <p className="mt-1 text-xs text-slate-400">
          JPEG, PNG, or WebP · Max 10MB each · Up to {MAX_PHOTOS} photos
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {/* Photo count indicator */}
      <p className="mt-2 text-right text-xs font-semibold text-slate-400">
        {state.media.length} / {MAX_PHOTOS} photos
      </p>

      {/* Photo previews */}
      {state.media.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {state.media.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <img
                src={photo.previewUrl}
                alt={photo.filename}
                className="aspect-square w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/70 to-transparent px-2 pb-2 pt-6">
                <p className="truncate text-xs font-semibold text-white">
                  {photo.filename}
                </p>
                <p className="text-[10px] text-slate-300">{photo.sizeMb} MB</p>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch({ type: "REMOVE_PHOTO", id: photo.id });
                }}
                className="absolute right-1.5 top-1.5 rounded-full bg-slate-900/60 p-1 text-white opacity-0 transition group-hover:opacity-100 hover:bg-rose-600"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ── Step 3: Date (from schedule config window) ── */
function DateStep({ state, dispatch, onDateChange }) {
  const win = state.scheduleWindow;
  if (!win || !win.startDate) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-5 py-12 text-center">
        <CalendarDays size={28} className="mx-auto text-amber-400" />
        <p className="mt-3 text-sm font-bold text-amber-800">
          No scheduling window is currently open
        </p>
        <p className="mt-1 text-xs text-amber-600">
          Please check back later or contact the service center.
        </p>
      </div>
    );
  }

  const minDate = win.startDate;
  const isExhausted = minDate > win.endDate;

  if (isExhausted) {
    return (
      <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50 px-5 py-12 text-center">
        <CalendarDays size={28} className="mx-auto text-amber-400" />
        <p className="mt-3 text-sm font-bold text-amber-800">
          No available booking dates remaining in this window
        </p>
        <p className="mt-1 text-xs text-amber-600">
          Appointments require at least 2 available operating days advance
          notice. The current window ends on {win.endDate}.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-md">
      <label className="block text-xs font-bold uppercase tracking-[0.13em] text-slate-500">
        Preferred service date
      </label>
      <p className="mt-1 text-xs text-slate-400">
        Available: {minDate} to {win.endDate} ·{" "}
        {win.operatingDays.map((d) => d.slice(0, 3)).join(", ")}
      </p>
      <div className="relative mt-3">
        <CalendarDays
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"
          size={19}
        />
        <input
          type="date"
          min={minDate}
          max={win.endDate}
          value={state.date}
          onChange={(e) => {
            if (onDateChange) {
              onDateChange(e.target.value);
            } else {
              dispatch({
                type: "UPDATE",
                field: "date",
                value: e.target.value,
              });
            }
          }}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-base font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />
      </div>
      <p className="mt-3 text-sm text-slate-500">
        Appointments require at least 2 operating days advance notice. Choose an
        upcoming date within the service center&apos;s current scheduling
        window.
      </p>
    </div>
  );
}

/* ── Step 4: Time Slot (from backend /api/schedule/slots) ── */
function TimeStep({ state, dispatch, onSelectSlot, onRefreshSlots }) {
  const isToday = state.date === getLocalDateString();

  if (state.slotsLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-slate-500">
        <LoaderCircle size={20} className="animate-spin text-[#0261F3]" />
        Loading available slots...
      </div>
    );
  }

  if (!state.availableSlots.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
        <Clock3 size={28} className="mx-auto text-slate-300" />
        <p className="mt-3 text-sm font-bold text-slate-600">
          {state.slotsMessage
            ? state.slotsMessage
            : isToday
              ? "No remaining slots available for today"
              : "No slots available for this date"}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {state.slotsMessage
            ? "Please select another date that meets the advance notice requirements."
            : isToday
              ? "All arrival slots for today have already passed or are fully booked. Please select an upcoming date."
              : "Try selecting a different date."}
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">
          Available times for {isToday ? `today (${state.date})` : state.date}
        </p>
        <button
          type="button"
          onClick={onRefreshSlots}
          disabled={state.slotsLoading}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-600 disabled:opacity-50"
        >
          <RefreshCw
            size={13}
            className={state.slotsLoading ? "animate-spin text-blue-600" : ""}
          />
          <span>Refresh</span>
        </button>
      </div>

      {state.holdExpired && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
          <AlertCircle size={20} className="shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-bold">Hold expired</p>
            <p className="text-xs text-amber-700">
              Your reservation for this time slot has expired. Please select a
              time slot again.
            </p>
          </div>
        </div>
      )}

      {state.slot && !state.holdExpired && (
        <div className="mb-5 flex items-center justify-between rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <div className="flex items-center gap-3">
            <Clock3 size={18} className="text-blue-600" />
            <div>
              <p className="text-sm font-bold text-blue-900">
                Selected: {state.slot}
              </p>
              {state.secondsLeft > 0 && (
                <p className="mt-0.5 text-xs font-semibold text-blue-600">
                  Hold active · expires in {Math.floor(state.secondsLeft / 60)}:
                  {String(state.secondsLeft % 60).padStart(2, "0")}
                </p>
              )}
            </div>
          </div>
          {state.slotHolding && (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
              <LoaderCircle size={15} className="animate-spin" />
              <span>Reserving slot...</span>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-3">
        {state.availableSlots.map((slot) => {
          if (slot.isBreak) {
            return (
              <div
                key={slot.label}
                className="flex items-center justify-center rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-center text-xs font-semibold text-slate-400"
              >
                Break · {slot.label}
              </div>
            );
          }

          const isSelected =
            !state.holdExpired &&
            Boolean(state.slot) &&
            state.slot === slot.label;

          const isUnavailable =
            !slot.isSelectable && !isSelected && !slot.isHeldByCurrentUser;

          if (isUnavailable) {
            return (
              <div
                key={slot.label}
                onClick={() => onSelectSlot && onSelectSlot(slot)}
                className="group relative flex cursor-not-allowed flex-col items-center justify-center rounded-xl border border-amber-200 bg-amber-50/70 p-3.5 text-center transition hover:border-amber-300"
                title={slot.holdStatusMessage || "Reserved"}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <Lock size={13} className="text-amber-600" />
                  <span>{slot.label}</span>
                </div>
                <span className="mt-1 text-[10px] font-semibold text-amber-700">
                  {slot.holdStatusMessage || "Fully reserved"}
                </span>
              </div>
            );
          }

          if (isSelected) {
            return (
              <button
                key={slot.label}
                type="button"
                onClick={() => onSelectSlot && onSelectSlot(slot)}
                className="flex flex-col items-center justify-center rounded-xl border border-[#0261F3] bg-blue-50 p-3.5 text-[#0261F3] ring-4 ring-blue-500/10 transition"
              >
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  <Check size={16} />
                  <span>{slot.label}</span>
                </div>
                {state.secondsLeft > 0 && !state.holdExpired && (
                  <span className="mt-1 text-[11px] font-semibold text-blue-600">
                    Held for {Math.floor(state.secondsLeft / 60)}:
                    {String(state.secondsLeft % 60).padStart(2, "0")}
                  </span>
                )}
              </button>
            );
          }

          const capacityText =
            slot.availableCapacity !== undefined &&
            slot.availableCapacity !== null
              ? slot.availableCapacity === 1
                ? "1 spot left"
                : `${slot.availableCapacity} spots left`
              : slot.holdStatusMessage || "Available";

          return (
            <button
              key={slot.label}
              type="button"
              disabled={state.slotHolding}
              onClick={() => onSelectSlot && onSelectSlot(slot)}
              className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-3.5 text-sm font-bold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50/50 hover:text-[#0261F3] disabled:cursor-not-allowed disabled:border-slate-100 disabled:bg-slate-50 disabled:text-slate-300 active:scale-[0.98]"
            >
              <span>{slot.label}</span>
              <span
                className={`mt-1 text-[10px] font-semibold ${slot.availableCapacity === 1 ? "text-amber-600 font-bold" : "text-slate-400"}`}
              >
                {capacityText}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 5: Handover ── */
function HandoverStep({ state, dispatch }) {
  const update = (field, value) => dispatch({ type: "UPDATE", field, value });
  return (
    <div className="max-w-md space-y-4">
      {["Drop-off", "Pickup"].map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => update("handover", option)}
          className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
            state.handover === option
              ? "border-[#0261F3] bg-blue-50 ring-4 ring-blue-500/10"
              : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
          }`}
        >
          <span
            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
              state.handover === option
                ? "bg-[#0261F3] text-white"
                : "bg-slate-100 text-slate-500"
            }`}
          >
            {option === "Drop-off" ? (
              <CarFront size={20} />
            ) : (
              <MapPin size={20} />
            )}
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">{option}</p>
            <p className="mt-0.5 text-xs text-slate-500">
              {option === "Drop-off"
                ? "I'll bring the vehicle to the service center."
                : "Please pick up my vehicle."}
            </p>
          </div>
        </button>
      ))}
      {state.handover === "Pickup" && (
        <div className="mt-3">
          <label className="block text-xs font-bold uppercase tracking-[0.13em] text-slate-500">
            Pickup location
          </label>
          <input
            type="text"
            value={state.pickupLocation}
            onChange={(e) => update("pickupLocation", e.target.value)}
            placeholder="Enter your full address"
            className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
          />
        </div>
      )}
    </div>
  );
}

/* ── Step 6: Extras (from DB additional_services) ── */
function ExtrasStep({ state, dispatch }) {
  if (!state.availableServicesList.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
        <Sparkles size={28} className="mx-auto text-slate-300" />
        <p className="mt-3 text-sm font-bold text-slate-600">
          No additional services available
        </p>
        <p className="mt-1 text-xs text-slate-400">
          You can proceed without selecting extras.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      {state.availableServicesList.map((svc) => {
        const selected = state.selectedServiceIds.includes(svc.id);
        return (
          <button
            key={svc.id}
            type="button"
            onClick={() =>
              dispatch({ type: "TOGGLE_SERVICE_BY_ID", serviceId: svc.id })
            }
            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
              selected
                ? "border-[#0261F3] bg-blue-50"
                : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
            }`}
          >
            <span
              className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition ${
                selected
                  ? "border-[#0261F3] bg-[#0261F3] text-white"
                  : "border-slate-200 bg-white"
              }`}
            >
              {selected && <Check size={14} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">{svc.name}</p>
              {svc.description && (
                <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                  {svc.description}
                </p>
              )}
            </div>
            <span className="shrink-0 text-sm font-bold tabular-nums text-slate-700">
              {Number(svc.price).toLocaleString()} MMK
            </span>
          </button>
        );
      })}
      <p className="pt-2 text-sm text-slate-500">
        These are optional non-repair services and can all be left unchecked.
      </p>
    </div>
  );
}

/* ── Step 7: Review ── */
function ReviewStep({ state, selectedVehicle }) {
  const selectedServiceNames = state.availableServicesList
    .filter((s) => state.selectedServiceIds.includes(s.id))
    .map((s) => s.name);

  const rows = [
    {
      label: "Vehicle",
      value: selectedVehicle
        ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} · ${selectedVehicle.nickname}`
        : "None",
    },
    { label: "Problem", value: state.problem },
    {
      label: "Photos",
      value: state.media.length
        ? `${state.media.length} photo(s) attached`
        : "None",
    },
    { label: "Preferred Date", value: state.date },
    { label: "Time Slot", value: state.slot },
    { label: "Handover method", value: state.handover },
    ...(state.handover === "Pickup"
      ? [{ label: "Pickup Location", value: state.pickupLocation }]
      : []),
    {
      label: "Additional Services",
      value: selectedServiceNames.length
        ? selectedServiceNames.join(", ")
        : "None",
    },
  ];
  return (
    <div className="divide-y divide-slate-100 rounded-2xl border border-slate-100">
      {rows.map((row) => (
        <div
          key={row.label}
          className="grid gap-1 px-4 py-4 sm:grid-cols-[170px_1fr] sm:gap-5"
        >
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-slate-400">
            {row.label}
          </span>
          <span className="text-sm font-semibold leading-6 text-slate-800">
            {row.value}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Step 8: Submit ── */
function SubmitStep() {
  return (
    <div className="flex min-h-72 flex-col items-center justify-center text-center">
      <span className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
        <PackageCheck size={38} />
      </span>
      <h3 className="mt-6 text-2xl font-bold text-slate-950">
        Ready to Submit
      </h3>
      <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">
        Click submit to send your service request. The service center will
        review it and confirm your appointment.
      </p>
    </div>
  );
}

/* ── Request Rail (sidebar) ── */
function RequestRail({ state, selectedVehicle }) {
  return (
    <aside className="hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:block">
      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.13em] text-slate-400">
        <CircleHelp size={15} />
        Request snapshot
      </div>
      {selectedVehicle ? (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <CarFront size={19} className="text-blue-600" />
          <p className="mt-3 text-sm font-bold text-slate-900">
            {selectedVehicle.nickname}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {selectedVehicle.year} {selectedVehicle.make}{" "}
            {selectedVehicle.model}
          </p>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm text-slate-400">
          Vehicle not selected yet
        </div>
      )}
      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-500">Problem</span>
          <span
            className={`text-right font-bold ${state.problem ? "text-slate-800" : "text-slate-300"}`}
          >
            {state.problem ? "Added" : "Waiting"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-500">Preferred date</span>
          <span
            className={`text-right font-bold ${state.date ? "text-slate-800" : "text-slate-300"}`}
          >
            {state.date || "Waiting"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-500">Time slot</span>
          <div className="text-right">
            <span
              className={`font-bold ${
                state.holdExpired
                  ? "text-amber-600 line-through"
                  : state.slot
                    ? "text-slate-800"
                    : "text-slate-300"
              }`}
            >
              {state.slot || (state.holdExpired ? "Expired" : "Waiting")}
            </span>
            {state.slot && state.secondsLeft > 0 && !state.holdExpired && (
              <span className="block text-[10px] font-semibold text-blue-600">
                ⏱ {Math.floor(state.secondsLeft / 60)}:
                {String(state.secondsLeft % 60).padStart(2, "0")}
              </span>
            )}
            {state.holdExpired && (
              <span className="block text-[10px] font-bold text-amber-600">
                Hold expired
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 text-xs">
          <span className="font-semibold text-slate-500">Handover</span>
          <span className="text-right font-bold text-slate-800">
            {state.handover}
          </span>
        </div>
      </div>

      {state.holdExpired && (
        <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-xs font-semibold text-amber-800">
          <AlertCircle size={15} className="mb-1 inline text-amber-600" /> Slot
          hold expired. Please re-select your slot when continuing.
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-700">
        <BatteryCharging size={18} className="mb-2" />
        Your details stay in this draft while you move through the steps.
      </div>
    </aside>
  );
}

/* ── Submitted View ── */
function SubmittedView({ request, onStartNew }) {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-xl items-center justify-center">
      <div className="w-full rounded-3xl border border-emerald-200 bg-white p-8 text-center shadow-xl shadow-emerald-900/5 sm:p-12">
        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 size={42} />
        </span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600">
          Request received
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Your service request is in.
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-500">
          The service center will review your request and confirm the
          appointment.
        </p>
        <div className="mt-7 rounded-2xl bg-slate-50 p-4 text-left">
          <div className="flex justify-between gap-4 text-sm">
            <span className="font-semibold text-slate-500">Status</span>
            <span className="font-bold text-emerald-700">{request.status}</span>
          </div>
          <div className="mt-3 flex justify-between gap-4 text-sm">
            <span className="font-semibold text-slate-500">Appointment</span>
            <span className="font-bold text-slate-800">
              {request.preferredDate} at {request.timeSlot}
            </span>
          </div>
          {request.photoCount > 0 && (
            <div className="mt-3 flex justify-between gap-4 text-sm">
              <span className="font-semibold text-slate-500">Photos</span>
              <span className="font-bold text-slate-800">
                {request.photoCount} attached
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onStartNew}
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-5 py-3 text-sm font-bold text-white"
        >
          <RefreshCw size={17} />
          Create another request
        </button>
      </div>
    </div>
  );
}

export default ServiceRequestPage;
