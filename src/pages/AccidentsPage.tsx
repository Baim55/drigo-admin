import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAccidents,
  createAccident,
  updateAccident,
  deleteAccident,
} from "../api/accidents";
import type { Accident, AccidentStatus, FaultParty } from "../types/accident";

const STATUSES: AccidentStatus[] = [
  "Reported",
  "UnderReview",
  "Resolved",
  "Closed",
];
const FAULTS: FaultParty[] = ["Customer", "ThirdParty", "Unknown"];

const STATUS_STYLES: Record<AccidentStatus, string> = {
  Reported: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  UnderReview: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Resolved: "bg-green-50 text-green-700 ring-1 ring-green-200",
  Closed: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Accidents</h1>
        <button
          onClick={() => (showForm ? resetForm() : setShowForm(true))}
          className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md transition"
        >
          {showForm ? "Cancel" : "+ Add accident"}
        </button>
      </div>

      <div className="flex flex-wrap gap-1 mb-4">
        {(["", ...STATUSES] as (AccidentStatus | "")[]).map((s) => (
          <button
            key={s || "all"}
            onClick={() => {
              setStatus(s);
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
              status === s
                ? "bg-slate-800 text-white"
                : "bg-white text-slate-600 border border-slate-300 hover:bg-slate-50"
            }`}
          >
            {s || "All"}
          </button>
        ))}
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
              Rental ID
            </label>
            <input
              type="number"
              required
              disabled={editingId !== null}
              value={rentalId}
              onChange={(e) => setRentalId(e.target.value)}
              className="w-28 rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Fault party
            </label>
            <select
              value={faultParty}
              onChange={(e) => setFaultParty(e.target.value as FaultParty)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              {FAULTS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Estimated cost (AED)
            </label>
            <input
              type="number"
              required
              value={estimatedCost}
              onChange={(e) => setEstimatedCost(e.target.value)}
              className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Location
            </label>
            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-slate-500 mb-1">
              Description
            </label>
            <input
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="text-sm font-medium text-white bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md disabled:opacity-50 transition"
          >
            {saving ? "Saving..." : editingId !== null ? "Update" : "Create"}
          </button>
        </form>
      )}

      {loading && <p className="text-slate-500">Loading...</p>}
      {!loading && !error && accidents.length === 0 && (
        <p className="text-slate-500">No accidents found.</p>
      )}

      {!loading && accidents.length > 0 && (
        <>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 font-medium">ID</th>
                    <th className="px-4 py-3 font-medium">Rental</th>
                    <th className="px-4 py-3 font-medium">Fault</th>
                    <th className="px-4 py-3 font-medium">Cost</th>
                    <th className="px-4 py-3 font-medium">Location</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {accidents.map((a) => (
                    <tr
                      key={a.id}
                      className="hover:bg-slate-50/70 transition-colors"
                    >
                      <td className="px-4 py-3 text-slate-400 font-mono text-xs">
                        #{a.id}
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/rentals/${a.rentalId}`}
                          className="text-blue-600 hover:underline"
                        >
                          #{a.rentalId}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {a.faultParty}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {a.estimatedCost} {a.currency}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{a.location}</td>
                      <td className="px-4 py-3">
                        <select
                          value={a.status}
                          disabled={busyId === a.id}
                          onChange={(e) =>
                            handleStatusChange(
                              a.id,
                              e.target.value as AccidentStatus,
                            )
                          }
                          className={`rounded-full px-2 py-1 text-xs font-medium border-0 ${STATUS_STYLES[a.status]}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => startEdit(a)}
                          className="text-xs font-medium text-blue-600 hover:underline mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(a.id)}
                          disabled={busyId === a.id}
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

          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-slate-500">
              Total {total} accidents, page {page}/{totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1.5 text-sm rounded-md border border-slate-300 disabled:opacity-40 hover:bg-slate-50 transition"
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
