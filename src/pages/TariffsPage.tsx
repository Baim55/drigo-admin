import { useEffect, useState } from "react";
import {
  getTariffPackages,
  createTariffPackage,
  deleteTariffPackage,
} from "../api/tariffs";
import type { TariffPackage } from "../types/tariff";

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
      await createTariffPackage({
        unitCount,
        timeUnit,
        price: price === "" ? 0 : Number(price),
      });
      setShowForm(false);
      setUnitCount(1);
      setTimeUnit("Hour");
      setPrice(0);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
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

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Tariff Packages</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition"
        >
          {showForm ? "Cancel" : "+ Add package"}
        </button>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          Error: {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6 flex flex-wrap items-end gap-3"
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
              onChange={(e) =>
                setPrice(e.target.value === "" ? "" : Number(e.target.value))
              }
              className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : "Create"}
          </button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium">Package</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Countries</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {packages.map((pkg) => (
              <tr
                key={pkg.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-slate-800">
                  {pkg.unitCount} {pkg.timeUnit}
                  {pkg.unitCount > 1 ? "s" : ""}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {pkg.price} {pkg.currency}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  {pkg.countries.map((c) => c.code).join(", ")}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      pkg.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {pkg.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    disabled={deletingId === pkg.id}
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingId === pkg.id ? "Deleting..." : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
