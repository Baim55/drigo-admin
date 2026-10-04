import { useEffect, useState } from "react";
import { getCars } from "../api/cars";
import type { Car } from "../types/car";
import { Link } from "react-router-dom";
import CreateCarModal from "../components/CreateCarModal";

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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Cars</h1>
        <div className="flex items-center gap-4">
          <Link
            to="/cars/problematic"
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Problematic cars
          </Link>
          <Link
            to="/cars/tracking"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            View live map →
          </Link>
          <button
            onClick={() => setShowCreateModal(true)}
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition"
          >
            + Add car
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          placeholder="Search (brand, model, plate...)"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={activeFilter}
          onChange={(e) => {
            setActiveFilter(e.target.value as ActiveFilter);
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          <span>Error: {error}</span>
          <button
            onClick={() => setRefreshKey((k) => k + 1)}
            className="font-medium underline"
          >
            Retry
          </button>
        </div>
      )}

      {loading && filteredCars.length === 0 && (
        <p className="text-slate-500">Loading...</p>
      )}

      {!loading && !error && filteredCars.length === 0 && (
        <p className="text-slate-500">No cars found.</p>
      )}

      {filteredCars.length > 0 && (
        <>
          <div
            className={`bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden transition-opacity ${
              loading ? "opacity-50" : ""
            }`}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Brand / Model</th>
                    {SORTABLE_COLUMNS.map((col) => (
                      <th
                        key={col.field}
                        onClick={() => handleSort(col.field)}
                        className="px-4 py-3 font-medium cursor-pointer select-none hover:text-slate-900"
                      >
                        {col.label}
                        {sortIndicator(col.field)}
                      </th>
                    ))}
                    <th className="px-4 py-3 font-medium">Color</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCars.map((car) => (
                    <tr
                      key={car.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                        #{car.id}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        <Link
                          to={`/cars/${car.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {car.brandName} {car.modelName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {car.manufactureYear}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {car.plateNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {car.fuelLevel.toFixed(0)}%
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2 align-middle border border-slate-200"
                          style={{ backgroundColor: car.colorHexCode }}
                        />
                        {car.colorName}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              car.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            {car.isActive ? "Active" : "Inactive"}
                          </span>
                          {car.activeRentalId !== null && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
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

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Showing {filteredCars.length} of {total} cars, page {page}/
              {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || loading}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        </>
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
