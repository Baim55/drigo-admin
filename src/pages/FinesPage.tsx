import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getFines } from "../api/fines";
import type { Fine, FineStatus } from "../types/fine";
import {
  HiOutlineExclamationTriangle,
  HiOutlineExclamationCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HiOutlineExclamationTriangle className="text-blue-600" size={28} />
          <span>Fines Management</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Review traffic violations, process manual/automated fines, and bill
          customers or companies.
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
          Loading fines...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {!loading && !error && fines.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No fines found.
        </div>
      )}

      {!loading && !error && fines.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left min-w-[700px]">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Reference</th>
                    <th className="px-6 py-3.5">Type</th>
                    <th className="px-6 py-3.5">Car Plate</th>
                    <th className="px-6 py-3.5">Amount</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {fines.map((fine) => (
                    <tr
                      key={fine.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <Link
                          to={`/fines/${fine.id}`}
                          state={{ fine }}
                          className="hover:text-blue-600 hover:underline font-mono text-xs"
                        >
                          {fine.referenceNumber}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {fine.type}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {fine.plateNumber}
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {fine.amount} {fine.currency}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(fine.fineDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[fine.status]}`}
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1">
            <p className="text-xs font-medium text-slate-500">
              Total <span className="font-bold text-slate-700">{total}</span>{" "}
              fines, page{" "}
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
