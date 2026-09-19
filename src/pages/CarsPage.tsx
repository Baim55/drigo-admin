import { useEffect, useState } from "react";
import { getCars } from "../api/cars";
import type { Car } from "../types/car";

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 10;

  useEffect(() => {
    setLoading(true);
    setError("");

    getCars({ page, pageSize, search: search || undefined })
      .then((res) => {
        setCars(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [page, search]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Cars (Maşınlar)
      </h1>

      <div className="mb-4">
        <input
          placeholder="Axtar (marka, model...)"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && <p className="text-slate-500">Yüklənir...</p>}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          Xəta: {error}
        </div>
      )}

      {!loading && !error && cars.length === 0 && (
        <p className="text-slate-500">Heç bir maşın tapılmadı.</p>
      )}

      {!loading && !error && cars.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Marka / Model</th>
                    <th className="px-4 py-3 font-medium">İl</th>
                    <th className="px-4 py-3 font-medium">Rəng</th>
                    <th className="px-4 py-3 font-medium">Nömrə</th>
                    <th className="px-4 py-3 font-medium">Yanacaq</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {cars.map((car) => (
                    <tr key={car.id} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-slate-500">{car.id}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {car.brandName} {car.modelName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {car.manufactureYear}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2 align-middle border border-slate-200"
                          style={{ backgroundColor: car.colorHexCode }}
                        />
                        {car.colorName}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {car.plateNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {car.fuelLevel.toFixed(0)}%
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            car.isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {car.isActive ? "Aktiv" : "Deaktiv"}
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
              Cəmi {total} maşın, səhifə {page}/{totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Əvvəlki
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition"
              >
                Sonrakı
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
