import { useEffect, useState } from "react";
import {
  getStatistics,
  getMonthDetail,
  getSalikSummary,
  getEnocSummary,
} from "../api/reports";
import type { Statistics, SalikSummary, EnocSummary } from "../api/reports";
import type { MonthlyReportItem } from "../types/analytics";
import {
  HiOutlineChartBar,
  HiOutlineExclamationCircle,
  HiOutlineCurrencyDollar,
  HiOutlineTruck,
  HiOutlineMap,
  HiOutlineUsers,
  HiOutlineCreditCard,
  HiOutlineTicket,
  HiOutlineCalendar,
} from "react-icons/hi2";

function Stat({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
      <div className="p-3 rounded-xl bg-blue-50 text-blue-600">{icon}</div>
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
          {label}
        </p>
        <p className="text-xl font-bold text-slate-900 tracking-tight">
          {value}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0 text-sm">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-semibold text-slate-900">{value}</dd>
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString();

export default function ReportsPage() {
  const [stats, setStats] = useState<Statistics | null>(null);
  const [salik, setSalik] = useState<SalikSummary | null>(null);
  const [enoc, setEnoc] = useState<EnocSummary | null>(null);
  const [month, setMonth] = useState("");
  const [detail, setDetail] = useState<MonthlyReportItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getStatistics(), getSalikSummary(), getEnocSummary()])
      .then(([s, sa, e]) => {
        setStats(s);
        setSalik(sa);
        setEnoc(e);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!month) {
      setDetail(null);
      return;
    }
    setDetailLoading(true);
    setError("");
    getMonthDetail(month)
      .then(setDetail)
      .catch((e) => setError((e as Error).message))
      .finally(() => setDetailLoading(false));
  }, [month]);

  if (loading) return <p className="text-slate-500 font-medium">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineChartBar className="text-blue-600" size={28} />
            <span>Reports & Analytics</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor overall platform performance, revenues, and toll metrics.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Stat
            label="Total Revenue"
            value={`${fmt(stats.revenue.total)} ${stats.revenue.currency}`}
            icon={<HiOutlineCurrencyDollar size={24} />}
          />
          <Stat
            label="Rentals (Completed / Total)"
            value={`${stats.rentals.completed} / ${stats.rentals.total}`}
            icon={<HiOutlineTruck size={24} />}
          />
          <Stat
            label="Total Distance"
            value={`${fmt(stats.rentals.totalDistanceKm)} km`}
            icon={<HiOutlineMap size={24} />}
          />
          <Stat
            label="Fleet Active"
            value={`${stats.fleet.active} / ${stats.fleet.cars}`}
            icon={<HiOutlineTruck size={24} />}
          />
          <Stat
            label="Customers Verified"
            value={`${stats.customers.verified} / ${stats.customers.total}`}
            icon={<HiOutlineUsers size={24} />}
          />
          <Stat
            label="Customers With Debt"
            value={String(stats.customers.withDebt)}
            icon={<HiOutlineCreditCard size={24} />}
          />
          <Stat
            label="Unpaid Debt"
            value={`${fmt(stats.debt.unpaid)} AED`}
            icon={<HiOutlineCreditCard size={24} />}
          />
          <Stat
            label="Open Support Tickets"
            value={String(stats.support.open)}
            icon={<HiOutlineTicket size={24} />}
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {salik && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3 flex items-center gap-2">
              <HiOutlineMap className="text-blue-600" size={20} />
              <span>Salik Tolls Summary</span>
            </h2>
            <dl>
              <Row label="Total Trips" value={salik.totalTrips} />
              <Row
                label="Total Amount"
                value={`${fmt(salik.totalAmount)} ${salik.currency}`}
              />
              <Row
                label="Billed Amount"
                value={`${fmt(salik.billedAmount)} ${salik.currency}`}
              />
              <Row
                label="Unbilled Amount"
                value={`${fmt(salik.unbilledAmount)} ${salik.currency}`}
              />
            </dl>
          </div>
        )}

        {enoc && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3 mb-3 flex items-center gap-2">
              <HiOutlineCurrencyDollar className="text-blue-600" size={20} />
              <span>ENOC Fuel Summary</span>
            </h2>
            <dl>
              <Row label="Transactions" value={enoc.totalTransactions} />
              <Row label="Total Liters" value={`${fmt(enoc.totalLiters)} L`} />
              <Row
                label="Total Amount"
                value={`${fmt(enoc.totalAmount)} ${enoc.currency}`}
              />
            </dl>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineCalendar className="text-blue-600" size={20} />
            <span>Month Drill-down</span>
          </h2>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {!month && (
          <p className="text-sm text-slate-400 font-medium py-4">
            Pick a month to see its full breakdown.
          </p>
        )}
        {detailLoading && (
          <p className="text-sm text-slate-400 font-medium py-4">Loading...</p>
        )}

        {detail && !detailLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            <dl>
              <Row
                label="Rental Revenue"
                value={`${fmt(detail.revenue.rental)} AED`}
              />
              <Row
                label="Extra KM Revenue"
                value={`${fmt(detail.revenue.extraKm)} AED`}
              />
              <Row
                label="Total Revenue"
                value={`${fmt(detail.revenue.total)} AED`}
              />
              <Row
                label="Rentals (Completed/Total)"
                value={`${detail.rentals.completed}/${detail.rentals.total}`}
              />
              <Row label="New Customers" value={detail.newCustomers} />
              <Row label="Failed Payments" value={detail.failedPayments} />
            </dl>
            <dl>
              <Row
                label="Salik"
                value={`${detail.salik.total} AED (${detail.salik.trips} trips)`}
              />
              <Row
                label="ENOC"
                value={`${fmt(detail.enoc.total)} AED (${detail.enoc.liters} L)`}
              />
              <Row
                label="Fines Billed"
                value={`${detail.fines.billed} / ${fmt(detail.fines.billedTotal)} AED`}
              />
              <Row
                label="Debt Added / Collected"
                value={`${fmt(detail.debt.added)} / ${fmt(detail.debt.collected)}`}
              />
              <Row
                label="Operating Cost"
                value={`${fmt(detail.operatingCost)} AED`}
              />
              <Row
                label="Net Revenue"
                value={`${fmt(detail.netRevenue)} AED`}
              />
            </dl>
          </div>
        )}
      </div>
    </div>
  );
}
