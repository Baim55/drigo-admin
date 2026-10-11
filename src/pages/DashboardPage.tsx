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
import {
  HiOutlineChartPie,
  HiOutlineUsers,
  HiOutlineTruck,
  HiOutlineDocumentText,
  HiOutlineCalendarDays,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineCreditCard,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";

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
    {
      label: "Total customers",
      value: kpis.totalMembers,
      icon: HiOutlineUsers,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total cars",
      value: kpis.totalCars,
      icon: HiOutlineTruck,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Active rentals",
      value: kpis.activeRentals,
      icon: HiOutlineDocumentText,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Active reservations",
      value: kpis.activeReservations,
      icon: HiOutlineCalendarDays,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Open support tickets",
      value: kpis.openSupportTickets,
      icon: HiOutlineChatBubbleBottomCenterText,
      color: "bg-rose-50 text-rose-600",
    },
    {
      label: "Online drivers",
      value: `${kpis.onlineDrivers}/${kpis.totalDeliveryDrivers}`,
      icon: HiOutlineUserGroup,
      color: "bg-indigo-50 text-indigo-600",
    },
    {
      label: "Today's revenue (AED)",
      value: kpis.todayRevenue.toLocaleString(),
      icon: HiOutlineCurrencyDollar,
      color: "bg-teal-50 text-teal-600",
    },
    {
      label: "Monthly revenue (AED)",
      value: kpis.monthlyRevenue.toLocaleString(),
      icon: HiOutlineCurrencyDollar,
      color: "bg-cyan-50 text-cyan-600",
    },
    {
      label: "Total revenue (AED)",
      value: kpis.totalRevenue.toLocaleString(),
      icon: HiOutlineCurrencyDollar,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Total debt (AED)",
      value: kpis.totalDebt.toLocaleString(),
      icon: HiOutlineCreditCard,
      color: "bg-red-50 text-red-600",
    },
    {
      label: "Pending verification",
      value: kpis.pendingVerificationCount,
      icon: HiOutlineUsers,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Approved members",
      value: kpis.approvedMembers,
      icon: HiOutlineUsers,
      color: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <HiOutlineChartPie className="text-blue-600" size={28} />
          <span>Dashboard Overview</span>
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Real-time performance metrics, financial KPIs, and trend insights.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${card.color}`}
              >
                <Icon size={24} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 truncate">
                  {card.label}
                </p>
                <p className="text-xl font-bold text-slate-900">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {trendsError && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Trends error: {trendsError}</span>
        </div>
      )}

      {trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <ChartCard title="Revenue (last 14 days)">
            <LineChart data={trends.revenueTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#2563eb"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ChartCard>

          <ChartCard title="Rentals per day">
            <BarChart data={trends.rentalTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard title="Reservations per day">
            <BarChart data={trends.reservationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="count" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartCard>

          <ChartCard title="New users per day">
            <BarChart data={trends.userRegistrationTrends}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickFormatter={(d) => d.slice(5)}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "12px",
                  border: "1px solid #e2e8f0",
                }}
              />
              <Bar dataKey="count" fill="#f59e0b" radius={[6, 6, 0, 0]} />
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
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
        {title}
      </h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
