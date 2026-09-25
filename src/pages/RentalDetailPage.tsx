import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getRentalById, endRental } from "../api/rentals";
import type { RentalDetail } from "../types/rental";

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

  if (loading) return <p className="text-slate-500">Loading...</p>;

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!rental) return null;

  const canEnd = rental.status === "Active" || rental.status === "Started";

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/rentals"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to rentals
      </Link>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Rental #{rental.id}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {rental.user.fullName} · {rental.user.phoneNumber}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
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
                className="text-sm font-medium px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
              >
                {ending ? "Ending..." : "End rental"}
              </button>
            )}
          </div>
        </div>

        {rental.problemNote && (
          <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-700 mb-2">
            Note: {rental.problemNote}
          </div>
        )}
        {rental.cancelReason && (
          <div className="rounded-md bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-600">
            Cancelled: {rental.cancelReason}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Trip
          </h2>
          <dl className="space-y-2 text-sm">
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

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Payment
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Total price" value={`${rental.totalPrice} AED`} />
            <Row label="Discount" value={`${rental.discountAmount} AED`} />
            <Row
              label="Total debt"
              value={
                rental.totalDebt > 0 ? (
                  <span className="text-red-600 font-medium">
                    {rental.totalDebt} AED
                  </span>
                ) : (
                  "0 AED"
                )
              }
            />
            {rental.paymentRetryState && (
              <div className="mt-3 pt-3 border-t border-slate-100">
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-2">
                  Payment retry
                </p>
                <dl className="space-y-1 text-sm">
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

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Action history
        </h2>
        {rental.actionHistory.length === 0 ? (
          <p className="text-sm text-slate-400">No history.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {rental.actionHistory.map((item) => (
              <li
                key={item.id}
                className="flex justify-between border-b border-slate-50 pb-2 last:border-0"
              >
                <span className="text-slate-700 font-medium">
                  {item.action}
                </span>
                <span className="text-slate-400 text-xs">
                  {new Date(item.at).toLocaleString()} · {item.by}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Customer's rental history
        </h2>
        {rental.userRentalHistory.length === 0 ? (
          <p className="text-sm text-slate-400">No other rentals.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-2 pr-4 font-medium">ID</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-4 font-medium">Start</th>
                  <th className="py-2 font-medium">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rental.userRentalHistory.map((h) => (
                  <tr key={h.id}>
                    <td className="py-2 pr-4">
                      <Link
                        to={`/rentals/${h.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        #{h.id}
                      </Link>
                    </td>
                    <td className="py-2 pr-4">{h.status}</td>
                    <td className="py-2 pr-4 text-slate-600">
                      {new Date(h.startDate).toLocaleDateString()}
                    </td>
                    <td className="py-2 text-slate-600">{h.totalPrice} AED</td>
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
    <div className="flex justify-between py-1 border-b border-slate-50 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}
