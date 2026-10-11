import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRentalById, endRental, compKm } from "../api/rentals";
import type { RentalDetail } from "../types/rental";
<<<<<<< HEAD
import {
  HiOutlineArrowLongLeft,
  HiOutlineExclamationCircle,
  HiOutlineDocumentText,
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiOutlineClock,
} from "react-icons/hi2";
=======
import PaymentsCard from "../components/PaymentsCard";
>>>>>>> main

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Started: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
  Completed: "bg-green-50 text-green-700 ring-1 ring-green-200",
  PaymentPending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Cancelled: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  Accident: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export default function RentalDetailPage() {
  const { id } = useParams();
  const [rental, setRental] = useState<RentalDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ending, setEnding] = useState(false);
  const [compInput, setCompInput] = useState("");
  const [compSaving, setCompSaving] = useState(false);
  const [compError, setCompError] = useState("");

  useEffect(() => {
    if (!id) return;
    loadRental();
  }, [id]);

  function loadRental() {
    if (!id) return;
    setLoading(true);
    getRentalById(Number(id))
      .then(setRental)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  async function handleEndRental() {
    if (!id) return;
    const confirmed = window.confirm(
      "End this rental now? This will settle the final payment and free the car.",
    );
    if (!confirmed) return;

    setEnding(true);
    setError("");
    try {
      await endRental(Number(id));
      loadRental();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setEnding(false);
    }
  }

  async function handleCompKm(e: React.FormEvent) {
    e.preventDefault();
    if (!id) return;

    const distance = Number(compInput);
    if (!Number.isFinite(distance) || distance <= 0) {
      setCompError("Enter a distance greater than 0.");
      return;
    }

    setCompSaving(true);
    setCompError("");
    try {
      await compKm(Number(id), distance);
      setCompInput("");
      loadRental();
    } catch (err) {
      setCompError((err as Error).message);
    } finally {
      setCompSaving(false);
    }
  }

  if (loading)
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Loading rental details...
      </div>
    );

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
        <HiOutlineExclamationCircle size={20} className="shrink-0" />
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!rental) return null;

  const canEnd = rental.status === "Active" || rental.status === "Started";

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Link
        to="/rentals"
        className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1.5"
      >
        <HiOutlineArrowLongLeft size={20} />
        <span>Back to rentals</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HiOutlineDocumentText className="text-blue-600" size={26} />
              <span>Rental #{rental.id}</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {rental.user.fullName} · {rental.user.phoneNumber}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${
                STATUS_STYLES[rental.status] ??
                "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
              }`}
            >
              {rental.status}
            </span>
            {canEnd && (
              <button
                onClick={handleEndRental}
                disabled={ending}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
              >
                {ending ? "Ending..." : "End rental"}
              </button>
            )}
          </div>
        </div>

        {rental.problemNote && (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-700 mt-4">
            <span className="font-bold">Note:</span> {rental.problemNote}
          </div>
        )}
        {rental.cancelReason && (
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-sm text-slate-600 mt-4">
            <span className="font-bold">Cancelled:</span> {rental.cancelReason}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <HiOutlineTruck size={18} className="text-blue-600" />
            <span>Trip information</span>
          </h2>
          <dl className="space-y-2.5 text-sm">
            <Row
              label="Started"
              value={new Date(rental.startDate).toLocaleString()}
            />
            <Row
              label="Ended"
              value={
                rental.endDate
                  ? new Date(rental.endDate).toLocaleString()
                  : "In progress"
              }
            />
            <Row
              label="Distance"
              value={`${rental.totalDistance.toFixed(1)} km`}
            />
            <Row label="Tariff" value={rental.tariff?.packageName ?? "N/A"} />
            <Row label="Insurance" value={rental.insurance?.name ?? "None"} />
          </dl>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <HiOutlineCreditCard size={18} className="text-blue-600" />
            <span>Payment summary</span>
          </h2>
          <dl className="space-y-2.5 text-sm">
            <Row label="Total price" value={`${rental.totalPrice} AED`} />
            <Row label="Discount" value={`${rental.discountAmount} AED`} />
            <Row
              label="Total debt"
              value={
                rental.totalDebt > 0 ? (
                  <span className="font-bold text-red-600">
                    {rental.totalDebt} AED
                  </span>
                ) : (
                  "0 AED"
                )
              }
            />
            {rental.paymentRetryState && (
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">
                  Payment retry state
                </p>
                <dl className="space-y-1.5 text-sm">
                  <Row
                    label="Attempts"
                    value={rental.paymentRetryState.attempts}
                  />
                  <Row
                    label="Last error"
                    value={rental.paymentRetryState.lastError}
                  />
                  <Row
                    label="Amount due"
                    value={`${rental.paymentRetryState.amountDue} AED`}
                  />
                  <Row
                    label="Next retry"
                    value={
                      rental.paymentRetryState.nextRetryAt
                        ? new Date(
                            rental.paymentRetryState.nextRetryAt,
                          ).toLocaleString()
                        : "N/A"
                    }
                  />
                </dl>
              </div>
            )}
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Distance compensation
        </h2>
        <p className="text-sm text-slate-600 mb-4 font-medium">
          Compensation given so far:{" "}
          <span className="font-bold text-slate-900">
            {rental.compensationDistanceTotal ?? 0} km
          </span>
        </p>
        {compError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-3.5 text-sm text-red-600 mb-4">
            Error: {compError}
          </div>
        )}
        <form
          onSubmit={handleCompKm}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="number"
            min="0"
            step="0.1"
            value={compInput}
            onChange={(e) => setCompInput(e.target.value)}
            placeholder="Extra km to give"
            className="w-full sm:w-64 rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={compSaving || !compInput}
            className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl disabled:opacity-50 transition shadow-sm"
          >
            {compSaving ? "Saving..." : "Add compensation"}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <HiOutlineClock size={18} className="text-blue-600" />
          <span>Action history</span>
        </h2>
        {rental.actionHistory.length === 0 ? (
          <p className="text-sm text-slate-400">No history.</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {rental.actionHistory.map((item) => (
              <li
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2.5 last:border-0 gap-1"
              >
                <span className="text-slate-800 font-semibold">
                  {item.action}
                </span>
                <span className="text-slate-400 text-xs font-medium">
                  {new Date(item.at).toLocaleString()} · {item.by}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
          Customer's rental history
        </h2>
        {rental.userRentalHistory.length === 0 ? (
          <p className="text-sm text-slate-400">No other rentals.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[500px]">
              <thead className="text-slate-500 border-b border-slate-100 text-xs uppercase tracking-wider">
                <tr>
                  <th className="py-3 pr-4 font-semibold">ID</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 pr-4 font-semibold">Start</th>
                  <th className="py-3 font-semibold">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rental.userRentalHistory.map((h) => (
                  <tr
                    key={h.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-3.5 pr-4 font-bold">
                      <Link
                        to={`/rentals/${h.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        #{h.id}
                      </Link>
                    </td>
                    <td className="py-3.5 pr-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLES[h.status] || "bg-slate-100 text-slate-600"}`}
                      >
                        {h.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-4 text-slate-600 font-medium">
                      {new Date(h.startDate).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 text-slate-900 font-semibold">
                      {h.totalPrice} AED
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
      <dt className="text-slate-500 font-medium">{label}</dt>
      <dd className="font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
