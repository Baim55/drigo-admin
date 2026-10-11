import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSupportMessages,
  sendSupportMessage,
  updateSupportStatus,
} from "../api/support";
import type { SupportMessage, SupportStatus } from "../types/support";
import {
  HiOutlineArrowLongLeft,
  HiOutlineExclamationCircle,
  HiOutlinePaperAirplane,
} from "react-icons/hi2";

const STATUS_OPTIONS: SupportStatus[] = [
  "Open",
  "Pending",
  "Resolved",
  "Closed",
];

export default function SupportDetailPage() {
  const { id } = useParams();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    loadMessages();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function loadMessages() {
    if (!id) return;
    setLoading(true);
    getSupportMessages(Number(id))
      .then(setMessages)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!id || !newMessage.trim()) return;

    setSending(true);
    setError("");
    try {
      await sendSupportMessage(Number(id), newMessage.trim());
      setNewMessage("");
      loadMessages();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSending(false);
    }
  }

  async function handleStatusChange(status: SupportStatus) {
    if (!id) return;
    setUpdatingStatus(true);
    try {
      await updateSupportStatus(Number(id), status);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingStatus(false);
    }
  }

  if (loading)
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Loading chat...
      </div>
    );

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4">
        <Link
          to="/support"
          className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1.5"
        >
          <HiOutlineArrowLongLeft size={20} />
          <span>Back to support</span>
        </Link>
        <select
          onChange={(e) => handleStatusChange(e.target.value as SupportStatus)}
          disabled={updatingStatus}
          defaultValue=""
          className="text-xs font-semibold rounded-xl border border-slate-300 px-3.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="" disabled>
            Change status...
          </option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {/* Chat Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col h-[550px] overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-slate-50/50">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.isOperator ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-xs ${
                  m.isOperator
                    ? "bg-blue-600 text-white rounded-br-xs"
                    : "bg-white text-slate-800 rounded-bl-xs border border-slate-200"
                }`}
              >
                <p
                  className={`text-xs font-bold mb-1 opacity-80 ${m.isOperator ? "text-blue-100" : "text-slate-500"}`}
                >
                  {m.createdBy}
                </p>
                <p className="leading-relaxed">{m.message}</p>
                {m.mediaUrl && (
                  <img
                    src={m.mediaUrl}
                    alt="attachment"
                    className="mt-2.5 rounded-xl max-w-full border border-black/10"
                  />
                )}
                <p
                  className={`text-[10px] opacity-70 mt-1.5 text-right font-medium ${m.isOperator ? "text-blue-100" : "text-slate-400"}`}
                >
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input Form */}
        <form
          onSubmit={handleSend}
          className="bg-white border-t border-slate-200 p-4 flex gap-3 items-center"
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a reply..."
            className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
          >
            <span>{sending ? "Sending..." : "Send"}</span>
            <HiOutlinePaperAirplane size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
