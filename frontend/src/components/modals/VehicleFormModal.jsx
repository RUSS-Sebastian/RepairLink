import { useEffect, useState } from "react";
import { X, CarFront, LoaderCircle, CheckCircle2 } from "lucide-react";
import { useVehicles } from "../../context/VehicleContext";

const emptyForm = {
  nickname: "",
  year: "",
  make: "",
  model: "",
  vehicleType: "NORMAL_CAR",
  fuelType: "PETROL",
  transmission: "AUTOMATIC",
  color: "",
  licensePlate: "",
  mileage: "",
  mileageUnit: "mi",
};

const currentYear = new Date().getFullYear();

function VehicleFormModal({ vehicle, onClose }) {
  const { addVehicle, updateVehicle } = useVehicles();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = Boolean(vehicle);

  useEffect(() => {
    if (vehicle) {
      const vehicleType = vehicle.vehicleType || vehicle.type || "NORMAL_CAR";

      setForm({
        nickname: vehicle.nickname || "",
        year: vehicle.year || "",
        make: vehicle.make || "",
        model: vehicle.model || "",
        vehicleType,
        fuelType: vehicleType === "EV" ? null : vehicle.fuelType || "PETROL",
        transmission:
          vehicleType === "EV" ? null : vehicle.transmission || "AUTOMATIC",
        color: vehicle.color || "",
        licensePlate: vehicle.licensePlate || "",
        mileage: vehicle.mileage || "",
        mileageUnit: vehicle.mileageUnit || "mi",
      });
    } else {
      setForm(emptyForm);
    }
  }, [vehicle]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    const nextValue =
      name === "licensePlate"
        ? value
            .toUpperCase()
            .replace(/[^A-Z0-9-]/g, "")
            .slice(0, 8)
        : value;

    setForm((current) => ({
      ...current,
      [name]: nextValue,
      ...(name === "vehicleType" && value === "EV"
        ? { fuelType: null, transmission: null }
        : name === "vehicleType" && value === "NORMAL_CAR"
          ? {
              fuelType: current.fuelType || "PETROL",
              transmission: current.transmission || "AUTOMATIC",
            }
          : {}),
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");
    setSuccess("");

    if (
      !form.year ||
      !form.make ||
      !form.model ||
      !form.color ||
      !form.licensePlate
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (!/^[A-Z]{3}-\d{4}$/.test(form.licensePlate)) {
      setError("License plate must use the format ABC-1234 in uppercase.");
      return;
    }

    const vehicleYear = Number(form.year);
    if (vehicleYear < 1900 || vehicleYear > currentYear) {
      setError(`Vehicle year must be between 1900 and ${currentYear}.`);
      return;
    }

    if (
      form.vehicleType === "NORMAL_CAR" &&
      (!form.fuelType || !form.transmission)
    ) {
      setError("Fuel type and transmission are required for a normal car.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        await updateVehicle(vehicle.id, buildUpdatePayload(vehicle, form));
      } else {
        await addVehicle(form);
      }

      setSuccess(
        isEditing
          ? "Vehicle updated successfully."
          : "Vehicle added successfully.",
      );
    } catch (requestError) {
      setError(requestError.message || "Unable to save vehicle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (!isSubmitting && event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CarFront size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit Vehicle" : "Add Vehicle"}
              </h2>

              <p className="text-sm text-slate-500">
                {isEditing
                  ? "Update your vehicle information."
                  : "Add a vehicle to your RepairLink account."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X size={21} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {success && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              {error}
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            {/* Nickname */}
            <Field
              label="Vehicle Nickname"
              name="nickname"
              value={form.nickname}
              onChange={handleChange}
              placeholder="e.g. Daily Driver"
            />

            {/* Year */}
            <Field
              label="Year"
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              placeholder={String(currentYear)}
              min="1900"
              max={currentYear}
              required
            />

            {/* Make */}
            <Field
              label="Make"
              name="make"
              value={form.make}
              onChange={handleChange}
              placeholder="e.g. Toyota"
              required
            />

            {/* Model */}
            <Field
              label="Model"
              name="model"
              value={form.model}
              onChange={handleChange}
              placeholder="e.g. Corolla"
              required
            />

            {/* Vehicle type */}
            <SelectField
              label="Vehicle Type"
              name="vehicleType"
              value={form.vehicleType}
              onChange={handleChange}
              options={[
                { value: "NORMAL_CAR", label: "Normal Car" },
                { value: "EV", label: "Electric Vehicle" },
              ]}
            />

            {form.vehicleType === "EV" ? (
              <div className="sm:col-span-2 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm leading-6 text-blue-800">
                Fuel type and transmission are not required for electric
                vehicles, so these fields are hidden.
              </div>
            ) : (
              <>
                <SelectField
                  label="Fuel Type"
                  name="fuelType"
                  value={form.fuelType}
                  onChange={handleChange}
                  options={[
                    { value: "PETROL", label: "Petrol" },
                    { value: "DIESEL", label: "Diesel" },
                    { value: "HYBRID", label: "Hybrid" },
                    { value: "PLUG_IN_HYBRID", label: "Plug-in Hybrid" },
                    { value: "CNG", label: "CNG" },
                    { value: "LPG", label: "LPG" },
                    {
                      value: "HYDROGEN_FUEL_CELL",
                      label: "Hydrogen Fuel Cell",
                    },
                  ]}
                />

                <SelectField
                  label="Transmission"
                  name="transmission"
                  value={form.transmission}
                  onChange={handleChange}
                  options={[
                    { value: "MANUAL", label: "Manual" },
                    { value: "AUTOMATIC", label: "Automatic" },
                    { value: "CVT", label: "CVT" },
                    { value: "DCT", label: "DCT" },
                    { value: "AMT", label: "AMT" },
                    { value: "E_CVT", label: "E-CVT" },
                  ]}
                />
              </>
            )}

            {/* Color */}
            <Field
              label="Color"
              name="color"
              value={form.color}
              onChange={handleChange}
              placeholder="e.g. Silver"
              required
            />

            {/* License Plate */}
            <Field
              label="License Plate"
              name="licensePlate"
              value={form.licensePlate}
              onChange={handleChange}
              placeholder="ABC-1234"
              required
              pattern="[A-Z]{3}-[0-9]{4}"
              title="Use 3 uppercase letters, a hyphen, and 4 numbers (ABC-1234)."
              maxLength={8}
            />

            {/* Mileage */}
            <Field
              label="Mileage"
              name="mileage"
              type="number"
              value={form.mileage}
              onChange={handleChange}
              placeholder="0"
              min="0"
            />

            {/* Mileage unit */}
            <SelectField
              label="Mileage Unit"
              name="mileageUnit"
              value={form.mileageUnit}
              onChange={handleChange}
              options={[
                { value: "mi", label: "mi" },
                { value: "km", label: "km" },
              ]}
            />
          </div>

          {/* Footer */}
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting || Boolean(success)}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0261F3] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0256D6] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting && (
                <LoaderCircle size={18} className="animate-spin" />
              )}
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Adding..."
                : success
                  ? "Saved"
                  : isEditing
                    ? "Save Changes"
                    : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function buildUpdatePayload(vehicle, form) {
  const originalVehicleType =
    vehicle.vehicleType || vehicle.type || "NORMAL_CAR";
  const originalMileageUnit = (vehicle.mileageUnit || "mi").toUpperCase();
  const fields = {
    nickname: form.nickname,
    make: form.make,
    model: form.model,
    year: Number(form.year),
    licensePlate: form.licensePlate,
    vehicleType: form.vehicleType,
    fuelType: form.vehicleType === "EV" ? null : form.fuelType,
    transmission: form.vehicleType === "EV" ? null : form.transmission,
    color: form.color,
    currentMileage: Number(form.mileage) || 0,
    mileageUnit: form.mileageUnit.toUpperCase(),
  };

  const originalValues = {
    nickname: vehicle.nickname || "",
    make: vehicle.make,
    model: vehicle.model,
    year: Number(vehicle.year),
    licensePlate: vehicle.licensePlate,
    vehicleType: originalVehicleType,
    fuelType: originalVehicleType === "EV" ? null : vehicle.fuelType,
    transmission: originalVehicleType === "EV" ? null : vehicle.transmission,
    color: vehicle.color,
    currentMileage: Number(vehicle.mileage) || 0,
    mileageUnit: originalMileageUnit,
  };

  return Object.fromEntries(
    Object.entries(fields).filter(
      ([field, value]) => value !== originalValues[field],
    ),
  );
}

function Field({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  min,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </div>
  );
}

function SelectField({ label, name, value, onChange, options }) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default VehicleFormModal;
