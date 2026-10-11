import { Fragment, useEffect, useState } from "react";
import { getUserPayments, retryPayment } from "../api/payments";
import type { Payment } from "../types/payment";

export default function PaymentsCard({
  userId,
  onChanged,
}: {
  userId: string;
  onChanged?: () => void;
}) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryingId, setRetryingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, [userId]);

  function load() {
    setLoading(true);
    getUserPayments(userId)
      .then(setPayments)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  async function handleRetry(paymentId: number) {
    const confirmed = window.confirm("Retry this failed payment?");
    if (!confirmed) return;

    setRetryingId(paymentId);
    setError("");
    try {
      await retryPayment(userId, paymentId);
      load();
      onChanged?.();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setRetryingId(null);
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
        Customer payments
      </h2>

      {error && (
        <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600 mb-3">
          Error: {error}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-slate-400">Loading...</p>
      ) : payments.length === 0 ? (
        <p className="text-sm text-slate-400">No payments.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 border-b border-slate-100">
              <tr>
                <th className="py-2 pr-4 font-medium">ID</th>
                <th className="py-2 pr-4 font-medium">Type</th>
                <th className="py-2 pr-4 font-medium">Amount</th>
                <th className="py-2 pr-4 font-medium">Status</th>
                <th className="py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {payments.map((p) => (
                <Fragment key={p.id}>
                  <tr key={p.id}>
                    <td className="py-2 pr-4 font-mono text-xs">
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === p.id ? null : p.id)
                        }
                        className="text-blue-600 hover:underline"
                      >
                        #{p.id}
                      </button>
                    </td>
                    <td className="py-2 pr-4 text-slate-600">
                      {p.transactionType}
                    </td>
                    <td className="py-2 pr-4 text-slate-800 font-medium">
                      {p.amount} {p.currency}
                    </td>
                    <td className="py-2 pr-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.status === "Succeeded"
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-red-50 text-red-700 ring-1 ring-red-200"
                        }`}
                      >
                        {p.status}
                      </span>
                      {p.failureReason && (
                        <span className="text-xs text-red-500 ml-2">
                          {p.failureReason}
                        </span>
                      )}
                    </td>
                    <td className="py-2 text-right">
                      {p.status === "Failed" && (
                        <button
                          onClick={() => handleRetry(p.id)}
                          disabled={retryingId === p.id}
                          className="text-xs font-medium px-3 py-1 rounded-md bg-amber-500 text-white hover:bg-amber-600 disabled:opacity-50 transition"
                        >
                          {retryingId === p.id ? "Retrying..." : "Retry"}
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === p.id && (
                    <tr className="bg-slate-50">
                      <td colSpan={5} className="px-4 py-3">
                        <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                          <div>
                            <dt className="text-slate-400">Service fee</dt>
                            <dd className="font-medium text-slate-700">
                              {p.serviceFee} {p.currency}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-400">Final payment</dt>
                            <dd className="font-medium text-slate-700">
                              {p.isFinalPayment ? "Yes" : "No"}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-400">Period start</dt>
                            <dd className="font-medium text-slate-700">
                              {new Date(p.periodStart).toLocaleString()}
                            </dd>
                          </div>
                          <div>
                            <dt className="text-slate-400">Period end</dt>
                            <dd className="font-medium text-slate-700">
                              {p.periodEnd
                                ? new Date(p.periodEnd).toLocaleString()
                                : "-"}
                            </dd>
                          </div>
                          <div className="col-span-2 md:col-span-4">
                            <dt className="text-slate-400">Failure reason</dt>
                            <dd className="font-medium text-slate-700">
                              {p.failureReason ?? "None"}
                            </dd>
                          </div>
                        </dl>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
