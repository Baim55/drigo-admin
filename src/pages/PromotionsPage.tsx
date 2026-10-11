import { useEffect, useState } from "react";
import {
  getPromotions,
  createPromotion,
  updatePromotion,
  togglePromotionStatus,
  deletePromotion,
} from "../api/promotions";
import type { Promotion } from "../api/promotions";
import {
  HiOutlineMegaphone,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineExclamationCircle,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlinePlay,
  HiOutlinePause,
} from "react-icons/hi2";

export default function PromotionsPage() {
  const [items, setItems] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [actionType, setActionType] = useState("OpenCar");
  const [frequency, setFrequency] = useState("Always");
  const [imageUrl, setImageUrl] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getPromotions()
      .then(setItems)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  function closeForm() {
    setEditingId(null);
    setTitle("");
    setDescription("");
    setActionType("OpenCar");
    setFrequency("Always");
    setImageUrl("");
    setStartDate("");
    setEndDate("");
    setShowForm(false);
  }

  function startEdit(p: Promotion) {
    setEditingId(p.id);
    setTitle(p.title);
    setDescription(p.description);
    setActionType(p.actionType);
    setFrequency(p.frequency);
    setImageUrl(p.imageUrl);
    setStartDate(p.startDate ? p.startDate.slice(0, 10) : "");
    setEndDate(p.endDate ? p.endDate.slice(0, 10) : "");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    if (startDate && endDate && endDate < startDate) {
      setError("End date must be after start date.");
      setSaving(false);
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      actionType,
      frequency,
      imageUrl: imageUrl.trim(),
      startDate: startDate
        ? new Date(startDate).toISOString()
        : new Date().toISOString(),
      endDate: endDate
        ? new Date(endDate).toISOString()
        : new Date().toISOString(),
    };
    try {
      if (editingId !== null) await updatePromotion(editingId, payload);
      else await createPromotion(payload);
      closeForm();
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function run(id: number, fn: () => Promise<unknown>) {
    setBusyId(id);
    setError("");
    try {
      await fn();
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  function handleDelete(id: number) {
    if (!window.confirm("Delete this promotion?")) return;
    run(id, () => deletePromotion(id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineMegaphone className="text-blue-600" size={28} />
            <span>Promotions</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage promotional campaigns, banners, and targeting options.
          </p>
        </div>
        <button
          onClick={() => (showForm ? closeForm() : setShowForm(true))}
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-sm shadow-blue-600/20 transition"
        >
          {showForm ? (
            <HiOutlineXMark size={18} />
          ) : (
            <HiOutlinePlus size={18} />
          )}
          <span>{showForm ? "Cancel" : "Add Promotion"}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5"
        >
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            {editingId !== null ? "Edit Promotion" : "New Promotion Details"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Summer Splash"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Action Type
              </label>
              <input
                required
                value={actionType}
                onChange={(e) => setActionType(e.target.value)}
                placeholder="e.g. OpenCar"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Frequency
              </label>
              <input
                required
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="e.g. Always"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Image URL
              </label>
              <input
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Promotion details..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeForm}
              className="text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl disabled:opacity-50 transition shadow-sm"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Promotion"
                  : "Create Promotion"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-medium">
          Loading promotions...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No promotions found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Action</th>
                  <th className="px-6 py-3.5">Frequency</th>
                  <th className="px-6 py-3.5">Validity</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 flex items-center gap-3">
                      {p.imageUrl && (
                        <img
                          src={p.imageUrl}
                          alt={p.title}
                          className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                      )}
                      <div>
                        <span className="font-bold text-slate-900 block">
                          {p.title}
                        </span>
                        <span className="text-xs text-slate-400 truncate max-w-[200px] block">
                          {p.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {p.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {p.actionType}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{p.frequency}</td>
                    <td className="px-6 py-4 text-slate-600 text-xs">
                      {new Date(p.startDate).toLocaleDateString()} —{" "}
                      {new Date(p.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          p.isActive
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                        }`}
                      >
                        {p.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => startEdit(p)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <HiOutlinePencilSquare size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() =>
                          run(p.id, () =>
                            togglePromotionStatus(p.id, !p.isActive),
                          )
                        }
                        disabled={busyId === p.id}
                        className="text-xs font-semibold text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        {p.isActive ? (
                          <>
                            <HiOutlinePause size={14} />
                            <span>Deactivate</span>
                          </>
                        ) : (
                          <>
                            <HiOutlinePlay size={14} />
                            <span>Activate</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        disabled={busyId === p.id}
                        className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <HiOutlineTrash size={16} />
                        <span>Delete</span>
                      </button>
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
