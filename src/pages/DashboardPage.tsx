import { useEffect, useState } from "react";
import { getKpis } from "../api/dashboard";
import type { DashboardKpis } from "../types/dashboard";

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKpis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getKpis()
      .then(setKpis)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-slate-500">Yüklənir...</div>;
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        Xəta: {error}
      </div>
    );
  }

  if (!kpis) return null;

  const cards = [
    { label: "Ümumi müştəri", value: kpis.totalMembers },
    { label: "Ümumi maşın", value: kpis.totalCars },
    { label: "Aktiv icarələr", value: kpis.activeRentals },
    { label: "Aktiv rezervasiyalar", value: kpis.activeReservations },
    { label: "Açıq dəstək bileti", value: kpis.openSupportTickets },
    {
      label: "Onlayn sürücü",
      value: `${kpis.onlineDrivers}/${kpis.totalDeliveryDrivers}`,
    },
    { label: "Bugünkü gəlir (AED)", value: kpis.todayRevenue.toLocaleString() },
    { label: "Aylıq gəlir (AED)", value: kpis.monthlyRevenue.toLocaleString() },
    { label: "Ümumi gəlir (AED)", value: kpis.totalRevenue.toLocaleString() },
    { label: "Ümumi borc (AED)", value: kpis.totalDebt.toLocaleString() },
    { label: "Təsdiq gözləyən", value: kpis.pendingVerificationCount },
    { label: "Təsdiqlənmiş üzv", value: kpis.approvedMembers },
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
    </div>
  );
}
