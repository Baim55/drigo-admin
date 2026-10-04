import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDebtors } from "../api/debts";
import type { DebtorSummary } from "../types/debt";

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
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Debtors</h1>
      <div className="mb-4">
        <input
          placeholder="Search by name..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full max-w-sm rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {loading && <p className="text-slate-500">Loading...</p>}

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          Error: {error}
        </div>
      )}

      {!loading && !error && debtors.length === 0 && (
        <p className="text-slate-500">No debtors found.</p>
      )}

      {!loading && !error && debtors.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Phone</th>
                    <th className="px-4 py-3 font-medium">Total debt</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {debtors.map((d) => (
                    <tr
                      key={d.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4 font-semibold text-slate-800">
                        <Link
                          to={`/debts/${d.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {d.fullName}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {d.phoneNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-red-600 font-semibold">
                          {d.totalDebt} AED
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {d.isBlocked ? (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 ring-1 ring-red-200">
                            Blocked
                          </span>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
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

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Total {total} debtors, page {page}/{totalPages}
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
