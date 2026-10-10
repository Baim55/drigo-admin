import { useEffect, useState } from "react";
import { getProblematicCars } from "../api/cars";
import type { ProblematicCar } from "../api/cars";
import { Link } from "react-router-dom";
import { 
  HiOutlineShieldExclamation, 
  HiOutlineArrowLongLeft, 
  HiOutlineExclamationCircle, 
  HiOutlineChevronLeft, 
  HiOutlineChevronRight 
} from "react-icons/hi2";

const PAGE_SIZE = 10;

export default function ProblematicCarsPage() {
  const [cars, setCars] = useState<ProblematicCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    getProblematicCars()
      .then(setCars)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  const total = cars.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startIndex = (page - 1) * PAGE_SIZE;
  const paginatedCars = cars.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineShieldExclamation className="text-red-500" size={28} />
            <span>Problematic Cars</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor fleet vehicles reporting operational issues, low fuel, or maintenance requirements.
          </p>
        </div>
        <Link
          to="/cars"
          className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1.5"
        >
          <HiOutlineArrowLongLeft size={20} />
          <span>Back to cars</span>
        </Link>
      </div>

      {loading && <div className="py-12 text-center text-slate-500 font-medium">Loading problematic cars...</div>}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {!loading && !error && cars.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No problematic cars found.
        </div>
      )}

      {!loading && !error && cars.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left min-w-[700px]">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Car</th>
                    <th className="px-6 py-3.5">Plate</th>
                    <th className="px-6 py-3.5">Fuel</th>
                    <th className="px-6 py-3.5">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {paginatedCars.map((car) => (
                    <tr
                      key={car.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        #{car.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <Link
                          to={`/cars/${car.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {car.brandName} {car.modelName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {car.plateNumber}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {car.fuelLevel.toFixed(0)}%
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-wrap gap-1.5">
                          {car.issues.map((issue) => (
                            <span
                              key={issue}
                              className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 ring-1 ring-red-200"
                            >
                              {issue}
                            </span>
                          ))}
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
              Total <span className="font-bold text-slate-700">{total}</span> problematic cars, page <span className="font-bold text-slate-700">{page}</span>/<span className="font-bold text-slate-700">{totalPages}</span>
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition bg-white"
              >
                <HiOutlineChevronLeft size={16} />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition bg-white"
              >
                <span>Next</span>
                <HiOutlineChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}