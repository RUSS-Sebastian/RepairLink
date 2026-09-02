import { useEffect, useState } from "react";
import { X, CarFront } from "lucide-react";
import { useVehicles } from "../../context/VehicleContext";

const emptyForm = {
  nickname: "",
  year: "",
  make: "",
  model: "",
  type: "Normal Car",
  fuelType: "Petrol",
  transmission: "Automatic",
  color: "",
  licensePlate: "",
  mileage: "",
  mileageUnit: "mi",
};

function VehicleFormModal({ vehicle, onClose }) {
  const { addVehicle, updateVehicle } = useVehicles();

  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  const isEditing = Boolean(vehicle);

  useEffect(() => {
    if (vehicle) {
      setForm({
        nickname: vehicle.nickname || "",
        year: vehicle.year || "",
        make: vehicle.make || "",
        model: vehicle.model || "",
        type: vehicle.type || "Normal Car",
        fuelType: vehicle.fuelType || "Petrol",
        transmission: vehicle.transmission || "Automatic",
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

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    if (
      !form.nickname ||
      !form.year ||
      !form.make ||
      !form.model ||
      !form.color ||
      !form.licensePlate
    ) {
      setError("Please complete all required fields.");
      return;
    }

    if (isEditing) {
      updateVehicle(vehicle.id, form);
    } else {
      addVehicle(form);
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
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
            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close"
          >
            <X size={21} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
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
              required
            />

            {/* Year */}
            <Field
              label="Year"
              name="year"
              type="number"
              value={form.year}
              onChange={handleChange}
              placeholder="2024"
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
              name="type"
              value={form.type}
              onChange={handleChange}
              options={[
                "Normal Car",
                "EV",
                "SUV",
                "Truck",
                "Van",
                "Motorcycle",
              ]}
            />

            {/* Fuel */}
            <SelectField
              label="Fuel Type"
              name="fuelType"
              value={form.fuelType}
              onChange={handleChange}
              options={[
                "Petrol",
                "Diesel",
                "Electric",
                "Hybrid",
              ]}
            />

            {/* Transmission */}
            <SelectField
              label="Transmission"
              name="transmission"
              value={form.transmission}
              onChange={handleChange}
              options={[
                "Automatic",
                "Manual",
                "CVT",
              ]}
            />

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
              placeholder="e.g. ABC-1234"
              required
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
              options={["mi", "km"]}
            />
          </div>

          {/* Footer */}
          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              {isEditing ? "Save Changes" : "Add Vehicle"}
            </button>
          </div>
        </form>
      </div>
    </div>
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

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
}) {
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
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}

export default VehicleFormModal;