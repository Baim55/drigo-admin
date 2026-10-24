import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getPlans,
  getBookings,
  updateBookingStatus,
  assignBookingCar,
} from "../api/subscriptions";
import type {
  SubscriptionPlan,
  SubscriptionBooking,
  BookingStatus,
} from "../api/subscriptions";
import { getAvailableCars } from "../api/cars";
import type { Car } from "../types/car";
import {
  HiOutlineCreditCard,
  HiOutlineClipboardDocumentList,
  HiOutlineExclamationCircle,
  HiOutlineTruck,
} from "react-icons/hi2";

const STATUSES: BookingStatus[] = [
  "Pending",
  "Active",
  "Assigned",
  "Completed",
  "Cancelled",
];

const STATUS_STYLES: Record<BookingStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Active: "bg-green-50 text-green-700 ring-1 ring-green-200",
  Assigned: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  Completed: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  Cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export default function SubscriptionsPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [bookings, setBookings] = useState<SubscriptionBooking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [filter, setFilter] = useState<BookingStatus | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    load();
    getAvailableCars()
      .then(setCars)
      .catch(() => {});
  }, []);

  function load() {
    setLoading(true);
    Promise.all([getPlans(), getBookings()])
      .then(([p, b]) => {
        setPlans(p);
        setBookings(b);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  async function run(id: number, fn: () => Promise<unknown>) {
    setBusyId(id);
    setError("");
    try {
      await fn();
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const shown = filter ? bookings.filter((b) => b.status === filter) : bookings;

  if (loading && bookings.length === 0)
    return <p className="text-slate-500 font-medium">Loading...</p>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineCreditCard className="text-blue-600" size={28} />
            <span>Subscriptions</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage subscription plans, active client bookings, and car
            assignments.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {/* Plans Section */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-3 flex items-center gap-2">
          <HiOutlineCreditCard className="text-blue-600" size={20} />
          <span>Plans</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {plans.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <p className="font-bold text-slate-900">{p.modelName}</p>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    p.isActive
                      ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                      : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                  }`}
                >
                  {p.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {p.monthlyPrice} {p.currency}
                <span className="text-xs font-medium text-slate-400">
                  {" "}
                  / month
                </span>
              </p>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {p.includedKm} km included · min {p.minMonths} month(s)
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bookings Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
            <HiOutlineClipboardDocumentList
              className="text-blue-600"
              size={20}
            />
            <span>Bookings</span>
          </h2>
          <div className="flex flex-wrap gap-1.5">
            {(["", ...STATUSES] as (BookingStatus | "")[]).map((s) => (
              <button
                key={s || "all"}
                onClick={() => setFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  filter === s
                    ? "bg-slate-900 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left min-w-[700px]">
            <thead className="bg-slate-50 text-slate-500 font-semibold text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Model</th>
                <th className="px-4 py-3.5">Months</th>
                <th className="px-4 py-3.5">Price / month</th>
                <th className="px-4 py-3.5">Car</th>
                <th className="px-4 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {shown.map((b) => (
                <tr
                  key={b.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-4 font-bold text-slate-900">
                    <Link
                      to={`/customers/${b.userId}`}
                      className="text-blue-600 hover:underline"
                    >
                      {b.customerName}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-slate-600 font-medium">
                    {b.modelName}
                  </td>
                  <td className="px-4 py-4 text-slate-600">{b.months}</td>
                  <td className="px-4 py-4 text-slate-600 font-semibold">
                    {b.monthlyPrice} {b.currency}
                  </td>
                  <td className="px-4 py-4">
                    {b.carId !== null ? (
                      <Link
                        to={`/cars/${b.carId}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg transition"
                      >
                        <HiOutlineTruck size={14} />
                        <span>#{b.carId}</span>
                      </Link>
                    ) : (
                      <select
                        defaultValue=""
                        disabled={busyId === b.id}
                        onChange={(e) =>
                          e.target.value &&
                          run(b.id, () =>
                            assignBookingCar(b.id, Number(e.target.value)),
                          )
                        }
                        className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Assign car...</option>
                        {cars.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.brandName} {c.modelName} ({c.plateNumber})
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={b.status}
                      disabled={busyId === b.id}
                      onChange={(e) =>
                        run(b.id, () =>
                          updateBookingStatus(
                            b.id,
                            e.target.value as BookingStatus,
                          ),
                        )
                      }
                      className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer ${STATUS_STYLES[b.status]}`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
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
