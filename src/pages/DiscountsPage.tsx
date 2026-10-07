import { useEffect, useState } from "react";
import {
  getDiscounts,
  toggleDiscountStatus,
  deleteDiscount,
} from "../api/discounts";
import type { Discount, DiscountStatus } from "../types/discount";

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
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Discounts</h1>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          Error: {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Audience</th>
                <th className="px-4 py-3 font-medium">Scope</th>
                <th className="px-4 py-3 font-medium">Usage</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {discounts.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-slate-50/70 transition-colors"
                >
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {d.name}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{formatValue(d)}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {d.targetAudience}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{d.scope}</td>
                  <td className="px-4 py-3 text-slate-600">
                    {d.usedCount}
                    {d.usageLimit !== null ? ` / ${d.usageLimit}` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[d.status]}`}
                    >
                      {d.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {(d.status === "Active" || d.status === "Paused") && (
                      <button
                        onClick={() => handleToggle(d)}
                        disabled={updatingId === d.id}
                        className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50 mr-3"
                      >
                        {d.status === "Active" ? "Pause" : "Activate"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(d.id)}
                      disabled={updatingId === d.id}
                      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
