import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFines } from "../api/fines";
import type { Fine, FineStatus } from "../types/fine";

const STATUS_OPTIONS: { value: FineStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Review", label: "Review" },
  { value: "Billed", label: "Billed" },
  { value: "Dismissed", label: "Dismissed" },
];

const STATUS_STYLES: Record<FineStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Review: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Billed: "bg-green-50 text-green-700 ring-1 ring-green-200",
  Dismissed: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

export default function FinesPage() {
  const [fines, setFines] = useState<Fine[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<FineStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 15;

  useEffect(() => {
    setLoading(true);
    setError("");

    getFines({ page, pageSize, status: status || undefined })
      .then((res) => {
        setFines(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [page, status]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Fines</h1>

      <div className="flex gap-1 mb-4">
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

      {!loading && !error && fines.length === 0 && (
        <p className="text-slate-500">No fines found.</p>
      )}

      {!loading && !error && fines.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Reference</th>
                    <th className="px-4 py-3 font-medium">Type</th>
                    <th className="px-4 py-3 font-medium">Car</th>
                    <th className="px-4 py-3 font-medium">Amount</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fines.map((fine) => (
                    <tr
                      key={fine.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        <Link
                          to={`/fines/${fine.id}`}
                          state={{ fine }}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {fine.referenceNumber}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{fine.type}</td>
                      <td className="px-4 py-3 text-slate-600">
                        {fine.plateNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {fine.amount} {fine.currency}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {new Date(fine.fineDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[fine.status]}`}
                        >
                          {fine.status}
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
              Total {total} fines, page {page}/{totalPages}
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
