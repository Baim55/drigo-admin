import { useEffect, useState } from "react";
import { getCars } from "../api/cars";
import type { Car } from "../types/car";
import { Link } from "react-router-dom";
import CreateCarModal from "../components/CreateCarModal";
import {
  HiOutlineTruck,
  HiOutlinePlus,
  HiOutlineExclamationCircle,
  HiOutlineMagnifyingGlass,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

type SortField = "manufactureYear" | "plateNumber" | "fuelLevel";
type SortOrder = "asc" | "desc";
type ActiveFilter = "all" | "active" | "inactive";

const SORTABLE_COLUMNS: { field: SortField; label: string }[] = [
  { field: "manufactureYear", label: "Year" },
  { field: "plateNumber", label: "Plate" },
  { field: "fuelLevel", label: "Fuel" },
];

const PAGE_SIZE = 10;

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>("all");
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    setError("");

    getCars({
      page,
      pageSize: PAGE_SIZE,
      search: search || undefined,
      sortBy,
      sortOrder,
    })
      .then((res) => {
        if (ignore) return;
        setCars(res.data);
        setTotal(res.total);
      })
      .catch((err) => {
        if (!ignore) setError((err as Error).message);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [page, search, activeFilter, sortBy, sortOrder, refreshKey]);

  // NOTE: Backend's GET /cars endpoint does not filter by `isActive`
  // (verified manually: ?isActive=true and ?isActive=false return identical
  // data). Falling back to client-side filtering on the current page.
  const filteredCars =
    activeFilter === "all"
      ? cars
      : cars.filter((c) => c.isActive === (activeFilter === "active"));

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function handleSort(field: SortField) {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setPage(1);
  }

  function sortIndicator(field: SortField) {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  }

  function handleCreated() {
    setPage(1);
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineTruck className="text-blue-600" size={28} />
            <span>Cars Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage fleet vehicles, track telemetry, and inspect details.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            to="/cars/problematic"
            className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3.5 py-2 rounded-xl transition"
          >
            Problematic cars
          </Link>
          <Link
            to="/cars/tracking"
            className="text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition"
          >
            View live map →
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-sm shadow-blue-600/20 transition"
          >
            <HiOutlinePlus size={18} />
            <span>Add car</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full max-w-sm">
          <HiOutlineMagnifyingGlass
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            placeholder="Search (brand, model, plate...)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value as ActiveFilter);
            setPage(1);
          }}
          className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <HiOutlineExclamationCircle size={20} className="shrink-0" />
            <span>Error: {error}</span>
          </div>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="font-semibold underline text-xs"
          >
            Retry
          </button>
        </div>
      )}

      {loading && filteredCars.length === 0 && (
        <div className="py-12 text-center text-slate-500 font-medium">
          Loading cars...
        </div>
      )}

      {!loading && !error && filteredCars.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No cars found.
        </div>
      )}

      {filteredCars.length > 0 && (
        <div className="space-y-4">
          <div
            className={`bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${
              loading ? "opacity-50" : ""
            }`}
          >
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left min-w-[700px]">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">ID</th>
                    <th className="px-5 py-3.5">Brand / Model</th>
                    {SORTABLE_COLUMNS.map((col) => (
                      <th
                        key={col.field}
                        onClick={() => handleSort(col.field)}
                        className="px-5 py-3.5 font-semibold cursor-pointer select-none hover:text-slate-900 transition"
                      >
                        {col.label}
                        {sortIndicator(col.field)}
                      </th>
                    ))}
                    <th className="px-5 py-3.5">Color</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCars.map((car) => (
                    <tr
                      key={car.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">
                        #{car.id}
                      </td>
                      <td className="px-5 py-4 font-bold text-slate-900">
                        <Link
                          to={`/cars/${car.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {car.brandName} {car.modelName}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {car.manufactureYear}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                        {car.plateNumber}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {car.fuelLevel.toFixed(0)}%
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block w-3 h-3 rounded-full border border-slate-200 shadow-xs"
                            style={{ backgroundColor: car.colorHexCode }}
                          />
                          <span className="font-medium text-xs">
                            {car.colorName}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              car.isActive
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                                : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                            }`}
                          >
                            {car.isActive ? "Active" : "Inactive"}
                          </span>
                          {car.activeRentalId !== null && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200">
                              Rented
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1">
            <p className="text-xs font-medium text-slate-500">
              Showing{" "}
              <span className="font-bold text-slate-700">
                {filteredCars.length}
              </span>{" "}
              of <span className="font-bold text-slate-700">{total}</span> cars,
              page <span className="font-bold text-slate-700">{page}</span>/
              <span className="font-bold text-slate-700">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition bg-white"
              >
                <HiOutlineChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition bg-white"
              >
                <span>Next</span>
                <HiOutlineChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateCarModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
