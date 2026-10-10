import { useEffect, useState } from "react";
import {
  getTripFee,
  updateTripFee,
  getExcessKmCharge,
  updateExcessKmCharge,
} from "../api/settings";
import {
  HiOutlineCog6Tooth,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineCurrencyDollar,
  HiOutlineTruck,
} from "react-icons/hi2";

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

  if (loading)
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Loading settings...
      </div>
    );

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HiOutlineCog6Tooth className="text-blue-600" size={28} />
          <span>Platform Settings</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Configure global parameters, trip fees, and excess mileage charges.
        </p>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {savedMessage && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-sm text-emerald-700 flex items-center gap-3">
          <HiOutlineCheckCircle size={20} className="shrink-0" />
          <span>{savedMessage}</span>
        </div>
      )}

      <form
        onSubmit={handleSaveTripFee}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4"
      >
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <HiOutlineCurrencyDollar size={18} className="text-blue-600" />
          <span>Trip Fee Configuration</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Amount (AED)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={tripFee}
              onChange={(e) => setTripFee(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-6 h-10">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={tripFeeActive}
                onChange={(e) => setTripFeeActive(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              Active
            </label>

            <button
              type="submit"
              disabled={savingTripFee}
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl disabled:opacity-50 transition shadow-sm"
            >
              {savingTripFee ? "Saving..." : "Save Trip Fee"}
            </button>
          </div>
        </div>
      </form>

      <form
        onSubmit={handleSaveExcessKm}
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4"
      >
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <HiOutlineTruck size={18} className="text-blue-600" />
          <span>Excess KM Charge Configuration</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">
              Price per KM (AED)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={excessKm}
              onChange={(e) => setExcessKm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center justify-between sm:justify-start gap-6 h-10">
            <label className="flex items-center gap-2.5 text-sm font-semibold text-slate-700 cursor-pointer">
              <input
                type="checkbox"
                checked={excessKmActive}
                onChange={(e) => setExcessKmActive(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              Active
            </label>

            <button
              type="submit"
              disabled={savingExcessKm}
              className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2 rounded-xl disabled:opacity-50 transition shadow-sm"
            >
              {savingExcessKm ? "Saving..." : "Save Excess KM"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
