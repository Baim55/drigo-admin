import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRentals } from "../api/rentals";
import type { Rental, RentalStatus } from "../types/rental";
import {
  HiOutlineDocumentText,
  HiOutlineMagnifyingGlass,
  HiOutlineExclamationCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

const STATUS_OPTIONS: { value: RentalStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "Active", label: "Active" },
  { value: "Started", label: "Started" },
  { value: "Completed", label: "Completed" },
  { value: "PaymentPending", label: "Payment Pending" },
  { value: "Cancelled", label: "Cancelled" },
  { value: "Accident", label: "Accident" },
];

const STATUS_STYLES: Record<RentalStatus, string> = {
  Active: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Started: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
  Completed: "bg-green-50 text-green-700 ring-1 ring-green-200",
  PaymentPending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Cancelled: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  Accident: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export default function RentalsPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<RentalStatus | "">("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 15;

  useEffect(() => {
    setLoading(true);
    setError("");

    getRentals({
      page,
      pageSize,
      status: status || undefined,
    })
      .then((res) => {
        setRentals(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [page, status]);

  const totalPages = Math.ceil(total / pageSize);

  // NOTE: Backend's GET /rentals endpoint does not implement the `search`
  // query param (verified via manual testing — returns all results regardless
  // of search value). Falling back to client-side filtering on the current
  // page only, as a temporary UX improvement. Real fix requires backend support.
  const filteredRentals = search
    ? rentals.filter((r) =>
        r.user.fullName.toLowerCase().includes(search.toLowerCase()),
      )
    : rentals;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HiOutlineDocumentText className="text-blue-600" size={28} />
          <span>Rentals Management</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Monitor ongoing trips, payment pending statuses, completed rentals,
          and customer histories.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-72">
          <HiOutlineMagnifyingGlass
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            placeholder="Search by customer..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar w-full sm:w-auto">
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
      </div>

      {loading && (
        <div className="py-12 text-center text-slate-500 font-medium">
          Loading rentals...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {!loading && !error && rentals.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No rentals found.
        </div>
      )}

      {!loading && !error && rentals.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left min-w-[750px]">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">ID</th>
                    <th className="px-6 py-3.5">Customer</th>
                    <th className="px-6 py-3.5">Start Date</th>
                    <th className="px-6 py-3.5">Distance</th>
                    <th className="px-6 py-3.5">Total Paid</th>
                    <th className="px-6 py-3.5">Debt</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRentals.map((rental) => (
                    <tr
                      key={rental.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                        #{rental.id}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <Link
                          to={`/rentals/${rental.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {rental.user.fullName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {new Date(rental.startDate).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {rental.totalDistance.toFixed(1)} km
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-semibold">
                        {rental.totalPaid} AED
                      </td>
                      <td className="px-6 py-4">
                        {rental.userTotalDebt > 0 ? (
                          <span className="font-bold text-red-600">
                            {rental.userTotalDebt} AED
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[rental.status]}`}
                        >
                          {rental.status}
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
              rentals, page{" "}
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
