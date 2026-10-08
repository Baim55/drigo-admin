import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getMonthlyReport } from "../api/analytics";
import type { MonthlyReport } from "../types/analytics";

export default function AnalyticsPage() {
  const [report, setReport] = useState<MonthlyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getMonthlyReport(6)
      .then(setReport)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading...</p>;

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!report) return null;

  const chartData = report.months.map((m) => ({
    month: m.month,
    revenue: m.revenue.total,
    netRevenue: m.netRevenue,
    operatingCost: m.operatingCost,
    rentals: m.rentals.total,
    debtAdded: m.debt.added,
    debtCollected: m.debt.collected,
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Analytics & Monthly Report
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <SummaryCard
          label="Total revenue"
          value={`${report.totals.revenue.toLocaleString()} ${report.totals.currency}`}
        />
        <SummaryCard
          label="Net revenue"
          value={`${report.totals.netRevenue.toLocaleString()} ${report.totals.currency}`}
        />
        <SummaryCard
          label="Fines billed"
          value={`${report.totals.finesBilled.toLocaleString()} ${report.totals.currency}`}
        />
        <SummaryCard
          label="Debt collected"
          value={`${report.totals.debtCollected.toLocaleString()} ${report.totals.currency}`}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Revenue vs operating cost
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              name="Revenue"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="netRevenue"
              stroke="#22c55e"
              name="Net revenue"
              strokeWidth={2}
            />
            <Line
              type="monotone"
              dataKey="operatingCost"
              stroke="#ef4444"
              name="Operating cost"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Rentals per month
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="rentals" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Debt added vs collected
          </h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar
                dataKey="debtAdded"
                fill="#ef4444"
                name="Added"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="debtCollected"
                fill="#22c55e"
                name="Collected"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide px-6 pt-6 pb-2">
          Monthly breakdown
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-slate-500 border-b border-slate-100">
              <tr>
                <th className="px-6 py-2 font-medium">Month</th>
                <th className="px-6 py-2 font-medium">Revenue</th>
                <th className="px-6 py-2 font-medium">Rentals</th>
                <th className="px-6 py-2 font-medium">Salik</th>
                <th className="px-6 py-2 font-medium">ENOC</th>
                <th className="px-6 py-2 font-medium">Fines billed</th>
                <th className="px-6 py-2 font-medium">Net revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {report.months.map((m) => (
                <tr key={m.month}>
                  <td className="px-6 py-3 font-medium text-slate-800">
                    {m.month}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {m.revenue.total.toLocaleString()} {m.revenue.currency}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {m.rentals.completed}/{m.rentals.total}
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {m.salik.total} AED
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {m.enoc.total.toFixed(0)} AED
                  </td>
                  <td className="px-6 py-3 text-slate-600">
                    {m.fines.billedTotal.toLocaleString()} AED
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-800">
                    {m.netRevenue.toLocaleString()} AED
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-slate-200 p-4">
      <p className="text-xs text-slate-500 uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-xl font-bold text-slate-800">{value}</p>
    </div>
  );
}
