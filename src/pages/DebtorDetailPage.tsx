import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserDebts, payAllDebts } from "../api/debts";
import type { UserDebtSummary } from "../types/debt";

export default function DebtorDetailPage() {
  const { id } = useParams();
  const [summary, setSummary] = useState<UserDebtSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadDebts();
  }, [id]);

  function loadDebts() {
    if (!id) return;
    setLoading(true);
    getUserDebts(id)
      .then(setSummary)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  async function handlePayAll() {
    if (!id) return;
    const confirmed = window.confirm(
      `Mark all unpaid debts as paid for this customer?`,
    );
    if (!confirmed) return;

    setPaying(true);
    setError("");
    try {
      await payAllDebts(id);
      loadDebts();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPaying(false);
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

  if (!summary) return null;

  const unpaidDebts = summary.debts.filter((d) => !d.isPaid);
  const paidDebts = summary.debts.filter((d) => d.isPaid);

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/debts"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to debtors
      </Link>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Total debt: {summary.totalDebt} {summary.currency}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {unpaidDebts.length} unpaid item(s)
            </p>
          </div>
          {unpaidDebts.length > 0 && (
            <button
              onClick={handlePayAll}
              disabled={paying}
              className="text-sm font-medium px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
            >
              {paying ? "Processing..." : "Pay all"}
            </button>
          )}
        </div>
      </div>

      {unpaidDebts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden mb-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide px-6 pt-6 pb-2">
            Unpaid
          </h2>
          <DebtTable debts={unpaidDebts} />
        </div>
      )}

      {paidDebts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide px-6 pt-6 pb-2">
            Paid
          </h2>
          <DebtTable debts={paidDebts} />
        </div>
      )}
    </div>
  );
}

function DebtTable({ debts }: { debts: UserDebtSummary["debts"] }) {
  return (
    <table className="w-full text-sm">
      <thead className="text-left text-slate-500 border-b border-slate-100">
        <tr>
          <th className="px-6 py-2 font-medium">Type</th>
          <th className="px-6 py-2 font-medium">Description</th>
          <th className="px-6 py-2 font-medium">Rental</th>
          <th className="px-6 py-2 font-medium">Amount</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {debts.map((d) => (
          <tr key={d.id}>
            <td className="px-6 py-3">
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                {d.type}
              </span>
            </td>
            <td className="px-6 py-3 text-slate-600">{d.description ?? "-"}</td>
            <td className="px-6 py-3">
              {d.rentalId ? (
                <Link
                  to={`/rentals/${d.rentalId}`}
                  className="text-blue-600 hover:underline"
                >
                  #{d.rentalId}
                </Link>
              ) : (
                "-"
              )}
            </td>
            <td className="px-6 py-3 font-medium text-slate-800">
              {d.amount} {d.currency}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
