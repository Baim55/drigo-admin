import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSupports } from "../api/support";
import type { SupportTicket, SupportStatus } from "../types/support";
import {
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineExclamationCircle,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi2";

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
  Resolved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HiOutlineChatBubbleBottomCenterText
            className="text-blue-600"
            size={28}
          />
          <span>Support Tickets</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage customer inquiries, live chat messages, and support ticket
          statuses.
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
          Loading support tickets...
        </div>
      )}

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {!loading && !error && tickets.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No tickets found.
        </div>
      )}

      {!loading && !error && tickets.length > 0 && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
            {tickets.map((t) => (
              <Link
                key={t.id}
                to={`/support/${t.id}`}
                className="flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  {t.hasUnread && (
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 flex-shrink-0 shadow-xs" />
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 truncate flex items-center gap-2">
                      <span>{t.memberName}</span>
                      <span className="text-slate-400 font-normal text-xs bg-slate-100 px-2.5 py-0.5 rounded-md">
                        {t.reasonName}
                      </span>
                    </p>
                    <p className="text-sm text-slate-500 truncate mt-0.5">
                      {t.lastMessage}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                  {t.unreadCount > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 ring-1 ring-red-200">
                      {t.unreadCount} unread
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[t.status]}`}
                  >
                    {t.status}
                  </span>
                  <span className="text-xs font-medium text-slate-400 w-20 text-right hidden sm:block">
                    {new Date(t.lastMessageAt).toLocaleDateString()}
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-1">
            <p className="text-xs font-medium text-slate-500">
              Total <span className="font-bold text-slate-700">{total}</span>{" "}
              tickets, page{" "}
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
