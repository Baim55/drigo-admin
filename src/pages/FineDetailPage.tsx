import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getFineById,
  billFineToCustomer,
  billFineToCompany,
  dismissFine,
} from "../api/fines";
import type { Fine } from "../types/fine";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Review: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Billed: "bg-green-50 text-green-700 ring-1 ring-green-200",
  Dismissed: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
};

export default function FineDetailPage() {
  const { id } = useParams();
  const [fine, setFine] = useState<Fine | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadFine();
  }, [id]);

  function loadFine() {
    if (!id) return;
    setLoading(true);
    getFineById(Number(id))
      .then(setFine)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  async function handleAction(action: "customer" | "company" | "dismiss") {
    if (!id) return;

    const messages = {
      customer: "Bill this fine to the customer? This will create a debt.",
      company: "Bill this fine to the company?",
      dismiss: "Dismiss this fine? It will not be billed to anyone.",
    };
    const confirmed = window.confirm(messages[action]);
    if (!confirmed) return;

    setProcessing(true);
    setError("");
    try {
      if (action === "customer") await billFineToCustomer(Number(id));
      else if (action === "company") await billFineToCompany(Number(id));
      else await dismissFine(Number(id));
      loadFine();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(false);
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

  if (!fine) return null;

  const canAct = fine.status === "Pending" || fine.status === "Review";

  return (
    <div className="max-w-8xl mx-auto">
      <Link
        to="/fines"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to fines
      </Link>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {fine.referenceNumber}
            </h1>
            <p className="text-sm text-slate-500 mt-1">{fine.type}</p>
          </div>
          <span
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
              STATUS_STYLES[fine.status] ?? "bg-slate-100 text-slate-600"
            }`}
          >
            {fine.status}
          </span>
        </div>

        <dl className="space-y-2 text-sm mb-6">
          <Row label="Amount" value={`${fine.amount} ${fine.currency}`} />
          <Row label="Car plate" value={fine.plateNumber} />
          <Row
            label="Rental"
            value={
              fine.rentalId ? (
                <Link
                  to={`/rentals/${fine.rentalId}`}
                  className="text-blue-600 hover:underline"
                >
                  #{fine.rentalId}
                </Link>
              ) : (
                "N/A"
              )
            }
          />
          <Row label="Source" value={fine.source} />
          <Row label="Location" value={fine.location} />
          <Row
            label="Fine date"
            value={new Date(fine.fineDate).toLocaleString()}
          />
          <Row label="Billed to" value={fine.billedTo ?? "Not billed"} />
        </dl>

        {canAct && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleAction("customer")}
              disabled={processing}
              className="text-sm font-medium px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
            >
              Bill to customer
            </button>
            <button
              onClick={() => handleAction("company")}
              disabled={processing}
              className="text-sm font-medium px-4 py-2 rounded-md bg-slate-600 text-white hover:bg-slate-700 disabled:opacity-50 transition"
            >
              Bill to company
            </button>
            <button
              onClick={() => handleAction("dismiss")}
              disabled={processing}
              className="text-sm font-medium px-4 py-2 rounded-md border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition"
            >
              Dismiss
            </button>
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
