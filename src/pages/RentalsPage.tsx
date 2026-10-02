import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRentals } from "../api/rentals";
import type { Rental, RentalStatus } from "../types/rental";

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
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Rentals</h1>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <input
          placeholder="Search by customer..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex gap-1">
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
      </div>

      {loading && <p className="text-slate-500">Loading...</p>}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          Error: {error}
        </div>
      )}

      {!loading && !error && rentals.length === 0 && (
        <p className="text-slate-500">No rentals found.</p>
      )}

      {!loading && !error && rentals.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Customer</th>
                    <th className="px-4 py-3 font-medium">Start</th>
                    <th className="px-4 py-3 font-medium">Distance</th>
                    <th className="px-4 py-3 font-medium">Total paid</th>
                    <th className="px-4 py-3 font-medium">Debt</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRentals.map((rental) => (
                    <tr
                      key={rental.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">
                        #{rental.id}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        <Link
                          to={`/rentals/${rental.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {rental.user.fullName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(rental.startDate).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {rental.totalDistance.toFixed(1)} km
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {rental.totalPaid} AED
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {rental.userTotalDebt > 0 ? (
                          <span className="text-red-600 font-medium">
                            {rental.userTotalDebt} AED
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[rental.status]}`}
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

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Total {total} rentals, page {page}/{totalPages}
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
