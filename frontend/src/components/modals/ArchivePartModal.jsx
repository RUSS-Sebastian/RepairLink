import { useState } from "react";
import { AlertTriangle, Archive, LoaderCircle, X } from "lucide-react";

function ArchivePartModal({ part, onClose, onArchived }) {
  const [isArchiving, setIsArchiving] = useState(false);
  const [error, setError] = useState("");

  if (!part) {
    return null;
  }

  const handleArchive = async () => {
    if (isArchiving) {
      return;
    }

    setError("");
    setIsArchiving(true);

    try {
      await onArchived(part);
    } catch (requestError) {
      setError(requestError.message || "Unable to archive part.");
      setIsArchiving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4"
      aria-busy={isArchiving}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">Archive part</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isArchiving}
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="px-6 py-6">
          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
              <AlertTriangle size={18} />
              {error}
            </div>
          )}

          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-700">
            <Archive size={24} />
          </div>

          <h3 className="text-xl font-bold text-slate-900">
            Archive this part?
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This part will remain available for historical records but will no
            longer be available for normal use.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-semibold text-slate-900">{part.name}</p>
            <p className="mt-1 font-mono text-xs text-slate-500">
              {part.partNumber}
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isArchiving}
            className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleArchive}
            disabled={isArchiving}
            className="inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isArchiving ? (
              <LoaderCircle size={17} className="animate-spin" />
            ) : (
              <Archive size={17} />
            )}
            {isArchiving ? "Archiving..." : "Archive part"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ArchivePartModal;
