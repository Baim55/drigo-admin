import { useEffect, useState } from "react";
import {
  getHistory,
  getCampaigns,
  sendBroadcast,
  createCampaign,
  setCampaignStatus,
  executeCampaign,
  deleteCampaign,
} from "../api/notifications";
import type { NotificationItem, Campaign } from "../api/notifications";
import {
  HiOutlineBell,
  HiOutlineExclamationCircle,
  HiOutlineMegaphone,
  HiOutlineClock,
  HiOutlinePaperAirplane,
  HiOutlineCheckCircle,
  HiOutlinePlus,
  HiOutlinePlay,
  HiOutlineXMark,
  HiOutlineTrash,
} from "react-icons/hi2";

type Tab = "campaigns" | "history" | "broadcast";

const STATUS_STYLES: Record<string, string> = {
  Draft: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  Scheduled: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Sending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Sent: "bg-green-50 text-green-700 ring-1 ring-green-200",
  Cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
  Delivered: "bg-green-50 text-green-700 ring-1 ring-green-200",
  Failed: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export default function NotificationsPage() {
  const [tab, setTab] = useState<Tab>("campaigns");
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [history, setHistory] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [bTitle, setBTitle] = useState("");
  const [bBody, setBBody] = useState("");
  const [cTitle, setCTitle] = useState("");
  const [cBody, setCBody] = useState("");
  const [cAudience, setCAudience] = useState("All");

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    Promise.all([getCampaigns(), getHistory()])
      .then(([c, h]) => {
        setCampaigns(c);
        setHistory(h);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  async function run(fn: () => Promise<unknown>, done?: string, id?: number) {
    setError("");
    setMessage("");
    if (id !== undefined) setBusyId(id);
    try {
      await fn();
      if (done) setMessage(done);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  function handleBroadcast(e: React.FormEvent) {
    e.preventDefault();
    run(() => sendBroadcast(bTitle.trim(), bBody.trim()), "Broadcast sent.");
    setBTitle("");
    setBBody("");
  }

  function handleCreateCampaign(e: React.FormEvent) {
    e.preventDefault();
    run(
      () => createCampaign(cTitle.trim(), cBody.trim(), cAudience),
      "Campaign created.",
    );
    setCTitle("");
    setCBody("");
  }

  const tabBtn = (t: Tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(t)}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
        tab === t
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const input =
    "rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineBell className="text-blue-600" size={28} />
            <span>Notifications & Campaigns</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage broadcast messages, marketing campaigns, and notification
            history.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabBtn("campaigns", "Campaigns", <HiOutlineMegaphone size={18} />)}
        {tabBtn("history", "History", <HiOutlineClock size={18} />)}
        {tabBtn("broadcast", "Broadcast", <HiOutlinePaperAirplane size={18} />)}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}
      {message && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700 flex items-center gap-3">
          <HiOutlineCheckCircle size={20} className="shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {loading && <p className="text-slate-500 font-medium">Loading...</p>}

      {tab === "broadcast" && (
        <form
          onSubmit={handleBroadcast}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-col gap-4 max-w-xl"
        >
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <HiOutlinePaperAirplane className="text-blue-600" size={20} />
            <span>Send Instant Broadcast</span>
          </h3>
          <input
            required
            value={bTitle}
            onChange={(e) => setBTitle(e.target.value)}
            placeholder="Broadcast Title"
            className={input}
          />
          <textarea
            required
            value={bBody}
            onChange={(e) => setBBody(e.target.value)}
            placeholder="Message body..."
            rows={4}
            className={input}
          />
          <button className="self-start text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl transition shadow-sm">
            Send to all users
          </button>
        </form>
      )}

      {tab === "campaigns" && !loading && (
        <div className="space-y-6">
          <form
            onSubmit={handleCreateCampaign}
            className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 flex flex-wrap gap-4 items-end"
          >
            <div className="w-full sm:w-auto flex-1 min-w-[200px]">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Campaign Title
              </label>
              <input
                required
                value={cTitle}
                onChange={(e) => setCTitle(e.target.value)}
                placeholder="e.g. Summer Special"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full sm:w-auto flex-1 min-w-[250px]">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Message Content
              </label>
              <input
                required
                value={cBody}
                onChange={(e) => setCBody(e.target.value)}
                placeholder="Message..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full sm:w-auto">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Target Audience
              </label>
              <select
                value={cAudience}
                onChange={(e) => setCAudience(e.target.value)}
                className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {["All", "Verified", "Unverified", "WithDebt", "NewUsers"].map(
                  (a) => (
                    <option key={a} value={a}>
                      {a}
                    </option>
                  ),
                )}
              </select>
            </div>
            <button className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition shadow-sm">
              <HiOutlinePlus size={18} />
              <span>Create campaign</span>
            </button>
          </form>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-sm text-left min-w-[700px]">
                <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3.5">Title</th>
                    <th className="px-6 py-3.5">Audience</th>
                    <th className="px-6 py-3.5">Recipients / Opens</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {campaigns.map((c) => (
                    <tr
                      key={c.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {c.title}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium">
                        {c.targetAudience}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {c.recipientCount.toLocaleString()} /{" "}
                        {c.openCount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            STATUS_STYLES[c.status] ?? ""
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right whitespace-nowrap space-x-2">
                        {(c.status === "Draft" || c.status === "Scheduled") && (
                          <button
                            onClick={() =>
                              window.confirm("Send this campaign now?") &&
                              run(
                                () => executeCampaign(c.id),
                                "Campaign executed.",
                                c.id,
                              )
                            }
                            disabled={busyId === c.id}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            <HiOutlinePlay size={14} />
                            <span>Execute</span>
                          </button>
                        )}
                        {c.status !== "Cancelled" && c.status !== "Sent" && (
                          <button
                            onClick={() =>
                              run(
                                () => setCampaignStatus(c.id, "Cancelled"),
                                undefined,
                                c.id,
                              )
                            }
                            disabled={busyId === c.id}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                          >
                            <HiOutlineXMark size={14} />
                            <span>Cancel</span>
                          </button>
                        )}
                        <button
                          onClick={() =>
                            window.confirm("Delete this campaign?") &&
                            run(() => deleteCampaign(c.id), undefined, c.id)
                          }
                          disabled={busyId === c.id}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          <HiOutlineTrash size={14} />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "history" && !loading && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Channel</th>
                  <th className="px-6 py-3.5">Target</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr
                    key={h.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {h.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{h.type}</td>
                    <td className="px-6 py-4 text-slate-600">{h.channel}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {h.targetUserId ? "One user" : "Everyone"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          STATUS_STYLES[h.status] ?? ""
                        }`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 font-medium">
                      {new Date(h.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
