import { useEffect, useState } from "react";
import {
  getTripFee,
  updateTripFee,
  getExcessKmCharge,
  updateExcessKmCharge,
} from "../api/settings";

export default function SettingsPage() {
  const [tripFee, setTripFee] = useState("");
  const [tripFeeActive, setTripFeeActive] = useState(true);
  const [excessKm, setExcessKm] = useState("");
  const [excessKmActive, setExcessKmActive] = useState(true);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingTripFee, setSavingTripFee] = useState(false);
  const [savingExcessKm, setSavingExcessKm] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    Promise.all([getTripFee(), getExcessKmCharge()])
      .then(([fee, km]) => {
        setTripFee(String(fee.amount));
        setTripFeeActive(fee.isActive);
        setExcessKm(String(km.pricePerKm));
        setExcessKmActive(km.isActive);
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  async function handleSaveTripFee(e: React.FormEvent) {
    e.preventDefault();
    setSavingTripFee(true);
    setError("");
    setSavedMessage("");
    try {
      await updateTripFee({ amount: Number(tripFee), isActive: tripFeeActive });
      const fresh = await getTripFee();
      setTripFee(String(fresh.amount));
      setTripFeeActive(fresh.isActive);
      setSavedMessage("Trip fee saved.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingTripFee(false);
    }
  }

  async function handleSaveExcessKm(e: React.FormEvent) {
    e.preventDefault();
    setSavingExcessKm(true);
    setError("");
    setSavedMessage("");
    try {
      await updateExcessKmCharge({
        pricePerKm: Number(excessKm),
        isActive: excessKmActive,
      });
      const fresh = await getExcessKmCharge();
      setExcessKm(String(fresh.pricePerKm));
      setExcessKmActive(fresh.isActive);
      setSavedMessage("Excess KM charge saved.");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingExcessKm(false);
    }
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Settings</h1>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 mb-4">
          Error: {error}
        </div>
      )}
      {savedMessage && (
        <div className="rounded-md bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700 mb-4">
          {savedMessage}
        </div>
      )}

      <form
        onSubmit={handleSaveTripFee}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6"
      >
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Trip fee
        </h2>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Amount (AED)
            </label>
            <input
              type="number"
              step="0.01"
              value={tripFee}
              onChange={(e) => setTripFee(e.target.value)}
              className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 pb-2">
            <input
              type="checkbox"
              checked={tripFeeActive}
              onChange={(e) => setTripFeeActive(e.target.checked)}
              className="rounded border-slate-300"
            />
            Active
          </label>
          <button
            type="submit"
            disabled={savingTripFee}
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md disabled:opacity-50 transition"
          >
            {savingTripFee ? "Saving..." : "Save"}
          </button>
        </div>
      </form>

      <form
        onSubmit={handleSaveExcessKm}
        className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6"
      >
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Excess KM charge
        </h2>
        <div className="flex items-end gap-3">
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Price per KM (AED)
            </label>
            <input
              type="number"
              step="0.01"
              value={excessKm}
              onChange={(e) => setExcessKm(e.target.value)}
              className="w-32 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-slate-600 pb-2">
            <input
              type="checkbox"
              checked={excessKmActive}
              onChange={(e) => setExcessKmActive(e.target.checked)}
              className="rounded border-slate-300"
            />
            Active
          </label>
          <button
            type="submit"
            disabled={savingExcessKm}
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md disabled:opacity-50 transition"
          >
            {savingExcessKm ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
