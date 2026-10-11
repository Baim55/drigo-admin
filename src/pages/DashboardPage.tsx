import { useEffect, useState } from "react";
import { getKpis, getTrends } from "../api/dashboard";
import type { DashboardKpis, DashboardTrends } from "../types/dashboard";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [trendsError, setTrendsError] = useState("");

  useEffect(() => {
    getKpis()
      .then(setKpis)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getTrends()
      .then(setTrends)
      .catch((err) => setTrendsError((err as Error).message));
  }, []);

  if (loading) {
    return <div className="text-slate-500">Loading...</div>;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!kpis) return null;

  const cards = [
    { label: "Total customers", value: kpis.totalMembers },
    { label: "Total cars", value: kpis.totalCars },
    { label: "Active rentals", value: kpis.activeRentals },
    { label: "Active reservations", value: kpis.activeReservations },
    { label: "Open support tickets", value: kpis.openSupportTickets },
    {
      label: "Online drivers",
      value: `${kpis.onlineDrivers}/${kpis.totalDeliveryDrivers}`,
    },
    {
      label: "Today's revenue (AED)",
      value: kpis.todayRevenue.toLocaleString(),
    },
    {
      label: "Monthly revenue (AED)",
      value: kpis.monthlyRevenue.toLocaleString(),
    },
    { label: "Total revenue (AED)", value: kpis.totalRevenue.toLocaleString() },
    { label: "Total debt (AED)", value: kpis.totalDebt.toLocaleString() },
    { label: "Pending verification", value: kpis.pendingVerificationCount },
    { label: "Approved members", value: kpis.approvedMembers },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-lg shadow-sm border border-slate-200 p-4"
          >
            <p className="text-sm text-slate-500 mb-1">{card.label}</p>
            <p className="text-2xl font-bold text-slate-800">{card.value}</p>
          </div>
        ))}
      </div>
      {trendsError && (
        <div className="mt-6 rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
          Trends error: {trendsError}
        </div>
      )}

      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <ChartCard title="Revenue (last 14 days)">
            <LineChart data={trends.revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartCard>

          <ChartCard title="Rentals per day">
            <BarChart data={trends.rentalTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard title="Reservations per day">
            <BarChart data={trends.reservationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#a855f7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard title="New users per day">
            <BarChart data={trends.userRegistrationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11 }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactElement;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
        {title}
      </h2>
      <ResponsiveContainer width="100%" height={220}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}
