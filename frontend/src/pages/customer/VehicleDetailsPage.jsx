import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CarFront,
  Pencil,
  Trash2,
  Gauge,
  Fuel,
  Palette,
  CreditCard,
  Settings2,
  CalendarDays,
  Wrench,
  Clock3,
  CheckCircle2,
} from "lucide-react";

import VehicleFormModal from "../../components/modals/VehicleFormModal";
import DeleteVehicleModal from "../../components/modals/DeleteVehicleModal";
import { useVehicles } from "../../context/VehicleContext";

function VehicleDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const { getVehicle } = useVehicles();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const vehicle = getVehicle(id);

  if (!vehicle) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="flex min-h-screen items-center justify-center px-5">
          <div className="text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
              <CarFront size={30} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Vehicle Not Found
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              The vehicle you are looking for does not exist.
            </p>

            <Link
              to="/customer/vehicles"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-5 py-3 text-sm font-semibold text-white hover:bg-[#0256D6]"
            >
              <ArrowLeft size={17} />
              Back to My Vehicles
            </Link>
          </div>
        </main>
      </div>
    );
  }

  const isElectric = vehicle.vehicleType === "EV";

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-5 py-8 lg:px-8 lg:py-10">
        <Link
          to="/customer/vehicles"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={17} />
          Back to My Vehicles
        </Link>

        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
            <div className="flex items-center gap-4">
              <div
                className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl ${
                  isElectric
                    ? "bg-violet-100 text-violet-600"
                    : "bg-blue-50 text-blue-600"
                }`}
              >
                <CarFront size={32} strokeWidth={1.8} />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                    {vehicle.nickname}
                  </h1>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isElectric
                        ? "bg-violet-100 text-violet-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {vehicle.vehicleType === "NORMAL_CAR"
                      ? "Normal Car"
                      : "Electric Vehicle"}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500 sm:text-base">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-400"
              >
                <Pencil size={17} />
                Edit
              </button>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                disabled
                className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-xl bg-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-400"
              >
                <Trash2 size={17} />
                Delete
              </button>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5 lg:px-8">
            <h2 className="text-lg font-bold text-slate-900">
              Vehicle Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Current information for this vehicle.
            </p>
          </div>

          <div className="grid gap-x-8 gap-y-7 p-6 sm:grid-cols-2 lg:grid-cols-3 lg:p-8">
            <DetailItem
              icon={CarFront}
              label="Make & Model"
              value={`${vehicle.make} ${vehicle.model}`}
            />

            <DetailItem icon={CalendarDays} label="Year" value={vehicle.year} />

            <DetailItem
              icon={Settings2}
              label="Vehicle Type"
              value={
                vehicle.vehicleType === "NORMAL_CAR"
                  ? "Normal Car"
                  : "Electric Vehicle"
              }
            />

            <DetailItem icon={Palette} label="Color" value={vehicle.color} />

            <DetailItem
              icon={CreditCard}
              label="License Plate"
              value={vehicle.licensePlate}
            />

            <DetailItem
              icon={Gauge}
              label="Mileage"
              value={`${vehicle.mileage.toLocaleString()} ${vehicle.mileageUnit}`}
            />

            <DetailItem
              icon={Fuel}
              label="Fuel Type"
              value={vehicle.fuelType}
            />

            <DetailItem
              icon={Settings2}
              label="Transmission"
              value={vehicle.transmission || "N/A"}
            />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-6 py-5 lg:px-8">
            <h2 className="text-lg font-bold text-slate-900">
              License Plate History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              A record of license plates associated with this vehicle.
            </p>
          </div>

          <div className="p-6 lg:p-8">
            <div className="space-y-4">
              {vehicle.plateHistory?.map((item, index) => (
                <div
                  key={`${item.plate}-${index}`}
                  className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <CreditCard size={18} />
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-bold text-slate-900">{item.plate}</p>

                        {item.current && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                            <CheckCircle2 size={13} />
                            Current
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Clock3 size={14} />
                    Plate record
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden rounded-2xl bg-[#0261F3] shadow-sm">
          <div className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between lg:p-8">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-white">
                  <Wrench size={22} />
                </div>

                <h2 className="text-xl font-bold text-white">
                  Need service for this vehicle?
                </h2>
              </div>

              <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100">
                Request a repair or maintenance service and keep your vehicle in
                top condition.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                alert(`Service request started for ${vehicle.nickname}.`);
              }}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-bold text-[#0261F3] transition hover:bg-blue-50"
            >
              <Wrench size={18} />
              Request Service
            </button>
          </div>
        </section>
      </main>

      {showEditModal && (
        <VehicleFormModal
          vehicle={vehicle}
          onClose={() => setShowEditModal(false)}
        />
      )}

      {showDeleteModal && (
        <DeleteVehicleModal
          vehicle={vehicle}
          onClose={() => setShowDeleteModal(false)}
          onDeleted={() => {
            setShowDeleteModal(false);
            navigate("/customer/vehicles");
          }}
        />
      )}
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
        <Icon size={18} />
      </div>

      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {label}
        </p>

        <p className="mt-1 truncate text-sm font-semibold text-slate-900">
          {value}
        </p>
      </div>
    </div>
  );
}

function formatDate(dateString) {
  if (!dateString) {
    return "N/A";
  }

  const date = new Date(`${dateString}T00:00:00`);

  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default VehicleDetailsPage;
