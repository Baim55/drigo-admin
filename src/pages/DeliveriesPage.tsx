import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import {
  getActiveDeliveries,
  getDeliveryDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from "../api/reservations";
import type { ActiveDelivery, DeliveryDriver } from "../api/reservations";
import {
  HiOutlineMap,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineExclamationCircle,
  HiOutlineTrash,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<ActiveDelivery[]>([]);
  const [drivers, setDrivers] = useState<DeliveryDriver[]>([]);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  function load() {
    getActiveDeliveries()
      .then(setDeliveries)
      .catch((e) => setError((e as Error).message));
    getDeliveryDrivers()
      .then(setDrivers)
      .catch((e) => setError((e as Error).message));
  }

  function closeForm() {
    setEditingId(null);
    setFullName("");
    setPhone("");
    setEmail("");
    setShowForm(false);
  }

  function startEdit(d: DeliveryDriver) {
    setEditingId(d.id);
    setFullName(d.fullName);
    setPhone(d.phoneNumber);
    setEmail(d.email ?? "");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      fullName: fullName.trim(),
      phoneNumber: phone.trim(),
      email: email.trim(),
    };
    try {
      if (editingId !== null) await updateDriver(editingId, payload);
      else await createDriver(payload);
      closeForm();
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Delete this driver?")) return;
    setError("");
    try {
      await deleteDriver(id);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineMap className="text-blue-600" size={28} />
            <span>Deliveries & Drivers</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor active delivery tracking on map and manage delivery
            personnel.
          </p>
        </div>
        <button
          onClick={() => (showForm ? closeForm() : setShowForm(true))}
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-sm shadow-blue-600/20 transition"
        >
          {showForm ? (
            <HiOutlineXMark size={18} />
          ) : (
            <HiOutlinePlus size={18} />
          )}
          <span>{showForm ? "Cancel" : "Add Driver"}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {/* Map Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-4 space-y-3">
        <div
          className="rounded-xl overflow-hidden border border-slate-200"
          style={{ height: "380px" }}
        >
          <MapContainer
            center={[25.2, 55.27]}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {deliveries.map((d) => (
              <CircleMarker
                key={d.id}
                center={[d.deliveryLat, d.deliveryLng]}
                radius={8}
                pathOptions={{
                  color: "#2563eb",
                  fillColor: "#3b82f6",
                  fillOpacity: 0.8,
                }}
              >
                <Popup>
                  <p className="font-semibold">{d.customerName}</p>
                  <p className="text-xs">
                    {d.carName} · {d.status}
                  </p>
                  <p className="text-xs">{d.deliveryAddress}</p>
                  <p className="text-xs">
                    Driver: {d.driverName ?? "not assigned"}
                  </p>
                </Popup>
              </CircleMarker>
            ))}
            {deliveries
              .filter((d) => d.driverLat !== null && d.driverLng !== null)
              .map((d) => (
                <CircleMarker
                  key={`drv-${d.id}`}
                  center={[d.driverLat as number, d.driverLng as number]}
                  radius={6}
                  pathOptions={{
                    color: "#16a34a",
                    fillColor: "#22c55e",
                    fillOpacity: 0.9,
                  }}
                >
                  <Popup>Driver: {d.driverName}</Popup>
                </CircleMarker>
              ))}
          </MapContainer>
        </div>
        <p className="text-xs text-slate-500 px-1 font-medium">
          {deliveries.length} active deliveries. Blue = delivery address, green
          = driver position (when known).
        </p>
      </div>

      {/* Add / Edit Driver Form */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5"
        >
          <h3 className="text-base font-bold text-slate-800 border-b border-slate-100 pb-3">
            {editingId !== null ? "Edit Driver Details" : "New Driver Details"}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Full Name
              </label>
              <input
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Phone Number
              </label>
              <input
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +971..."
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. driver@drigo.ae"
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={closeForm}
              className="text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl disabled:opacity-50 transition shadow-sm"
            >
              {saving
                ? "Saving..."
                : editingId !== null
                  ? "Update Driver"
                  : "Create Driver"}
            </button>
          </div>
        </form>
      )}

      {/* Drivers Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-bold text-slate-800">
            Registered Drivers
          </h2>
        </div>
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left min-w-[700px]">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Active / Done</th>
                <th className="px-6 py-3.5">Rating</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {drivers.map((d) => (
                <tr
                  key={d.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {d.fullName}
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {d.phoneNumber}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                      {d.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">
                    <span className="text-blue-600 font-bold">
                      {d.activeDeliveries}
                    </span>{" "}
                    / {d.completedDeliveries}
                  </td>
                  <td className="px-6 py-4 font-semibold text-amber-600">
                    ★ {d.rating.toFixed(1)}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => startEdit(d)}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      <HiOutlinePencilSquare size={16} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(d.id)}
                      className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1"
                    >
                      <HiOutlineTrash size={16} />
                      <span>Delete</span>
                    </button>
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
