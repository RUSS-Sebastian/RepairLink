import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  CarFront,
  Pencil,
  Trash2,
  Eye,
  Gauge,
  Fuel,
  Palette,
  CreditCard,
  Menu,
} from "lucide-react";

import CustomerSidebar from "../../components/navigation/CustomerSidebar";
import VehicleFormModal from "../../components/modals/VehicleFormModal";
import DeleteVehicleModal from "../../components/modals/DeleteVehicleModal";
import { useVehicles } from "../../context/VehicleContext";

function MyVehiclesPage() {
  const { vehicles } = useVehicles();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [deletingVehicle, setDeletingVehicle] = useState(null);

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    setShowVehicleModal(true);
  };

  const handleEditVehicle = (vehicle) => {
    setEditingVehicle(vehicle);
    setShowVehicleModal(true);
  };

  const handleCloseModal = () => {
    setShowVehicleModal(false);
    setEditingVehicle(null);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <CustomerSidebar
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
        />

        {/* Main content */}
        <div className="min-w-0 flex-1">
          {/* Mobile header */}
          <div className="sticky top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white px-4 lg:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Open menu"
            >
              <Menu size={23} />
            </button>

            <div className="ml-3">
              <p className="font-bold text-slate-900">
                Repair<span className="text-blue-600">Link</span>
              </p>
            </div>
          </div>

          {/* Page content */}
          <main className="mx-auto max-w-7xl px-5 py-8 lg:px-8 lg:py-10">
            {/* Heading */}
            <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="mb-2 text-sm font-semibold text-blue-600">
                  Customer Portal
                </p>

                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  My Vehicles
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                  Manage your vehicles and keep their information up to date.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddVehicle}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                <Plus size={18} />
                Add Vehicle
              </button>
            </div>

            {/* Vehicle count */}
            <div className="mb-5 flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                {vehicles.length}{" "}
                {vehicles.length === 1 ? "vehicle" : "vehicles"}
              </p>
            </div>

            {/* Vehicle cards */}
            {vehicles.length > 0 ? (
              <div className="grid gap-6 xl:grid-cols-2">
                {vehicles.map((vehicle) => (
                  <VehicleCard
                    key={vehicle.id}
                    vehicle={vehicle}
                    onEdit={() => handleEditVehicle(vehicle)}
                    onDelete={() => setDeletingVehicle(vehicle)}
                  />
                ))}
              </div>
            ) : (
              <EmptyVehiclesState onAdd={handleAddVehicle} />
            )}
          </main>
        </div>
      </div>

      {/* Add/Edit modal */}
      {showVehicleModal && (
        <VehicleFormModal
          vehicle={editingVehicle}
          onClose={handleCloseModal}
        />
      )}

      {/* Delete modal */}
      {deletingVehicle && (
        <DeleteVehicleModal
          vehicle={deletingVehicle}
          onClose={() => setDeletingVehicle(null)}
        />
      )}
    </div>
  );
}

/* Vehicle Card */
function VehicleCard({ vehicle, onEdit, onDelete }) {
  const isElectric = vehicle.type === "EV";

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Card top */}
      <div className="flex items-start justify-between border-b border-slate-100 p-6">
        <div className="flex min-w-0 items-center gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              isElectric
                ? "bg-violet-100 text-violet-600"
                : "bg-blue-50 text-blue-600"
            }`}
          >
            <CarFront size={28} strokeWidth={1.8} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-bold text-slate-900">
                {vehicle.nickname}
              </h2>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                  isElectric
                    ? "bg-violet-100 text-violet-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {vehicle.type}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>
          </div>
        </div>
      </div>

      {/* Vehicle information */}
      <div className="grid grid-cols-2 gap-5 p-6 sm:grid-cols-4">
        <InfoItem
          icon={Palette}
          label="Color"
          value={vehicle.color}
        />

        <InfoItem
          icon={CreditCard}
          label="Plate"
          value={vehicle.licensePlate}
        />

        <InfoItem
          icon={Gauge}
          label="Mileage"
          value={`${vehicle.mileage.toLocaleString()} ${vehicle.mileageUnit}`}
        />

        <InfoItem
          icon={Fuel}
          label="Fuel"
          value={vehicle.fuelType}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 border-t border-slate-100 bg-slate-50/70 p-4">
        <Link
          to={`/customer/vehicles/${vehicle.id}`}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          <Eye size={17} />
          View Details
        </Link>

        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
        >
          <Pencil size={16} />
          Edit
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="inline-flex items-center justify-center rounded-xl border border-red-200 bg-white px-3 py-2.5 text-red-600 transition hover:bg-red-50"
          aria-label={`Delete ${vehicle.nickname}`}
        >
          <Trash2 size={17} />
        </button>
      </div>
    </article>
  );
}

/* Information item */
function InfoItem({ icon: Icon, label, value }) {
  return (
    <div>
      <div className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <Icon size={14} />
        <span>{label}</span>
      </div>

      <p className="truncate text-sm font-semibold text-slate-800">
        {value}
      </p>
    </div>
  );
}

/* Empty state */
function EmptyVehiclesState({ onAdd }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
        <CarFront size={30} />
      </div>

      <h2 className="mt-5 text-xl font-bold text-slate-900">
        No vehicles yet
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        Add your first vehicle to start managing its information and
        requesting automotive services.
      </p>

      <button
        type="button"
        onClick={onAdd}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white hover:bg-slate-800"
      >
        <Plus size={18} />
        Add Vehicle
      </button>
    </div>
  );
}

export default MyVehiclesPage;