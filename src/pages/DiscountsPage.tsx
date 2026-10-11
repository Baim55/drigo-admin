import { useEffect, useState } from "react";
import {
  getDiscounts,
  toggleDiscountStatus,
  deleteDiscount,
  createDiscount,
  updateDiscount,
} from "../api/discounts";
import type { Discount, DiscountStatus, DiscountType } from "../types/discount";
import {
  HiOutlineTag,
  HiOutlineExclamationCircle,
  HiOutlineTrash,
  HiOutlinePlay,
  HiOutlinePause,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

const STATUS_STYLES: Record<DiscountStatus, string> = {
  Active: "bg-green-50 text-green-700 ring-1 ring-green-200",
  Scheduled: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Paused: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Expired: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

function formatValue(discount: Discount): string {
  if (discount.type === "Percentage") return `${discount.value}%`;
  return `${discount.value} AED`;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [type, setType] = useState<DiscountType>("Percentage");
  const [value, setValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [limit, setLimit] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getDiscounts()
      .then((res) => setDiscounts(res.data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  async function handleToggle(discount: Discount) {
    const newStatus: DiscountStatus =
      discount.status === "Active" ? "Paused" : "Active";
    setUpdatingId(discount.id);
    setError("");
    try {
      await toggleDiscountStatus(discount.id, newStatus);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  }

  function startEdit(d: Discount) {
    setEditingId(d.id);
    setName(d.name);
    setType(d.type);
    setValue(String(d.value));
    setStartDate(d.startDate.slice(0, 10));
    setEndDate(d.endDate.slice(0, 10));
    setLimit(d.usageLimit === null ? "" : String(d.usageLimit));
    setShowForm(true);
  }

  function closeForm() {
    setEditingId(null);
    setName("");
    setType("Percentage");
    setValue("");
    setStartDate("");
    setEndDate("");
    setLimit("");
    setShowForm(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      name: name.trim(),
      type,
      value: Number(value),
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      usageLimit: limit === "" ? null : Number(limit),
    };
    try {
      if (editingId !== null) await updateDiscount(editingId, payload);
      else await createDiscount(payload);
      closeForm();
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Delete this discount?");
    if (!confirmed) return;
    setUpdatingId(id);
    setError("");
    try {
      await deleteDiscount(id);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineTag className="text-blue-600" size={28} />
            <span>Discounts & Promotions</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage promotional offers, discount values, scopes, and activation
            statuses.
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
          <span>{showForm ? "Cancel" : "Add Discount"}</span>
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
            {editingId !== null ? "Edit Discount" : "New Discount Details"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Discount Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Summer Promo"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Discount Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DiscountType)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Percentage">Percentage (%)</option>
                <option value="FixedAmount">Fixed Amount</option>
                <option value="FixedPrice">Fixed Price</option>
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
                Start Date
              </label>
              <input
                required
                type="date"
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
                required
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Usage Limit (Optional)
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                placeholder="e.g. 100"
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
                  ? "Update Discount"
                  : "Create Discount"}
            </button>
          </div>
        </form>
      )}

      {discounts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No discounts found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Value</th>
                  <th className="px-6 py-3.5">Audience</th>
                  <th className="px-6 py-3.5">Scope</th>
                  <th className="px-6 py-3.5">Usage</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {discounts.map((d) => (
                  <tr
                    key={d.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {d.name}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      {formatValue(d)}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {d.targetAudience}
                    </td>
                    <td className="px-6 py-4 text-slate-600">{d.scope}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {d.usedCount}
                      {d.usageLimit !== null ? ` / ${d.usageLimit}` : ""}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[d.status]}`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                      <button
                        onClick={() => startEdit(d)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <HiOutlinePencilSquare size={16} />
                        <span>Edit</span>
                      </button>

                      {(d.status === "Active" || d.status === "Paused") && (
                        <button
                          onClick={() => handleToggle(d)}
                          disabled={updatingId === d.id}
                          className="text-xs font-semibold text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 disabled:opacity-50"
                        >
                          {d.status === "Active" ? (
                            <>
                              <HiOutlinePause size={14} />
                              <span>Pause</span>
                            </>
                          ) : (
                            <>
                              <HiOutlinePlay size={14} />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(d.id)}
                        disabled={updatingId === d.id}
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
