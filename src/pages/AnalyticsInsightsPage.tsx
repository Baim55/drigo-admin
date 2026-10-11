import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getRevenueDaily,
  getDebtDaily,
  getUtilizationDaily,
  getFunnel,
  getDemographics,
} from "../api/analyticsExtra";
import type { Demographics } from "../api/analyticsExtra";

type Revenue = { date: string; revenue: number }[];
type Debt = { date: string; added: number; collected: number }[];
type Util = { date: string; utilization: number }[];
type Funnel = { step: string; count: number }[];

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#a855f7", "#ef4444"];
const short = (d: string) => d.slice(5);

function Card({
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
      <ResponsiveContainer width="100%" height={240}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

export default function AnalyticsInsightsPage() {
  const [revenue, setRevenue] = useState<Revenue>([]);
  const [debt, setDebt] = useState<Debt>([]);
  const [util, setUtil] = useState<Util>([]);
  const [funnel, setFunnel] = useState<Funnel>([]);
  const [demo, setDemo] = useState<Demographics | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getRevenueDaily(),
      getDebtDaily(),
      getUtilizationDaily(),
      getFunnel(),
      getDemographics(),
    ])
      .then(([r, d, u, f, dm]) => {
        setRevenue(r.points);
        setDebt(d.points);
        setUtil(u.points);
        setFunnel(f.steps);
        setDemo(dm);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (error)
    return (
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        Error: {error}
      </div>
    );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">
        Analytics insights (30 days)
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Daily revenue">
          <LineChart data={revenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={short}
              tick={{ fontSize: 11 }}
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
        </Card>

        <Card title="Debt added vs collected">
          <BarChart data={debt}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={short}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend />
            <Bar dataKey="added" fill="#ef4444" name="Added" />
            <Bar dataKey="collected" fill="#22c55e" name="Collected" />
          </BarChart>
        </Card>

        <Card title="Fleet utilization (%)">
          <LineChart data={util}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickFormatter={short}
              tick={{ fontSize: 11 }}
            />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="utilization"
              stroke="#a855f7"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </Card>

        <Card title="Customer funnel">
          <BarChart data={funnel} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="step"
              width={110}
              tick={{ fontSize: 11 }}
            />
            <Tooltip />
            <Bar dataKey="count" fill="#f59e0b" />
          </BarChart>
        </Card>

        {demo && (
          <>
            <Card title={`Gender (total ${demo.total})`}>
              <PieChart>
                <Pie
                  data={demo.gender}
                  dataKey="count"
                  nameKey="gender"
                  outerRadius={80}
                  label
                >
                  {demo.gender.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Card>

            <Card title="Age groups">
              <BarChart data={demo.age}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </Card>

            <Card title="Platform">
              <PieChart>
                <Pie
                  data={demo.platform}
                  dataKey="count"
                  nameKey="platform"
                  outerRadius={80}
                  label
                >
                  {demo.platform.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
