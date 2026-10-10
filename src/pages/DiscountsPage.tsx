import { useEffect, useState } from "react";
import {
  getDiscounts,
  toggleDiscountStatus,
  deleteDiscount,
} from "../api/discounts";
import type { Discount, DiscountStatus } from "../types/discount";
import {
  HiOutlineTag,
  HiOutlineExclamationCircle,
  HiOutlineTrash,
  HiOutlinePlay,
  HiOutlinePause,
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

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
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
                      {(d.status === "Active" || d.status === "Paused") && (
                        <button
                          onClick={() => handleToggle(d)}
                          disabled={updatingId === d.id}
                          className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 disabled:opacity-50"
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
