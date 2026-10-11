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
import {
  HiOutlineCurrencyDollar,
  HiOutlineExclamationCircle,
  HiOutlineDocumentText,
} from "react-icons/hi2";
import { HiOutlineTrendingUp } from "react-icons/hi";

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
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
        <span>Error: {error}</span>
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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Analytics & Financial Reports
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Comprehensive overview of platform revenue, costs, and key performance
          trends.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Revenue"
          value={`${report.totals.revenue.toLocaleString()} ${report.totals.currency}`}
          icon={HiOutlineCurrencyDollar}
          color="bg-blue-50 text-blue-600"
        />
        <SummaryCard
          label="Net Revenue"
          value={`${report.totals.netRevenue.toLocaleString()} ${report.totals.currency}`}
          icon={HiOutlineTrendingUp}
          color="bg-emerald-50 text-emerald-600"
        />
        <SummaryCard
          label="Fines Billed"
          value={`${report.totals.finesBilled.toLocaleString()} ${report.totals.currency}`}
          icon={HiOutlineExclamationCircle}
          color="bg-amber-50 text-amber-600"
        />
        <SummaryCard
          label="Debt Collected"
          value={`${report.totals.debtCollected.toLocaleString()} ${report.totals.currency}`}
          icon={HiOutlineDocumentText}
          color="bg-purple-50 text-purple-600"
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
          Revenue vs Operating Cost Trend
        </h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                name="Revenue"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="netRevenue"
                stroke="#10b981"
                name="Net Revenue"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="operatingCost"
                stroke="#ef4444"
                name="Operating Cost"
                strokeWidth={2.5}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
            Rentals Per Month
          </h2>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Bar dataKey="rentals" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
            Debt Added vs Collected
          </h2>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: "12px",
                    border: "1px solid #e2e8f0",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="debtAdded"
                  fill="#ef4444"
                  name="Added"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="debtCollected"
                  fill="#10b981"
                  name="Collected"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-6 pt-6 pb-2">
          Monthly Breakdown Details
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Month</th>
                <th className="px-6 py-3.5">Revenue</th>
                <th className="px-6 py-3.5">Rentals</th>
                <th className="px-6 py-3.5">Salik</th>
                <th className="px-6 py-3.5">ENOC</th>
                <th className="px-6 py-3.5">Fines Billed</th>
                <th className="px-6 py-3.5">Net Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.months.map((m) => (
                <tr
                  key={m.month}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-800">
                    {m.month}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {m.revenue.total.toLocaleString()} {m.revenue.currency}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="font-semibold text-slate-800">
                      {m.rentals.completed}
                    </span>{" "}
                    / {m.rentals.total}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {m.salik.total} AED
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {m.enoc.total.toFixed(0)} AED
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    {m.fines.billedTotal.toLocaleString()} AED
                  </td>
                  <td className="px-6 py-4 font-bold text-emerald-600">
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

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: any;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${color}`}
      >
        <Icon size={24} />
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
          {label}
        </p>
        <p className="text-lg font-bold text-slate-900">{value}</p>
      </div>
    </div>
  );
}
