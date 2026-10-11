import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCustomers } from "../api/customers";
import type { Customer } from "../types/customer";
import {
  HiOutlineUsers,
  HiOutlineMagnifyingGlass,
  HiOutlineExclamationCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 15;

  useEffect(() => {
    setLoading(true);
    setError("");

    getCustomers({ page, pageSize, search: search || undefined })
      .then((res) => {
        setCustomers(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [page, search]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HiOutlineUsers className="text-blue-600" size={28} />
          <span>Customers Management</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          View registered users, track verification status, and inspect account
          states.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <HiOutlineMagnifyingGlass
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          size={18}
        />
        <input
          placeholder="Search by name, phone, email..."
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
          Loading customers...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No customers found.
        </div>
      )}

      {!loading && !error && customers.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left min-w-[700px]">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Phone</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Type</th>
                    <th className="px-5 py-3.5">Verification</th>
                    <th className="px-5 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {customers.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-5 py-4 font-bold text-slate-900">
                        <Link
                          to={`/customers/${c.id}`}
                          className="hover:text-blue-600 hover:underline"
                        >
                          {c.fullName}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-mono text-xs">
                        {c.phoneNumber}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {c.email ?? "-"}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {c.userType}
                      </td>
                      <td className="px-5 py-4">
                        {c.isBlocked ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-600 ring-1 ring-red-200">
                            Blocked
                          </span>
                        ) : c.isVerified ? (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                            Verified
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                            Pending
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {c.isApproved ? (
                          <span className="text-emerald-600">Approved</span>
                        ) : (
                          <span className="text-slate-400">Not approved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1">
            <p className="text-xs font-medium text-slate-500">
              Total <span className="font-bold text-slate-700">{total}</span>{" "}
              customers, page{" "}
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
