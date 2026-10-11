import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getReservationById,
  getDeliveryDrivers,
  assignDriver,
  cancelReservation,
  type DeliveryDriver,
} from "../api/reservations";
import type { Reservation } from "../types/reservation";
import {
  HiOutlineArrowLongLeft,
  HiOutlineExclamationCircle,
  HiOutlineCalendarDays,
  HiOutlineUserGroup,
} from "react-icons/hi2";

const STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  Confirmed: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  DriverAssigned: "bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200",
  PickingUp: "bg-cyan-50 text-cyan-700 ring-1 ring-cyan-200",
  InDelivery: "bg-purple-50 text-purple-700 ring-1 ring-purple-200",
  Delivered: "bg-teal-50 text-teal-700 ring-1 ring-teal-200",
  Completed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  Cancelled: "bg-slate-100 text-slate-500 ring-1 ring-slate-200",
  Expired: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

export default function ReservationDetailPage() {
  const { id } = useParams();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [selectedDriverId, setSelectedDriverId] = useState<number | "">("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadReservation();
    getDeliveryDrivers()
      .then(setDrivers)
      .catch(() => {});
  }, [id]);

  function loadReservation() {
    if (!id) return;
    setLoading(true);
    getReservationById(Number(id))
      .then(setReservation)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  async function handleAssignDriver() {
    if (!id || !selectedDriverId) return;
    setAssigning(true);
    setError("");
    try {
      await assignDriver(Number(id), Number(selectedDriverId));
      loadReservation();
      setSelectedDriverId("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAssigning(false);
    }
  }

  async function handleCancel() {
    if (!id) return;
    const confirmed = window.confirm("Cancel this reservation?");
    if (!confirmed) return;

    setCancelling(true);
    setError("");
    try {
      await cancelReservation(Number(id));
      loadReservation();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCancelling(false);
    }
  }

  if (loading)
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Loading reservation details...
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

  if (!reservation) return null;

  const canAssignDriver =
    reservation.status === "Pending" || reservation.status === "Confirmed";
  const canCancel =
    reservation.status !== "Completed" &&
    reservation.status !== "Cancelled" &&
    reservation.status !== "Expired";

  const availableDrivers = drivers.filter((d) => d.status !== "Busy");

  function formatAddress(
    addr: string | { address: string; latitude: number; longitude: number },
  ): string {
    return typeof addr === "string" ? addr : addr.address;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Link
        to="/reservations"
        className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1.5"
      >
        <HiOutlineArrowLongLeft size={20} />
        <span>Back to reservations</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <HiOutlineCalendarDays className="text-blue-600" size={26} />
              <span>{reservation.customerName}</span>
            </h1>
            <p className="text-sm font-medium text-slate-500 mt-1 font-mono">
              {reservation.customerPhone}
            </p>
          </div>
          <span
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold ${STATUS_STYLES[reservation.status] || "bg-slate-100 text-slate-600"}`}
          >
            {reservation.status}
          </span>
        </div>

        <dl className="space-y-3 text-sm mb-6">
          <Row
            label="Car"
            value={`${reservation.carName} (${reservation.plateNumber})`}
          />
          <Row
            label="Delivery address"
            value={formatAddress(reservation.deliveryAddress)}
          />
          <Row
            label="Scheduled delivery"
            value={new Date(reservation.scheduledDeliveryDate).toLocaleString()}
          />
          <Row
            label="Immediate"
            value={reservation.isImmediate ? "Yes" : "No"}
          />
          <Row label="Total price" value={`${reservation.totalPrice} AED`} />
          <Row
            label="Driver"
            value={reservation.driverName ?? "Not assigned"}
          />
        </dl>

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="text-xs font-semibold px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition shadow-xs"
          >
            {cancelling ? "Cancelling..." : "Cancel reservation"}
          </button>
        )}
      </div>

      {canAssignDriver && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <HiOutlineUserGroup size={18} className="text-blue-600" />
            <span>Assign driver</span>
          </h2>

          {availableDrivers.length === 0 ? (
            <p className="text-sm text-slate-400 font-medium">
              No available drivers right now.
            </p>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(Number(e.target.value))}
                className="flex-1 rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a driver</option>
                {availableDrivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.status})
                  </option>
                ))}
              </select>
              <button
                onClick={handleAssignDriver}
                disabled={!selectedDriverId || assigning}
                className="text-sm font-semibold px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
              >
                {assigning ? "Assigning..." : "Assign Driver"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-2 border-b border-slate-50 last:border-0">
      <dt className="text-slate-500 font-medium">{label}</dt>
      <dd className="font-semibold text-slate-800">{value}</dd>
    </div>
  );
}
