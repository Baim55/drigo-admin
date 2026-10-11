import { useEffect, useState } from "react";
import {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  togglePromoCode,
  deletePromoCode,
} from "../api/promoCodes";
import type { PromoCode } from "../api/promoCodes";
import {
  HiOutlineTag,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineExclamationCircle,
  HiOutlineTrash,
  HiOutlinePencilSquare,
  HiOutlinePlay,
  HiOutlinePause,
} from "react-icons/hi2";

export default function PromoCodesPage() {
  const [items, setItems] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [type, setType] = useState("Percentage");
  const [value, setValue] = useState("");
  const [max, setMax] = useState("");
  const [expires, setExpires] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getPromoCodes()
      .then(setItems)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  function closeForm() {
    setEditingId(null);
    setCode("");
    setType("Percentage");
    setValue("");
    setMax("");
    setExpires("");
    setShowForm(false);
  }

  function startEdit(p: PromoCode) {
    setEditingId(p.id);
    setCode(p.code);
    setType(p.discountType);
    setValue(String(p.value));
    setMax(p.maxRedemptions === null ? "" : String(p.maxRedemptions));
    setExpires(p.expiresAt ? p.expiresAt.slice(0, 10) : "");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      code: code.trim().toUpperCase(),
      discountType: type,
      value: Number(value),
      maxRedemptions: max === "" ? null : Number(max),
      expiresAt: expires ? new Date(expires).toISOString() : null,
    };
    try {
      if (editingId !== null) await updatePromoCode(editingId, payload);
      else await createPromoCode(payload);
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
    if (!window.confirm("Delete this promo code?")) return;
    run(id, () => deletePromoCode(id));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineTag className="text-blue-600" size={28} />
            <span>Promo Codes</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage discount promo codes, usage limits, and expiration dates.
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
          <span>{showForm ? "Cancel" : "Add Promo Code"}</span>
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
            {editingId !== null ? "Edit Promo Code" : "New Promo Code Details"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Promo Code
              </label>
              <input
                required
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SUMMER2026"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Discount Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="FixedAmount">Fixed Amount</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Value
              </label>
              <input
                required
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Max Uses (Optional)
              </label>
              <input
                type="number"
                value={max}
                onChange={(e) => setMax(e.target.value)}
                placeholder="e.g. 50"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Expiration Date
              </label>
              <input
                type="date"
                value={expires}
                onChange={(e) => setExpires(e.target.value)}
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
                  ? "Update Promo Code"
                  : "Create Promo Code"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-medium">
          Loading promo codes...
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No promo codes found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Code</th>
                  <th className="px-6 py-3.5">Discount</th>
                  <th className="px-6 py-3.5">Used</th>
                  <th className="px-6 py-3.5">Expires</th>
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
                    <td className="px-6 py-4 font-mono font-bold text-slate-900 tracking-wide">
                      {p.code}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      {p.discountType === "Percentage"
                        ? `${p.value}%`
                        : `${p.value} AED`}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {p.redemptionCount}
                      {p.maxRedemptions !== null
                        ? ` / ${p.maxRedemptions}`
                        : ""}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {p.expiresAt
                        ? new Date(p.expiresAt).toLocaleDateString()
                        : "Never"}
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
                        onClick={() => run(p.id, () => togglePromoCode(p.id))}
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
