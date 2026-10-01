import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getSupportMessages,
  sendSupportMessage,
  updateSupportStatus,
} from "../api/support";
import type { SupportMessage, SupportStatus } from "../types/support";

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

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link to="/support" className="text-sm text-blue-600 hover:underline">
          ← Back to support
        </Link>
        <select
          onChange={(e) => handleStatusChange(e.target.value as SupportStatus)}
          disabled={updatingStatus}
          defaultValue=""
          className="text-sm rounded-md border border-slate-300 px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          Error: {error}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.isOperator ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${
                  m.isOperator
                    ? "bg-blue-600 text-white rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                }`}
              >
                <p className="text-xs font-medium mb-1 opacity-70">
                  {m.createdBy}
                </p>
                <p>{m.message}</p>
                {m.mediaUrl && (
                  <img
                    src={m.mediaUrl}
                    alt="attachment"
                    className="mt-2 rounded-lg max-w-full"
                  />
                )}
                <p className="text-xs opacity-60 mt-1 text-right">
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

        <form
          onSubmit={handleSend}
          className="border-t border-slate-100 p-3 flex gap-2"
        >
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a reply..."
            className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="text-sm font-medium px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
          >
            {sending ? "..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}
