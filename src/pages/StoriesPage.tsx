import { useEffect, useState } from "react";
import {
  getStories,
  createStory,
  updateStory,
  deleteStory,
} from "../api/stories";
import type { Story } from "../api/stories";
import {
  HiOutlinePhoto,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineExclamationCircle,
  HiOutlineTrash,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

export default function StoriesPage() {
  const [items, setItems] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [status, setStatus] = useState("Active");
  const [targetAudience, setTargetAudience] = useState("Verified");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getStories()
      .then(setItems)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  function closeForm() {
    setEditingId(null);
    setTitle("");
    setStatus("Active");
    setTargetAudience("Verified");
    setShowForm(false);
  }

  function startEdit(s: Story) {
    setEditingId(s.id);
    setTitle(s.title);
    setStatus(s.status);
    setTargetAudience(s.targetAudience);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = { title: title.trim(), status, targetAudience };
    try {
      if (editingId !== null) await updateStory(editingId, payload);
      else await createStory(payload);
      closeForm();
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this story?")) return;
    setBusyId(id);
    setError("");
    try {
      await deleteStory(id);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlinePhoto className="text-blue-600" size={28} />
            <span>Stories Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage app stories, media items, and audience configurations.
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
          <span>{showForm ? "Cancel" : "Add Story"}</span>
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
            {editingId !== null ? "Edit Story" : "New Story Details"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Title
              </label>
              <input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Safety First"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Active">Active</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Target Audience
              </label>
              <input
                required
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g. Verified"
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
                  ? "Update Story"
                  : "Create Story"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-medium">
          Loading stories...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No stories found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Title</th>
                  <th className="px-6 py-3.5">Audience</th>
                  <th className="px-6 py-3.5">Media Items</th>
                  <th className="px-6 py-3.5">Total Views</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {s.title}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {s.targetAudience}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {s.items?.length || 0} media slides
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">
                      {s.viewCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          s.status === "Active"
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => startEdit(s)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <HiOutlinePencilSquare size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(s.id)}
                        disabled={busyId === s.id}
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
