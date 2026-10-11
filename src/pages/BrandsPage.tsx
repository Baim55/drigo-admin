import { useEffect, useState } from "react";
import { getBrands, createBrand, deleteBrand } from "../api/brands";
import type { Brand } from "../api/brands";
import {
  HiOutlinePlus,
  HiOutlineBuildingStorefront,
  HiOutlineTrash,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";
import { Link } from "react-router-dom";

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getBrands()
      .then((res) => setBrands(res.data))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError("");
    try {
      await createBrand(name.trim());
      setName("");
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this brand?")) return;
    setDeletingId(id);
    setError("");
    try {
      await deleteBrand(id);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Brands Management
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Manage vehicle manufacturers and brands available in the fleet.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <form
          onSubmit={handleCreate}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <HiOutlineBuildingStorefront
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              size={20}
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="New brand name (e.g. Tesla, Porsche)"
              className="w-full rounded-xl border border-slate-300 pl-11 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving || !name.trim()}
            className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl disabled:opacity-50 transition shadow-sm shadow-blue-600/20"
          >
            <HiOutlinePlus size={18} />
            <span>{saving ? "Adding..." : "Add Brand"}</span>
          </button>
        </form>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 font-medium">
          Loading brands...
        </div>
      ) : brands.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          No brands found.
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[500px]">
              <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Brand Name</th>
                  <th className="px-6 py-3.5">Associated Cars</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {brands.map((b) => (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs">
                        {b.name.charAt(0)}
                      </div>
                      <Link
                        to={`/brands/${b.id}`}
                        className="hover:text-blue-600 hover:underline"
                      >
                        {b.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-slate-600 font-medium">
                      {b.carCount} cars
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          b.isActive
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                            : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                        }`}
                      >
                        {b.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(b.id)}
                        disabled={deletingId === b.id}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition inline-flex items-center gap-1 text-xs font-semibold disabled:opacity-50"
                        title="Delete"
                      >
                        <HiOutlineTrash size={18} />
                        <span>
                          {deletingId === b.id ? "Deleting..." : "Delete"}
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
