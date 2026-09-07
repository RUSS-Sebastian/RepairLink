import { useEffect, useMemo, useReducer, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BatteryCharging,
  CalendarDays,
  CarFront,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  FileImage,
  FileVideo,
  MapPin,
  PackageCheck,
  Plus,
  RefreshCw,
  Sparkles,
  Upload,
  X,
} from "lucide-react";

import {
  ADDITIONAL_SERVICES,
  createInitialState,
  createMockMedia,
  serviceRequestReducer,
  STEPS,
  TIME_SLOTS,
} from "../../features/serviceRequests/serviceRequestState";
import { useVehicles } from "../../context/VehicleContext";

const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

function ServiceRequestPage() {
  const {
    vehicles,
    isLoading: vehiclesLoading,
    error: vehiclesError,
  } = useVehicles();
  const [state, dispatch] = useReducer(
    serviceRequestReducer,
    [],
    createInitialState,
  );
  const [mediaSequence, setMediaSequence] = useState(1);

  useEffect(() => {
    dispatch({ type: "SET_VEHICLES", vehicles });
  }, [vehicles]);

  useEffect(() => {
    if (!state.holdUntil) return undefined;
    const timer = window.setInterval(
      () => dispatch({ type: "TICK", now: Date.now() }),
      1000,
    );
    return () => window.clearInterval(timer);
  }, [state.holdUntil]);

  const selectedVehicle = state.vehicles.find(
    (vehicle) => vehicle.id === state.vehicleId,
  );
  const step = STEPS[state.step];
  const uploadedMediaCount = state.media.filter(
    (file) => file.status === "Uploaded",
  ).length;

  const update = (field, value) => dispatch({ type: "UPDATE", field, value });
  const goNext = () => dispatch({ type: "NEXT", now: Date.now() });
  const goBack = () => dispatch({ type: "BACK" });
  const submit = () =>
    dispatch({
      type: "SUBMIT",
      now: Date.now(),
      random: Math.random(),
      id: `request-${Date.now()}`,
    });

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
              mediaSequence={mediaSequence}
              setMediaSequence={setMediaSequence}
              minDate={localDate}
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
                className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700"
              >
                {state.step === STEPS.length - 1 ? (
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
    Upload,
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
    <div
      role="alert"
      className="mb-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-700"
    >
      <AlertCircle className="mt-0.5 shrink-0" size={18} />
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
  mediaSequence,
  setMediaSequence,
  minDate,
}) {
  switch (state.step) {
    case 0:
      return (
        <VehicleStep
          state={state}
          dispatch={dispatch}
          selectedVehicle={selectedVehicle}
          isLoading={vehiclesLoading}
          loadError={vehiclesError}
        />
      );
    case 1:
      return <ProblemStep state={state} dispatch={dispatch} />;
    case 2:
      return (
        <MediaStep
          state={state}
          dispatch={dispatch}
          mediaSequence={mediaSequence}
          setMediaSequence={setMediaSequence}
        />
      );
    case 3:
      return <DateStep state={state} dispatch={dispatch} minDate={minDate} />;
    case 4:
      return <TimeStep state={state} dispatch={dispatch} />;
    case 5:
      return <HandoverStep state={state} dispatch={dispatch} />;
    case 6:
      return <ServicesStep state={state} dispatch={dispatch} />;
    case 7:
      return <ReviewStep state={state} selectedVehicle={selectedVehicle} />;
    default:
      return <SubmitStep />;
  }
}

function VehicleStep({ state, dispatch, isLoading, loadError }) {
  if (isLoading)
    return (
      <div className="flex min-h-72 items-center justify-center text-sm font-semibold text-slate-500">
        Loading your vehicles...
      </div>
    );

  if (loadError)
    return (
      <div className="flex min-h-72 flex-col items-center justify-center text-center">
        <AlertBanner message={loadError} />
        <p className="text-sm text-slate-500">
          We could not load your vehicles for this request.
        </p>
      </div>
    );

  if (!state.vehicles.length)
    return (
      <div className="flex min-h-72 flex-col items-center justify-center text-center">
        <CarFront size={42} className="text-slate-300" />
        <h3 className="mt-4 text-lg font-bold text-slate-900">
          No vehicles available
        </h3>
        <p className="mt-1 text-sm text-slate-500">
          Add a vehicle before creating a service request.
        </p>
        <Link
          to="/my-vehicles"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-4 py-3 text-sm font-bold text-white"
        >
          <Plus size={16} />
          Add a vehicle
        </Link>
      </div>
    );
  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-blue-600">
            Your garage
          </p>
          <h3 className="mt-1 text-lg font-bold text-slate-950">
            Pick the vehicle for this visit
          </h3>
        </div>
        <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500">
          {state.vehicles.length}{" "}
          {state.vehicles.length === 1 ? "vehicle" : "vehicles"}
        </span>
      </div>

      <div className="-mx-1 flex gap-4 overflow-x-auto px-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {state.vehicles.map((vehicle) => {
          const selected = state.vehicleId === vehicle.id;
          const electric = vehicle.vehicleType === "EV";
          const vehicleType = electric
            ? "Electric vehicle"
            : "Personal vehicle";
          return (
            <button
              key={vehicle.id}
              type="button"
              aria-pressed={selected}
              onClick={() =>
                dispatch({
                  type: "UPDATE",
                  field: "vehicleId",
                  value: vehicle.id,
                })
              }
              className={`group relative min-h-[238px] w-[min(100%,22rem)] shrink-0 overflow-hidden rounded-[1.35rem] border text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-500/20 ${selected ? "border-blue-500 bg-slate-950 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500 ring-offset-2" : "border-slate-800 bg-slate-950 hover:border-blue-400"}`}
            >
              <div
                className={`absolute -right-12 -top-14 h-40 w-40 rounded-full blur-2xl ${electric ? "bg-violet-500/25" : "bg-blue-500/25"}`}
              />
              <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-cyan-400/10 blur-2xl" />
              <div className="relative flex h-full flex-col p-5 text-white">
                <div className="flex items-start justify-between">
                  <span
                    className={`flex h-12 w-12 items-center justify-center rounded-2xl ${electric ? "bg-violet-400/20 text-violet-200" : "bg-blue-400/20 text-blue-200"}`}
                  >
                    <CarFront size={25} />
                  </span>
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full transition ${selected ? "bg-blue-500 text-white" : "bg-white/10 text-transparent group-hover:text-white/60"}`}
                  >
                    <Check size={16} />
                  </span>
                </div>

                <div className="mt-auto">
                  <p className="truncate text-xl font-bold tracking-tight">
                    {vehicle.nickname || "My vehicle"}
                  </p>
                  <p className="mt-1 truncate text-sm text-slate-300">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </p>
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-3 text-xs">
                    <span className="truncate font-semibold text-slate-300">
                      {vehicle.licensePlate || "Plate not added"}
                    </span>
                    <span className="shrink-0 rounded-full bg-white/10 px-2.5 py-1 font-semibold text-slate-200">
                      {vehicleType}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <p className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Select a vehicle to continue with its saved details.
      </p>
    </div>
  );
}

function ProblemStep({ state, dispatch }) {
  return (
    <div>
      <textarea
        value={state.problem}
        onChange={(event) =>
          dispatch({
            type: "UPDATE",
            field: "problem",
            value: event.target.value,
          })
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

function MediaStep({ state, dispatch, mediaSequence, setMediaSequence }) {
  const addMedia = (failed) => {
    dispatch({
      type: "ADD_MEDIA",
      file: createMockMedia(mediaSequence, failed),
    });
    setMediaSequence((value) => value + 1);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => addMedia(false)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-4 py-3 text-sm font-bold text-white"
        >
          <Upload size={16} />
          Simulate Upload
        </button>
        <button
          type="button"
          onClick={() => addMedia(true)}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          <AlertCircle size={16} />
          Simulate Failure
        </button>
      </div>
      <div className="mt-5 space-y-3">
        {state.media.length ? (
          state.media.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                {file.type === "image" ? (
                  <FileImage size={21} />
                ) : (
                  <FileVideo size={21} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-800">
                  {file.filename}
                </p>
                <p className="mt-1 text-xs text-slate-500">{file.size} MB</p>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold ${file.status === "Uploaded" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}
              >
                {file.status}
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: "REMOVE_MEDIA", id: file.id })}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                aria-label={`Remove ${file.filename}`}
              >
                <X size={17} />
              </button>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center">
            <Upload size={28} className="mx-auto text-slate-300" />
            <p className="mt-3 text-sm font-bold text-slate-600">
              No media added
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Photos and videos are optional.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DateStep({ state, dispatch, minDate }) {
  return (
    <div className="max-w-md">
      <label className="block text-xs font-bold uppercase tracking-[0.13em] text-slate-500">
        Preferred service date
      </label>
      <div className="relative mt-3">
        <CalendarDays
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-blue-600"
          size={19}
        />
        <input
          type="date"
          min={minDate}
          value={state.date}
          onChange={(event) =>
            dispatch({
              type: "UPDATE",
              field: "date",
              value: event.target.value,
            })
          }
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-base font-semibold text-slate-800 outline-none focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10"
        />
      </div>
      <p className="mt-3 text-sm text-slate-500">
        Choose a day that works best. Your service center will confirm the
        appointment.
      </p>
    </div>
  );
}

function TimeStep({ state, dispatch }) {
  const unavailable = state.unavailableSlots.map((item) =>
    item.split("/").pop(),
  );
  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-500">
          Available times for {state.date}
        </p>
        <Clock3 className="text-blue-600" size={20} />
      </div>
      {state.slot && (
        <div className="mb-5 flex items-center gap-3 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-700">
          <Clock3 size={18} />
          Slot held for {Math.floor(state.secondsLeft / 60)}:
          {String(state.secondsLeft % 60).padStart(2, "0")}
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        {TIME_SLOTS.map((slot) => {
          const disabled = slot.full || unavailable.includes(slot.time);
          const selected = state.slot === slot.time;
          return (
            <button
              key={slot.time}
              type="button"
              disabled={disabled}
              onClick={() =>
                dispatch({
                  type: "SELECT_SLOT",
                  time: slot.time,
                  now: Date.now(),
                })
              }
              className={`flex items-center justify-between rounded-2xl border-2 px-4 py-4 text-left transition ${disabled ? "cursor-not-allowed border-slate-100 bg-slate-50 text-slate-300" : selected ? "border-[#0261F3] bg-blue-50 text-[#0261F3]" : "border-slate-200 hover:border-blue-300 hover:bg-blue-50/40"}`}
            >
              <span className="font-bold">{slot.time}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${disabled ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-700"}`}
              >
                {disabled ? "Full" : `${slot.spaces} spaces`}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function HandoverStep({ state, dispatch }) {
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          {
            label: "Pickup",
            subtitle: "We pick up your vehicle",
            icon: MapPin,
          },
          { label: "Drop-off", subtitle: "You bring it in", icon: CarFront },
        ].map(({ label, subtitle, icon: Icon }) => (
          <button
            key={label}
            type="button"
            onClick={() =>
              dispatch({ type: "UPDATE", field: "handover", value: label })
            }
            className={`flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition ${state.handover === label ? "border-[#0261F3] bg-blue-50" : "border-slate-200 hover:border-blue-200"}`}
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-2xl ${state.handover === label ? "bg-[#0261F3] text-white" : "bg-slate-100 text-slate-500"}`}
            >
              <Icon size={22} />
            </span>
            <span>
              <b className="block text-base text-slate-900">{label}</b>
              <small className="mt-1 block text-sm text-slate-500">
                {subtitle}
              </small>
            </span>
            {state.handover === label && (
              <Check className="ml-auto text-blue-600" size={19} />
            )}
          </button>
        ))}
      </div>
      {state.handover === "Pickup" && (
        <label className="block max-w-xl">
          <span className="text-xs font-bold uppercase tracking-[0.13em] text-slate-500">
            Pickup Location
          </span>
          <div className="relative mt-2">
            <MapPin
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              size={18}
            />
            <input
              value={state.pickupLocation}
              onChange={(event) =>
                dispatch({
                  type: "UPDATE",
                  field: "pickupLocation",
                  value: event.target.value,
                })
              }
              placeholder="Enter the pickup address"
              className="w-full rounded-2xl border border-slate-200 py-3.5 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>
        </label>
      )}
    </div>
  );
}

function ServicesStep({ state, dispatch }) {
  return (
    <div className="space-y-3">
      {ADDITIONAL_SERVICES.map((service) => {
        const checked = state.additionalServices.includes(service);
        return (
          <button
            key={service}
            type="button"
            onClick={() => dispatch({ type: "TOGGLE_SERVICE", service })}
            className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${checked ? "border-blue-200 bg-blue-50" : "border-slate-200 hover:border-blue-200"}`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-lg border-2 ${checked ? "border-[#0261F3] bg-[#0261F3] text-white" : "border-slate-300 text-transparent"}`}
            >
              <Check size={14} />
            </span>
            <span className="text-sm font-bold text-slate-800">{service}</span>
          </button>
        );
      })}
      <p className="pt-2 text-sm text-slate-500">
        These are optional non-repair services and can all be left unchecked.
      </p>
    </div>
  );
}

function ReviewStep({ state, selectedVehicle }) {
  const rows = [
    {
      label: "Vehicle",
      value: selectedVehicle
        ? `${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model} · ${selectedVehicle.nickname}`
        : "None",
    },
    { label: "Problem", value: state.problem },
    {
      label: "Media",
      value: state.media.filter((file) => file.status === "Uploaded").length
        ? `${state.media.filter((file) => file.status === "Uploaded").length} uploaded file(s)`
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
      value: state.additionalServices.length
        ? state.additionalServices.join(", ")
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
        {[
          ["Problem", state.problem ? "Added" : "Waiting"],
          ["Preferred date", state.date || "Waiting"],
          ["Time slot", state.slot || "Waiting"],
          ["Handover", state.handover],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between gap-3 text-xs"
          >
            <span className="font-semibold text-slate-500">{label}</span>
            <span
              className={`text-right font-bold ${value === "Waiting" ? "text-slate-300" : "text-slate-800"}`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-2xl border border-blue-100 bg-blue-50 p-4 text-xs leading-5 text-blue-700">
        <BatteryCharging size={18} className="mb-2" />
        Your details stay in this draft while you move through the steps.
      </div>
    </aside>
  );
}

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
