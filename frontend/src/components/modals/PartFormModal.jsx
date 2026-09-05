import { useEffect, useState } from "react";
import { X, PackagePlus, LoaderCircle } from "lucide-react";

import Button from "../common/Button";
import FormInput from "../forms/FormInput";
import {
  FORM_STATUS_OPTIONS,
  validatePartForm,
} from "../../features/parts/partsData";

const emptyForm = {
  name: "",
  brand: "",
  partNumber: "",
  description: "",
  source: "",
  warranty: "",
  price: "",
  stock: "",
  reorderLevel: "15",
  status: "Active",
};

function PartFormModal({ mode, part, parts, onClose, onCreate, onUpdate }) {
  const isEditing = mode === "edit";

  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isEditing && part) {
      setForm({
        name: part.name || "",
        brand: part.brand || "",
        partNumber: part.partNumber || "",
        description: part.description || "",
        source: part.source || "",
        warranty:
          part.warranty === undefined || part.warranty === null
            ? ""
            : String(part.warranty),
        price:
          part.price === undefined || part.price === null
            ? ""
            : String(part.price),
        stock:
          part.stock === undefined || part.stock === null
            ? ""
            : String(part.stock),
        reorderLevel:
          part.reorderLevel === undefined || part.reorderLevel === null
            ? "15"
            : String(part.reorderLevel),
        status: part.status || "Active",
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
  }, [isEditing, part]);

  const updateField = (name, value) => {
    setForm((current) => ({ ...current, [name]: value }));

    if (errors[name]) {
      setErrors((current) => ({ ...current, [name]: "" }));
    }
  };

  const handleTextChange = (event) => {
    updateField(event.target.name, event.target.value);
  };

  const handlePartNumberChange = (event) => {
    const sanitized = event.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9-]/g, "");

    updateField("partNumber", sanitized);
  };

  const handleIntegerChange = (event) => {
    const sanitized = event.target.value.replace(/[^0-9]/g, "");
    updateField(event.target.name, sanitized);
  };

  const handlePriceChange = (event) => {
    let sanitized = event.target.value.replace(/[^0-9.]/g, "");
    const firstDotIndex = sanitized.indexOf(".");

    if (firstDotIndex !== -1) {
      sanitized =
        sanitized.slice(0, firstDotIndex + 1) +
        sanitized.slice(firstDotIndex + 1).replace(/\./g, "");
    }

    updateField("price", sanitized);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const validationErrors = validatePartForm(form, {
      parts,
      editingId: isEditing ? part.id : null,
    });

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    const values = {
      name: form.name.trim(),
      brand: form.brand.trim(),
      partNumber: form.partNumber.trim().toUpperCase(),
      description: form.description.trim(),
      source: form.source.trim(),
      warranty: Number(form.warranty),
      price: Number(form.price),
      stock: Number(form.stock),
      reorderLevel: Number(form.reorderLevel),
      status: form.status,
    };

    try {
      if (isEditing) {
        await onUpdate(values);
      } else {
        await onCreate(values);
      }
    } catch (error) {
      setErrors({ form: error.message });
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
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-slate-200 bg-white px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <PackagePlus size={22} />
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {isEditing ? "Edit part" : "Create part"}
              </h2>
              <p className="text-sm text-slate-500">
                Duplicate part numbers and negative prices are rejected.
              </p>
            </div>
          </div>

          {errors.form && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              {errors.form}
            </div>
          )}

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

        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormSectionTitle
              title="Basic information"
              description="Identify the part clearly for your catalog."
            />
            <FormInput
              label="Part name"
              name="name"
              value={form.name}
              onChange={handleTextChange}
              placeholder="e.g. Brake Pad Set"
              error={errors.name}
              maxLength={150}
              required
            />

            <FormInput
              label="Brand"
              name="brand"
              value={form.brand}
              onChange={handleTextChange}
              placeholder="e.g. Bosch"
              error={errors.brand}
              maxLength={100}
              required
            />

            <FormInput
              label="Part number"
              name="partNumber"
              value={form.partNumber}
              onChange={handlePartNumberChange}
              placeholder="ABC-DE-1234"
              error={errors.partNumber}
              maxLength={30}
              helperText="Format: ABC-DE-1234"
              required
            />

            <SelectField
              label="Status"
              name="status"
              value={form.status}
              onChange={handleTextChange}
              options={FORM_STATUS_OPTIONS}
              helperText="Archived parts are handled separately."
            />

            <FormSectionTitle
              title="Details"
              description="Add optional context for staff and suppliers."
            />
            <div className="sm:col-span-2">
              <TextAreaField
                label="Description"
                name="description"
                value={form.description}
                onChange={handleTextChange}
                placeholder="Short description of the part"
                error={errors.description}
                maxLength={1000}
              />
            </div>

            <FormInput
              label="Source"
              name="source"
              value={form.source}
              onChange={handleTextChange}
              placeholder="e.g. Bosch Direct"
              error={errors.source}
              maxLength={150}
              helperText="Optional supplier or source."
            />

            <FormSectionTitle
              title="Commercial and inventory"
              description="Set pricing, warranty, and starting availability."
            />
            <FormInput
              label="Warranty (months)"
              name="warranty"
              value={form.warranty}
              onChange={handleIntegerChange}
              placeholder="e.g. 12"
              error={errors.warranty}
              required
            />

            <FormInput
              label="Price (MMK, thousands)"
              name="price"
              value={form.price}
              onChange={handlePriceChange}
              placeholder="e.g. 24.9"
              error={errors.price}
              helperText="Displayed as thousands of MMK, e.g. 69k MMK."
              required
            />

            <FormInput
              label="Initial stock quantity"
              name="stock"
              value={form.stock}
              onChange={handleIntegerChange}
              placeholder="e.g. 48"
              error={errors.stock}
              helperText="Enter 0 if this part is not currently in stock."
              required
            />

            <FormInput
              label="Reorder level"
              name="reorderLevel"
              value={form.reorderLevel}
              onChange={handleIntegerChange}
              placeholder="e.g. 15"
              error={errors.reorderLevel}
              helperText="Show a low-stock warning at this quantity."
              required
            />
          </div>

          <div className="mt-7 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
            <Button
              variant="secondary"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <LoaderCircle size={16} className="mr-2 animate-spin" />
              )}
              {isSubmitting
                ? isEditing
                  ? "Saving..."
                  : "Creating..."
                : isEditing
                  ? "Save part"
                  : "Create part"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function FormSectionTitle({ title, description }) {
  return (
    <div className="sm:col-span-2 border-b border-slate-100 pb-1">
      <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-500">{description}</p>
    </div>
  );
}

function SelectField({ label, name, value, onChange, options, helperText }) {
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
      {helperText && (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  );
}

function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  error,
  maxLength,
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-4 focus:ring-blue-500/10 ${
          error
            ? "border-red-400 focus:border-red-500"
            : "border-slate-200 focus:border-blue-500"
        }`}
        rows={3}
      />
      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

export default PartFormModal;
