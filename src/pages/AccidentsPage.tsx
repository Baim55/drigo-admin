import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAccidents,
  createAccident,
  updateAccident,
  deleteAccident,
} from "../api/accidents";
import type { Accident, AccidentStatus, FaultParty } from "../types/accident";
import {
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineExclamationCircle,
  HiOutlineTrash,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

const STATUSES: AccidentStatus[] = [
  "Reported",
  "UnderReview",
  "Resolved",
  "Closed",
];
const FAULTS: FaultParty[] = ["Customer", "ThirdParty", "Unknown"];

const STATUS_STYLES: Record<AccidentStatus, string> = {
  Reported: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",
  UnderReview: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/80",
  Resolved: "bg-green-50 text-green-700 ring-1 ring-green-200/80",
  Closed: "bg-slate-100 text-slate-500 ring-1 ring-slate-200/80",
};

export default function AccidentsPage() {
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<AccidentStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [rentalId, setRentalId] = useState("");
  const [faultParty, setFaultParty] = useState<FaultParty>("Unknown");
  const [description, setDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const [editingId, setEditingId] = useState<number | null>(null);

  const pageSize = 15;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => {
    load();
  }, [page, status]);

  function load() {
    setLoading(true);
    setError("");
    getAccidents({ page, pageSize, status: status || undefined })
      .then((res) => {
        setAccidents(res.data);
        setTotal(res.total);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  function startEdit(a: Accident) {
    setEditingId(a.id);
    setRentalId(String(a.rentalId));
    setFaultParty(a.faultParty);
    setDescription(a.description);
    setEstimatedCost(String(a.estimatedCost));
    setLocation(a.location);
    setShowForm(true);
  }

  function resetForm() {
    setEditingId(null);
    setRentalId("");
    setFaultParty("Unknown");
    setDescription("");
    setEstimatedCost("");
    setLocation("");
    setShowForm(false);
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (editingId !== null) {
        await updateAccident(editingId, {
          faultParty,
          description,
          estimatedCost: Number(estimatedCost),
          location,
        });
      } else {
        await createAccident({
          rentalId: Number(rentalId),
          faultParty,
          description,
          estimatedCost: Number(estimatedCost),
          location,
        });
        setPage(1);
      }
      resetForm();
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusChange(id: number, newStatus: AccidentStatus) {
    setBusyId(id);
    setError("");
    try {
      await updateAccident(id, { status: newStatus });
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this accident record?")) return;
    setBusyId(id);
    setError("");
    try {
      await deleteAccident(id);
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
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Accidents Management
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Track, review and manage vehicle accident logs and claims.
          </p>
        </div>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-sm shadow-blue-600/20 transition"
        >
          {showForm ? (
            <HiOutlineXMark size={18} />
          ) : (
            <HiOutlinePlus size={18} />
          )}
          <span>{showForm ? "Cancel" : "Add Accident"}</span>
        </button>
      </div>

      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 custom-scrollbar">
        {(["", ...STATUSES] as (AccidentStatus | "")[]).map((s) => (
          <button
            key={s || "all"}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
              status === s
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            {s || "All Accidents"}
          </button>
        ))}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 transition-all">
          <h3 className="text-base font-bold text-slate-800 mb-4">
            {editingId !== null
              ? "Edit Accident Record"
              : "New Accident Record"}
          </h3>
          <form
            onSubmit={handleCreate}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Rental ID
              </label>
              <input
                type="number"
                required
                disabled={editingId !== null}
                value={rentalId}
                onChange={(e) => setRentalId(e.target.value)}
                placeholder="e.g. 1042"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Fault Party
              </label>
              <select
                value={faultParty}
                onChange={(e) => setFaultParty(e.target.value as FaultParty)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {FAULTS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Estimated Cost (AED)
              </label>
              <input
                type="number"
                required
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Location
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Sheikh Zayed Road"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Description
              </label>
              <input
                type="text"
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief summary of the incident..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="sm:col-span-full flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Record"
                    : "Save Record"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && (
        <div className="py-12 text-center text-slate-500 font-medium">
          Loading records...
        </div>
      )}
      {!loading && !error && accidents.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
          No accidents found.
        </div>
      )}

      {!loading && accidents.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-5 py-3.5 font-medium">ID</th>
                    <th className="px-5 py-3.5 font-medium">Rental</th>
                    <th className="px-5 py-3.5 font-medium">Fault</th>
                    <th className="px-5 py-3.5 font-medium">Cost</th>
                    <th className="px-5 py-3.5 font-medium">Location</th>
                    <th className="px-5 py-3.5 font-medium">Status</th>
                    <th className="px-5 py-3.5 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accidents.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">
                        #{a.id}
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          to={`/rentals/${a.rentalId}`}
                          className="text-blue-600 font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          #{a.rentalId}
                        </Link>
                      </td>
                      <td className="px-5 py-4 text-slate-600 font-medium">
                        {a.faultParty}
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {a.estimatedCost} {a.currency}
                      </td>
                      <td className="px-5 py-4 text-slate-600 max-w-xs truncate">
                        {a.location}
                      </td>
                      <td className="px-5 py-4">
                        <select
                          value={a.status}
                          disabled={busyId === a.id}
                          onChange={(e) =>
                            handleStatusChange(
                              a.id,
                              e.target.value as AccidentStatus,
                            )
                          }
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold border-0 cursor-pointer focus:ring-2 focus:ring-blue-500 ${STATUS_STYLES[a.status]}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-5 py-4 text-right space-x-2">
                        <button
                          onClick={() => startEdit(a)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition inline-flex items-center gap-1 text-xs font-semibold"
                          title="Edit"
                        >
                          <HiOutlinePencilSquare size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={busyId === a.id}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition inline-flex items-center gap-1 text-xs font-semibold disabled:opacity-50"
                          title="Delete"
                        >
                          <HiOutlineTrash size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-slate-200 gap-3">
            <p className="text-xs font-medium text-slate-500">
              Showing page{" "}
              <span className="font-bold text-slate-700">{page}</span> of{" "}
              <span className="font-bold text-slate-700">{totalPages}</span> (
              {total} total items)
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
