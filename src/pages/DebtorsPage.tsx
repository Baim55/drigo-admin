import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDebtors } from "../api/debts";
import type { DebtorSummary } from "../types/debt";
import {
  HiOutlineCreditCard,
  HiOutlineMagnifyingGlass,
  HiOutlineExclamationCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

export default function DebtorsPage() {
  const [debtors, setDebtors] = useState<DebtorSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 15;

  useEffect(() => {
    setLoading(true);
    setError("");

    getDebtors({ page, pageSize, search: search || undefined })
      .then((res) => {
        setDebtors(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [page, search]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HiOutlineCreditCard className="text-blue-600" size={28} />
          <span>Debtors Management</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track outstanding customer balances, fines, and payment collection
          statuses.
        </p>
      </div>

      <div className="relative w-full max-w-sm">
        <HiOutlineMagnifyingGlass
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-xl border border-slate-300 pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
        />
      </div>

      {loading && (
        <div className="py-12 text-center text-slate-500 font-medium">
          Loading debtors...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {!loading && !error && debtors.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No debtors found.
        </div>
      )}

      {!loading && !error && debtors.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left min-w-[600px]">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Name</th>
                    <th className="px-6 py-3.5">Phone</th>
                    <th className="px-6 py-3.5">Total Debt</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {debtors.map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900">
                        <Link
                          to={`/debts/${d.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {d.fullName}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {d.phoneNumber}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-red-600">
                          {d.totalDebt} AED
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {d.isBlocked ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 ring-1 ring-red-200">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                            Active
                          </span>
                        )}
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
              debtors, page{" "}
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
