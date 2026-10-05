import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSupports } from "../api/support";
import type { SupportTicket, SupportStatus } from "../types/support";

const STATUS_OPTIONS: { value: SupportStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "Open", label: "Open" },
  { value: "Pending", label: "Pending" },
  { value: "Resolved", label: "Resolved" },
  { value: "Closed", label: "Closed" },
];

const STATUS_STYLES: Record<SupportStatus, string> = {
  Open: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Resolved: "bg-green-50 text-green-700 ring-1 ring-green-200",
  Closed: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

export default function SupportPage() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<SupportStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const pageSize = 15;

  useEffect(() => {
    setLoading(true);
    setError("");

    getSupports({ page, pageSize, status: status || undefined })
      .then((res) => {
        setTickets(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [page, status]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Support</h1>

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

      {!loading && !error && tickets.length === 0 && (
        <p className="text-slate-500">No tickets found.</p>
      )}

      {!loading && !error && tickets.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {tickets.map((t) => (
              <Link
                key={t.id}
                to={`/support/${t.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-slate-50/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {t.hasUnread && (
                    <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 truncate">
                      {t.memberName}
                      <span className="text-slate-400 font-normal ml-2 text-xs">
                        {t.reasonName}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500 truncate">
                      {t.lastMessage}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  {t.unreadCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      {t.unreadCount}
                    </span>
                  )}
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[t.status]}`}
                  >
                    {t.status}
                  </span>
                  <span className="text-xs text-slate-400 w-20 text-right">
                    {new Date(t.lastMessageAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Total {total} tickets, page {page}/{totalPages}
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
