import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Pencil,
  Power,
  PowerOff,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  LoaderCircle,
  Archive,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Button from "../../components/common/Button";
import PartFormModal from "../../components/modals/PartFormModal";
import ArchivePartModal from "../../components/modals/ArchivePartModal";
import {
  getEffectiveStatus,
  formatPrice,
  formatWarranty,
  formatStock,
  STATUS_FILTER_OPTIONS,
} from "../../features/parts/partsData";
import {
  createPart,
  listParts,
  updatePart,
  updatePartStatus,
} from "../../features/parts/partsApi";

const STATUS_BADGE_STYLES = {
  Active: "bg-emerald-50 text-emerald-700",
  Inactive: "bg-slate-100 text-slate-600",
  Archived: "bg-amber-50 text-amber-700",
  "Out of Stock": "bg-red-50 text-red-700",
};

function PartsPage() {
  const [parts, setParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [modalMode, setModalMode] = useState(null); // null | "create" | "edit"
  const [editingPart, setEditingPart] = useState(null);
  const [archivingPart, setArchivingPart] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [pageMeta, setPageMeta] = useState({
    totalElements: 0,
    totalPages: 0,
    summary: { total: 0, active: 0, lowStock: 0, outOfStock: 0 },
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    listParts({
      search: searchTerm,
      status: statusFilter,
      lowStock: lowStockOnly,
      page,
      size: pageSize,
    })
      .then((response) => {
        if (isMounted) {
          setParts(response.items.map(mapApiPart));
          setPageMeta(response);
        }
      })
      .catch((error) => {
        if (isMounted) setPageError(error.message);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [searchTerm, statusFilter, lowStockOnly, page, pageSize, refreshKey]);

  const summary = pageMeta.summary;

  const handleOpenCreate = () => {
    setEditingPart(null);
    setModalMode("create");
  };

  const handleOpenEdit = (part) => {
    setEditingPart(part);
    setModalMode("edit");
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleLowStockChange = (event) => {
    setLowStockOnly(event.target.checked);
    setPage(0);
  };

  const handlePageSizeChange = (event) => {
    setPageSize(Number(event.target.value));
    setPage(0);
  };

  const handleCloseModal = () => {
    setModalMode(null);
    setEditingPart(null);
  };

  const handleArchivePart = async (part) => {
    const updated = await updatePartStatus(part.id, "ARCHIVED");
    setParts((current) =>
      current.map((item) => (item.id === part.id ? mapApiPart(updated) : item)),
    );
    setArchivingPart(null);
    setRefreshKey((current) => current + 1);
  };

  const handleCreatePart = async (values) => {
    await createPart(toApiPart(values));
    setPage(0);
    setRefreshKey((current) => current + 1);
    handleCloseModal();
  };

  const handleUpdatePart = async (values) => {
    await updatePart(editingPart.id, toApiPart(values));
    setRefreshKey((current) => current + 1);
    handleCloseModal();
  };

  const handleToggleActive = async (part) => {
    try {
      const updated = await updatePartStatus(
        part.id,
        part.status === "Inactive" ? "Active" : "Inactive",
      );
      setParts((current) =>
        current.map((p) => (p.id === part.id ? mapApiPart(updated) : p)),
      );
      setRefreshKey((current) => current + 1);
    } catch (error) {
      setPageError(error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Parts catalog
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage parts, supplier sources, warranty, stock, and availability.
          </p>
        </div>

        <Button
          variant="primary"
          className="w-full sm:w-auto"
          onClick={handleOpenCreate}
        >
          <Plus size={16} className="mr-2" />
          Add part
        </Button>
      </div>

      {pageError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {pageError}
        </div>
      )}

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          icon={Package}
          label="Total parts"
          value={summary.total}
          accent="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          icon={CheckCircle2}
          label="Active"
          value={summary.active}
          accent="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          icon={AlertTriangle}
          label="Low stock"
          value={summary.lowStock}
          accent="bg-amber-50 text-amber-600"
        />
        <SummaryCard
          icon={XCircle}
          label="Out of stock"
          value={summary.outOfStock}
          accent="bg-red-50 text-red-600"
        />
      </div>

      {/* Search + filters toolbar */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder="Search by part, brand, or number"
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
            />
          </div>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 sm:w-48"
          >
            {STATUS_FILTER_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
              showFilters
                ? "border-blue-300 bg-blue-50 text-blue-600"
                : "border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
            }`}
          >
            <Filter size={15} />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-3">
            <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={handleLowStockChange}
                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              Low stock only
            </label>
          </div>
        )}
      </div>

      {/* Parts table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <th className="px-6 py-3.5">Part</th>
                <th className="px-6 py-3.5">Part number</th>
                <th className="px-6 py-3.5">Source / Warranty</th>
                <th className="px-6 py-3.5">Price</th>
                <th className="px-6 py-3.5">Stock / Reorder</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-16 text-center text-sm text-slate-500"
                  >
                    <LoaderCircle
                      size={20}
                      className="mx-auto mb-2 animate-spin text-blue-600"
                    />
                    Loading parts...
                  </td>
                </tr>
              ) : parts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-sm text-slate-500"
                  >
                    No parts match your search or filters.
                  </td>
                </tr>
              ) : (
                parts.map((part) => {
                  const effectiveStatus = getEffectiveStatus(part);
                  const isInactive = part.status === "Inactive";
                  const isArchived = part.status === "Archived";
                  const canToggle = !isArchived;

                  return (
                    <tr
                      key={part.id}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                    >
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-900">
                          {part.name}
                        </p>
                        <p className="text-xs text-slate-500">{part.brand}</p>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs font-medium text-slate-700">
                        {part.partNumber}
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-slate-800">{part.source || "—"}</p>
                        <p className="text-xs text-slate-500">
                          {formatWarranty(part.warranty)}
                        </p>
                      </td>

                      <td className="px-6 py-4 font-medium text-slate-900">
                        {formatPrice(part.price)}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={
                            part.stock === 0
                              ? "font-semibold text-red-600"
                              : "text-slate-800"
                          }
                        >
                          {formatStock(part.stock)}
                        </span>
                        <p className="mt-1 text-xs text-slate-500">
                          Reorder at {formatStock(part.reorderLevel)}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <StatusBadge status={effectiveStatus} />
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {!isArchived && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(part)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              <Pencil size={13} />
                              Edit
                            </button>
                          )}

                          {canToggle && (
                            <button
                              type="button"
                              onClick={() => handleToggleActive(part)}
                              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                                isInactive
                                  ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                  : "border-red-200 text-red-600 hover:bg-red-50"
                              }`}
                            >
                              {isInactive ? (
                                <Power size={13} />
                              ) : (
                                <PowerOff size={13} />
                              )}
                              {isInactive ? "Activate" : "Deactivate"}
                            </button>
                          )}

                          {!isArchived && (
                            <button
                              type="button"
                              onClick={() => setArchivingPart(part)}
                              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50"
                            >
                              <Archive size={13} />
                              Archive
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && pageMeta.totalElements > 0 && (
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing {page * pageSize + 1}–
              {Math.min((page + 1) * pageSize, pageMeta.totalElements)} of{" "}
              {pageMeta.totalElements} parts
            </p>

            <div className="flex items-center gap-2">
              <label
                htmlFor="part-page-size"
                className="text-sm text-slate-500"
              >
                Per page
              </label>
              <select
                id="part-page-size"
                value={pageSize}
                onChange={handlePageSizeChange}
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              >
                {[10, 20, 50].map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setPage((current) => Math.max(current - 1, 0))}
                disabled={page === 0}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Previous page"
              >
                <ChevronLeft size={17} />
              </button>
              <span className="min-w-16 text-center text-sm font-semibold text-slate-700">
                {page + 1} / {pageMeta.totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setPage((current) =>
                    Math.min(current + 1, pageMeta.totalPages - 1),
                  )
                }
                disabled={page >= pageMeta.totalPages - 1}
                className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label="Next page"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        )}
      </div>

      {modalMode && (
        <PartFormModal
          mode={modalMode}
          part={editingPart}
          parts={parts}
          onClose={handleCloseModal}
          onCreate={handleCreatePart}
          onUpdate={handleUpdatePart}
        />
      )}

      {archivingPart && (
        <ArchivePartModal
          part={archivingPart}
          onClose={() => setArchivingPart(null)}
          onArchived={handleArchivePart}
        />
      )}
    </div>
  );
}

function mapApiPart(part) {
  return {
    id: part.id,
    name: part.name,
    brand: part.brand,
    partNumber: part.partNumber,
    description: part.description || "",
    source: part.source || "",
    warranty: part.warranty,
    price: Number(part.price),
    stock: part.stock,
    reorderLevel: part.reorderLevel,
    reorderLevel: part.reorderLevel,
    status: part.status,
    effectiveStatus: part.effectiveStatus,
  };
}

function toApiPart(part) {
  return {
    name: part.name,
    brand: part.brand,
    partNumber: part.partNumber,
    description: part.description || null,
    source: part.source || null,
    warranty: part.warranty,
    price: part.price,
    stock: part.stock,
    reorderLevel: part.reorderLevel,
    status: part.status,
  };
}

function SummaryCard({ icon: Icon, label, value, accent }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}
        >
          <Icon size={17} />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        STATUS_BADGE_STYLES[status] || "bg-slate-100 text-slate-600"
      }`}
    >
      {status}
    </span>
  );
}

export default PartsPage;
