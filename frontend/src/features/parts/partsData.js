// Frontend-only mock data and helpers for the Admin > Parts catalog.
// No backend/API calls — everything here operates on local React state.

export const PART_NUMBER_PATTERN = /^[A-Z]{2,4}-[A-Z]{2}-[A-Z0-9]{4,6}$/;
export const PART_NUMBER_HINT =
  "Use the format ABC-DE-1234 (e.g., BSH-BP-0915).";

export const LOW_STOCK_THRESHOLD = 15;

export const STATUS_OPTIONS = [
  "Active",
  "Inactive",
  "Archived",
  "Out of Stock",
];
export const FORM_STATUS_OPTIONS = ["Active", "Inactive"];

export const STATUS_FILTER_OPTIONS = [
  "All",
  "Active",
  "Inactive",
  "Out of Stock",
  "Archived",
];

export const initialParts = [
  {
    id: "part-seed-1",
    name: "Brake Pad Set (Front)",
    brand: "Bosch",
    partNumber: "BSH-BP-0915",
    description: "Front axle ceramic brake pad set for sedans.",
    source: "Bosch Direct",
    warranty: 12,
    price: 64.9,
    stock: 48,
    status: "Active",
  },
  {
    id: "part-seed-2",
    name: "Brake Pad Set (Rear)",
    brand: "Brembo",
    partNumber: "BMM-BP-2280",
    description: "Rear performance brake pad set with wear sensor.",
    source: "Brembo Distribution",
    warranty: 12,
    price: 79.5,
    stock: 6,
    status: "Active",
  },
  {
    id: "part-seed-3",
    name: "Oil Filter",
    brand: "Mann-Filter",
    partNumber: "MAN-OF-5180",
    description: "High-flow spin-on oil filter for gasoline engines.",
    source: "Mann Filter Supply",
    warranty: 6,
    price: 12.9,
    stock: 120,
    status: "Active",
  },
  {
    id: "part-seed-4",
    name: "Car Battery (AGM 49Ah)",
    brand: "DieHard",
    partNumber: "DH-BT-AGM49",
    description: "Maintenance-free AGM starter battery, 49Ah.",
    source: "DieHard Batteries",
    warranty: 24,
    price: 210,
    stock: 0,
    status: "Active",
  },
  {
    id: "part-seed-5",
    name: "Spark Plug Set",
    brand: "NGK",
    partNumber: "NGK-SP-9814",
    description: "Iridium spark plug set, pack of 4.",
    source: "NGK Direct",
    warranty: 9,
    price: 8.5,
    stock: 9,
    status: "Active",
  },
  {
    id: "part-seed-6",
    name: "Brake Pad Set (OEM)",
    brand: "OEM",
    partNumber: "OEM-BP-0001",
    description: "OEM-equivalent front brake pad set.",
    source: "OEM Parts Co.",
    warranty: 12,
    price: 55,
    stock: 5,
    status: "Active",
  },
  {
    id: "part-seed-7",
    name: "Air Filter",
    brand: "Bosch",
    partNumber: "BSH-AF-3310",
    description: "Panel air filter for improved engine airflow.",
    source: "Bosch Direct",
    warranty: 12,
    price: 15.9,
    stock: 60,
    status: "Active",
  },
  {
    id: "part-seed-8",
    name: "Cabin Air Filter",
    brand: "Mann-Filter",
    partNumber: "MAN-CF-1120",
    description: "Activated carbon cabin air filter.",
    source: "Mann Filter Supply",
    warranty: 6,
    price: 9.9,
    stock: 35,
    status: "Inactive",
  },
  {
    id: "part-seed-9",
    name: "Timing Belt Kit",
    brand: "Gates",
    partNumber: "GAT-TB-7742",
    description: "Rubber timing belt kit with tensioner.",
    source: "Gates Supply",
    warranty: 18,
    price: 45.9,
    stock: 20,
    status: "Archived",
  },
];

/**
 * A part's stored `status` can be overridden by stock reality: a part with
 * 0 stock always reads as "Out of Stock" unless it has been deliberately
 * Archived or Inactive (an administrative state that stock shouldn't override).
 */
export function getEffectiveStatus(part) {
  if (part.effectiveStatus) {
    return part.effectiveStatus;
  }
  if (part.status === "Archived" || part.status === "Inactive") {
    return part.status;
  }

  if (part.stock === 0) {
    return "Out of Stock";
  }

  return part.status === "Out of Stock" ? "Out of Stock" : "Active";
}

export function isLowStock(part) {
  return (
    getEffectiveStatus(part) === "Active" &&
    part.stock > 0 &&
    part.stock <= LOW_STOCK_THRESHOLD
  );
}

export function formatPrice(price) {
  const value = Number(price);

  if (Number.isNaN(value)) {
    return "—";
  }

  const trimmed = Number(value.toFixed(2)).toString();
  return `${trimmed}k MMK`;
}

export function formatWarranty(months) {
  const value = Number(months);

  if (Number.isNaN(value)) {
    return "—";
  }

  return `${value} ${value === 1 ? "month" : "months"} warranty`;
}

export function formatStock(stock) {
  return Number(stock).toLocaleString();
}

/**
 * Validates a Create/Edit Part form. `editingId` should be the id of the
 * part currently being edited (so it is excluded from the duplicate check),
 * or null when creating a new part.
 */
export function validatePartForm(values, { parts, editingId }) {
  const errors = {};

  if (!values.name.trim()) {
    errors.name = "Part name is required.";
  } else if (values.name.trim().length > 150) {
    errors.name = "Part name must be 150 characters or fewer.";
  }

  if (!values.brand.trim()) {
    errors.brand = "Brand is required.";
  } else if (values.brand.trim().length > 100) {
    errors.brand = "Brand must be 100 characters or fewer.";
  }

  const partNumber = values.partNumber.trim().toUpperCase();

  if (!partNumber) {
    errors.partNumber = "Part number is required.";
  } else if (!PART_NUMBER_PATTERN.test(partNumber)) {
    errors.partNumber = PART_NUMBER_HINT;
  } else if (
    parts.some(
      (part) =>
        part.id !== editingId && part.partNumber.toUpperCase() === partNumber,
    )
  ) {
    errors.partNumber = "This part number is already in use.";
  }

  if (values.description.length > 1000) {
    errors.description = "Description must be 1000 characters or fewer.";
  }

  if (values.source.length > 150) {
    errors.source = "Source must be 150 characters or fewer.";
  }

  if (values.warranty === "" || values.warranty === null) {
    errors.warranty = "Warranty is required.";
  } else {
    const warrantyNum = Number(values.warranty);

    if (!Number.isInteger(warrantyNum) || warrantyNum < 0) {
      errors.warranty =
        "Warranty must be a whole number of months (0 or more).";
    }
  }

  if (values.price === "" || values.price === null) {
    errors.price = "Price is required.";
  } else {
    const priceNum = Number(values.price);

    if (Number.isNaN(priceNum) || priceNum <= 0) {
      errors.price = "Price must be a positive number.";
    }
  }

  if (values.stock === "" || values.stock === null) {
    errors.stock = "Stock is required.";
  } else {
    const stockNum = Number(values.stock);

    if (!Number.isInteger(stockNum) || stockNum < 0) {
      errors.stock = "Stock must be a whole number (0 or more).";
    }
  }

  if (values.reorderLevel === "" || values.reorderLevel === null) {
    errors.reorderLevel = "Reorder level is required.";
  } else {
    const reorderLevelNum = Number(values.reorderLevel);

    if (!Number.isInteger(reorderLevelNum) || reorderLevelNum < 0) {
      errors.reorderLevel = "Reorder level must be a whole number (0 or more).";
    }
  }

  if (!values.status) {
    errors.status = "Status is required.";
  } else if (!FORM_STATUS_OPTIONS.includes(values.status)) {
    errors.status = "Status must be Active or Inactive.";
  }

  return errors;
}
