import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getReservations } from "../api/reservations";
import type { Reservation, ReservationStatus } from "../types/reservation";
import {
  HiOutlineCalendarDays,
  HiOutlineExclamationCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HiOutlineCalendarDays className="text-blue-600" size={28} />
          <span>Reservations & Delivery</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track car reservation pipelines, delivery addresses, and assigned
          drivers.
        </p>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value || "all"}
            onClick={() => {
              setStatus(opt.value);
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              status === opt.value
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading && (
        <div className="py-12 text-center text-slate-500 font-medium">
          Loading reservations...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No reservations found.
        </div>
      )}

      {!loading && !error && reservations.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left min-w-[750px]">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Car</th>
                    <th className="px-6 py-3.5">Delivery Address</th>
                    <th className="px-6 py-3.5">Price</th>
                    <th className="px-6 py-3.5">Driver</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.map((r) => (
                    <tr
                      key={r.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <Link
                          to={`/reservations/${r.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {r.customerName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {r.carName} ·{" "}
                        <span className="font-mono text-xs">
                          {r.plateNumber}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600 max-w-xs truncate">
                        {formatAddress(r.deliveryAddress)}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {r.totalPrice} AED
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {r.driverName ?? "-"}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[r.status]}`}
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1">
            <p className="text-xs font-medium text-slate-500">
              Total <span className="font-bold text-slate-700">{total}</span>{" "}
              reservations, page{" "}
              <span className="font-bold text-slate-700">{page}</span>/
              <span className="font-bold text-slate-700">{totalPages}</span>
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
                disabled={page === totalPages}
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
