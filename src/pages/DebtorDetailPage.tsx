import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getUserDebts, payAllDebts, payDebt, splitDebt } from "../api/debts";
import type { UserDebtSummary } from "../types/debt";
import {
  HiOutlineArrowLongLeft,
  HiOutlineExclamationCircle,
  HiOutlineCreditCard,
  HiOutlineCheckCircle,
} from "react-icons/hi2";

export default function DebtorDetailPage() {
  const { id } = useParams();
  const [summary, setSummary] = useState<UserDebtSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);

  const [actionId, setActionId] = useState<number | null>(null);
  const [actionError, setActionError] = useState("");

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

  async function handlePayOne(debtId: number) {
    if (!id) return;
    const confirmed = window.confirm("Mark this debt as paid?");
    if (!confirmed) return;

    setActionId(debtId);
    setActionError("");
    try {
      await payDebt(id, debtId);
      loadDebts();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionId(null);
    }
  }

  async function handleSplit(debtId: number) {
    if (!id) return;
    const input = window.prompt(
      "Split into how many installments? (2-12)",
      "2",
    );
    if (input === null) return;

    const installments = Number(input);
    if (
      !Number.isInteger(installments) ||
      installments < 2 ||
      installments > 12
    ) {
      setActionError("Installments must be a whole number between 2 and 12.");
      return;
    }

    setActionId(debtId);
    setActionError("");
    try {
      await splitDebt(id, debtId, installments);
      loadDebts();
    } catch (err) {
      setActionError((err as Error).message);
    } finally {
      setActionId(null);
    }
  }

  if (loading)
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Loading debtor details...
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

  if (!summary) return null;

  const unpaidDebts = summary.debts.filter((d) => !d.isPaid);
  const paidDebts = summary.debts.filter((d) => d.isPaid);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Link
        to="/debts"
        className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1.5"
      >
        <HiOutlineArrowLongLeft size={20} />
        <span>Back to debtors</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HiOutlineCreditCard className="text-red-500" size={26} />
              <span>
                Total Debt: {summary.totalDebt} {summary.currency}
              </span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1">
              {unpaidDebts.length} unpaid item(s) pending collection.
            </p>
          </div>
          {unpaidDebts.length > 0 && (
            <button
              onClick={handlePayAll}
              disabled={paying}
              className="inline-flex items-center justify-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
            >
              <HiOutlineCheckCircle size={18} />
              <span>{paying ? "Processing..." : "Pay All Debts"}</span>
            </button>
          )}
        </div>

        {actionError && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 mt-4 flex items-center gap-3">
            <HiOutlineExclamationCircle size={20} className="shrink-0" />
            <span>Error: {actionError}</span>
          </div>
        )}
      </div>

      {unpaidDebts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-6 pt-6 pb-3">
            Unpaid Debts ({unpaidDebts.length})
          </h2>
          <div className="overflow-x-auto custom-scrollbar">
            <DebtTable
              debts={unpaidDebts}
              showActions
              actionId={actionId}
              onPay={handlePayOne}
              onSplit={handleSplit}
            />
          </div>
        </div>
      )}

      {paidDebts.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-6 pt-6 pb-3">
            Paid History ({paidDebts.length})
          </h2>
          <div className="overflow-x-auto custom-scrollbar">
            <DebtTable debts={paidDebts} />
          </div>
        </div>
      )}
    </div>
  );
}

function DebtTable({
  debts,
  showActions = false,
  actionId = null,
  onPay,
  onSplit,
}: {
  debts: UserDebtSummary["debts"];
  showActions?: boolean;
  actionId?: number | null;
  onPay?: (debtId: number) => void;
  onSplit?: (debtId: number) => void;
}) {
  return (
    <table className="w-full text-sm text-left min-w-[600px]">
      <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
        <tr>
          <th className="px-6 py-3.5">Type</th>
          <th className="px-6 py-3.5">Description</th>
          <th className="px-6 py-3.5">Rental</th>
          <th className="px-6 py-3.5">Amount</th>
          {showActions && <th className="px-6 py-3.5 text-right">Actions</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {debts.map((d) => (
          <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
            <td className="px-6 py-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                {d.type}
              </span>
            </td>
            <td className="px-6 py-4 text-slate-600 font-medium">
              {d.description ?? "-"}
            </td>
            <td className="px-6 py-4">
              {d.rentalId ? (
                <Link
                  to={`/rentals/${d.rentalId}`}
                  className="text-blue-600 font-semibold hover:underline"
                >
                  #{d.rentalId}
                </Link>
              ) : (
                "-"
              )}
            </td>
            <td className="px-6 py-4 font-bold text-slate-900">
              {d.amount} {d.currency}
            </td>
            {showActions && (
              <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                <button
                  onClick={() => onSplit?.(d.id)}
                  disabled={actionId === d.id}
                  className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition disabled:opacity-50"
                >
                  Split
                </button>
                <button
                  onClick={() => onPay?.(d.id)}
                  disabled={actionId === d.id}
                  className="text-xs font-semibold px-4 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-xs"
                >
                  {actionId === d.id ? "..." : "Pay"}
                </button>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
