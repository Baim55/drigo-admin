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

  if (loading) return <p className="text-slate-500">Loading...</p>;

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        Error: {error}
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
    <div className="max-w-4xl mx-auto">
      <Link
        to="/reservations"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to reservations
      </Link>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {reservation.customerName}
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {reservation.customerPhone}
            </p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200">
            {reservation.status}
          </span>
        </div>

        <dl className="space-y-2 text-sm mb-4">
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
            className="text-sm font-medium px-4 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
          >
            {cancelling ? "Cancelling..." : "Cancel reservation"}
          </button>
        )}
      </div>

      {canAssignDriver && (
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Assign driver
          </h2>

          {availableDrivers.length === 0 ? (
            <p className="text-sm text-slate-400">
              No available drivers right now.
            </p>
          ) : (
            <div className="flex gap-2">
              <select
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(Number(e.target.value))}
                className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="text-sm font-medium px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition"
              >
                {assigning ? "Assigning..." : "Assign"}
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
    <div className="flex justify-between py-1 border-b border-slate-50 last:border-0">
      <dt className="text-slate-500">{label}</dt>
      <dd className="font-medium text-slate-800">{value}</dd>
    </div>
  );
}
