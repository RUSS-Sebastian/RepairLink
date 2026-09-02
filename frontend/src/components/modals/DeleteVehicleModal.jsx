import { AlertTriangle, X, Trash2 } from "lucide-react";
import { useVehicles } from "../../context/VehicleContext";

function DeleteVehicleModal({ vehicle, onClose, onDeleted }) {
  const { deleteVehicle } = useVehicles();

  if (!vehicle) {
    return null;
  }

  const handleDelete = () => {
    deleteVehicle(vehicle.id);

    if (onDeleted) {
      onDeleted();
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            Delete Vehicle
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertTriangle size={24} />
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            Are you sure?
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            You are about to delete{" "}
            <span className="font-semibold text-slate-900">
              {vehicle.nickname}
            </span>
            . This action cannot be undone.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              License Plate: {vehicle.licensePlate}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDelete}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
          >
            <Trash2 size={17} />
            Delete Vehicle
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteVehicleModal;