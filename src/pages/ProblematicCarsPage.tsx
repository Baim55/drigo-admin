import { useEffect, useState } from "react";
import { getProblematicCars } from "../api/cars";
import type { ProblematicCar } from "../api/cars";
import { Link } from "react-router-dom";

export default function ProblematicCarsPage() {
  const [cars, setCars] = useState<ProblematicCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getProblematicCars()
      .then(setCars)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Problematic Cars</h1>
        <Link
          to="/cars"
          className="text-sm font-medium text-blue-600 hover:underline"
        >
          ← Back to cars
        </Link>
      </div>

      {loading && <p className="text-slate-500">Loading...</p>}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          Error: {error}
        </div>
      )}

      {!loading && !error && cars.length === 0 && (
        <p className="text-slate-500">No problematic cars found.</p>
      )}

      {!loading && !error && cars.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 font-medium">ID</th>
                  <th className="px-4 py-3 font-medium">Car</th>
                  <th className="px-4 py-3 font-medium">Plate</th>
                  <th className="px-4 py-3 font-medium">Fuel</th>
                  <th className="px-4 py-3 font-medium">Issues</th>
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
                      {car.plateNumber}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {car.fuelLevel.toFixed(0)}%
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {car.issues.map((issue) => (
                          <span
                            key={issue}
                            className="px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 ring-1 ring-red-200"
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
      )}
    </div>
  );
}
