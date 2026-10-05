import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReservations } from "../api/reservations";
import type { Reservation, ReservationStatus } from "../types/reservation";

const STATUS_OPTIONS: { value: ReservationStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "DriverAssigned", label: "Driver Assigned" },
  { value: "PickingUp", label: "Picking Up" },
  { value: "InDelivery", label: "In Delivery" },
  { value: "Delivered", label: "Delivered" },
  { value: "Completed", label: "Completed" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Expired", label: "Expired" },
];

const STATUS_STYLES: Record<ReservationStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  DriverAssigned: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  PickingUp: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
  InDelivery: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  Delivered: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  Completed: "bg-green-50 text-green-700 ring-1 ring-green-200",
  Cancelled: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  Expired: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<ReservationStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 15;

  useEffect(() => {
    setLoading(true);
    setError("");

    getReservations({ page, pageSize, status: status || undefined })
      .then((res) => {
        setReservations(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [page, status]);

  const totalPages = Math.ceil(total / pageSize);

  function formatAddress(
    addr: string | { address: string; latitude: number; longitude: number },
  ): string {
    return typeof addr === "string" ? addr : addr.address;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Reservations</h1>

      <div className="flex flex-wrap gap-1 mb-4">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => {
              setStatus(opt.value);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              status === opt.value
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading && <p className="text-slate-500">Loading...</p>}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          Error: {error}
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <p className="text-slate-500">No reservations found.</p>
      )}

      {!loading && !error && reservations.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Car</th>
                    <th className="px-4 py-3 font-medium">Delivery</th>
                    <th className="px-4 py-3 font-medium">Price</th>
                    <th className="px-4 py-3 font-medium">Driver</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        <Link
                          to={`/reservations/${r.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {r.customerName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {r.carName} · {r.plateNumber}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatAddress(r.deliveryAddress)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {r.totalPrice} AED
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {r.driverName ?? "-"}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[r.status]}`}
                        >
                          {r.status}
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
              Total {total} reservations, page {page}/{totalPages}
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
    </div>
  );
}
