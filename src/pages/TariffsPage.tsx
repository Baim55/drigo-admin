import { useEffect, useState } from "react";
import {
  getTariffPackages,
  createTariffPackage,
  deleteTariffPackage,
  updateTariffPackage,
} from "../api/tariffs";
import type { TariffPackage } from "../types/tariff";
import {
  HiOutlineDocumentDuplicate,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineExclamationCircle,
  HiOutlineTrash,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

const TIME_UNITS = ["Hour", "Day", "Month"];

export default function TariffsPage() {
  const [packages, setPackages] = useState<TariffPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [unitCount, setUnitCount] = useState(1);
  const [timeUnit, setTimeUnit] = useState("Hour");
  const [price, setPrice] = useState<number | "">(0);

  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getTariffPackages()
      .then(setPackages)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId !== null) {
        await updateTariffPackage(editingId, { unitCount, timeUnit, price });
      } else {
        await createTariffPackage({ unitCount, timeUnit, price });
      }
      closeForm();
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  function startEdit(pkg: TariffPackage) {
    setEditingId(pkg.id);
    setUnitCount(pkg.unitCount);
    setTimeUnit(pkg.timeUnit);
    setPrice(pkg.price);
    setShowForm(true);
  }

  function closeForm() {
    setEditingId(null);
    setUnitCount(1);
    setTimeUnit("Hour");
    setPrice(0);
    setShowForm(false);
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Delete this tariff package?");
    if (!confirmed) return;

    setDeletingId(id);
    setError("");
    try {
      await deleteTariffPackage(id);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading)
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Loading tariffs...
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineDocumentDuplicate className="text-blue-600" size={28} />
            <span>Tariff Packages</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage pricing packages, duration units, and regional limitations.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-sm shadow-blue-600/20 transition"
        >
          {showForm ? (
            <HiOutlineXMark size={18} />
          ) : (
            <HiOutlinePlus size={18} />
          )}
          <span>{showForm ? "Cancel" : "Add Package"}</span>
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
          onSubmit={handleCreate}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4"
        >
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Unit count
            </label>
            <input
              type="number"
              min={1}
              value={unitCount}
              onChange={(e) => setUnitCount(Number(e.target.value))}
              className="w-24 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Time unit
            </label>
            <select
              value={timeUnit}
              onChange={(e) => setTimeUnit(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {TIME_UNITS.map((u) => (
                <option key={u} value={u}>
                  {u}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Price (AED)
            </label>
            <input
              type="number"
              min={0}
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl disabled:opacity-50 transition shadow-sm"
            >
              {saving ? "Saving..." : "Save Package"}
            </button>
          </div>
        </form>
      )}

      {packages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 font-medium">
          No tariff packages found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[650px]">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Package</th>
                  <th className="px-6 py-3.5">Price</th>
                  <th className="px-6 py-3.5">Countries</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {packages.map((pkg) => (
                  <tr
                    key={pkg.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {pkg.unitCount} {pkg.timeUnit}
                      {pkg.unitCount > 1 ? "s" : ""}
                    </td>
                    <td className="px-6 py-4 font-semibold text-emerald-600">
                      {pkg.price} {pkg.currency}
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                      {pkg.countries.map((c) => c.code).join(", ") || "All"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          pkg.isActive
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                        }`}
                      >
                        {pkg.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => startEdit(pkg)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                      >
                        <HiOutlinePencilSquare size={16} />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(pkg.id)}
                        disabled={deletingId === pkg.id}
                        className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1 disabled:opacity-50"
                      >
                        <HiOutlineTrash size={16} />
                        <span>
                          {deletingId === pkg.id ? "Deleting..." : "Delete"}
                        </span>
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
