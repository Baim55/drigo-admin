import { useEffect, useState } from "react";
import { getCars } from "../api/cars";
import type { Car } from "../types/car";
import { Link } from "react-router-dom";
import CreateCarModal from "../components/CreateCarModal";

type SortField = "manufactureYear" | "plateNumber" | "fuelLevel";
type SortOrder = "asc" | "desc";

const SORTABLE_COLUMNS: { field: SortField; label: string }[] = [
  { field: "manufactureYear", label: "Year" },
  { field: "plateNumber", label: "Plate" },
  { field: "fuelLevel", label: "Fuel" },
];

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortField | undefined>(undefined);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const pageSize = 10;

  function fetchCars() {
    setLoading(true);
    setError("");

    getCars({
      page,
      pageSize,
      search: search || undefined,
      sortBy,
      sortOrder,
    })
      .then((res) => {
        setCars(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  useEffect(fetchCars, [page, search, sortBy, sortOrder]);

  const totalPages = Math.ceil(total / pageSize);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Cars</h1>
        <div className="flex items-center gap-4">
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
      <div className="mb-4">
        <input
          placeholder="Search (brand, model...)"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && <p className="text-slate-500">Loading...</p>}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          Error: {error}
        </div>
      )}

      {!loading && !error && cars.length === 0 && (
        <p className="text-slate-500">No cars found.</p>
      )}

      {!loading && !error && cars.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
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
                  {cars.map((car) => (
                    <tr
                      key={car.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">
                        #{car.id}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
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
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            car.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {car.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Total {total} cars, page {page}/{totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
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
          onCreated={fetchCars}
        />
      )}
    </div>
  );
}
