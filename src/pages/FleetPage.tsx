import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Circle,
  CircleMarker,
  Popup,
} from "react-leaflet";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  getFleetHealth,
  getFleetPlan,
  saveFleetPlan,
  getFleetMoves,
  getUtilization,
  getParkingZones,
  getGasStations,
} from "../api/fleet";
import type {
  FleetHealth,
  FleetPlan,
  FleetMove,
  Utilization,
  ParkingZone,
  GasStation,
} from "../api/fleet";
import {
  HiOutlineTruck,
  HiOutlineExclamationCircle,
  HiOutlineCheckCircle,
  HiOutlineChartBar,
  HiOutlineMapPin,
  HiOutlineArrowPath,
} from "react-icons/hi2";

export default function FleetPage() {
  const [health, setHealth] = useState<FleetHealth | null>(null);
  const [plan, setPlan] = useState<FleetPlan | null>(null);
  const [moves, setMoves] = useState<FleetMove[]>([]);
  const [util, setUtil] = useState<Utilization | null>(null);
  const [parking, setParking] = useState<ParkingZone[]>([]);
  const [gas, setGas] = useState<GasStation[]>([]);
  const [targets, setTargets] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    Promise.all([
      getFleetHealth(),
      getFleetPlan(),
      getFleetMoves(),
      getUtilization(),
      getParkingZones(),
      getGasStations(),
    ])
      .then(([h, p, m, u, pk, g]) => {
        setHealth(h);
        setPlan(p);
        setMoves(m);
        setUtil(u);
        setParking(pk);
        setGas(g);
        setTargets(
          Object.fromEntries(
            p.targets.map((t) => [t.city, String(t.targetCars)]),
          ),
        );
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  async function handleSavePlan(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await saveFleetPlan(
        Object.entries(targets).map(([city, v]) => ({
          city,
          targetCars: Number(v),
        })),
      );
      setMessage("Fleet plan saved.");
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-slate-500 font-medium">Loading...</p>;

  const input =
    "rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";
  const card =
    "bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-4";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineTruck className="text-blue-600" size={28} />
            <span>Fleet Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Monitor vehicle utilization, health conditions, city deployment
            plans, and active zones.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}
      {message && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700 flex items-center gap-3">
          <HiOutlineCheckCircle size={20} className="shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {util && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <HiOutlineTruck size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Total Cars
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {util.totalCars}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
              <HiOutlineArrowPath size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Active / Idle
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {util.activeCars} / {util.idleCars}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-50 text-blue-600">
              <HiOutlineChartBar size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Utilization
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {util.utilizationRate}%
              </p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
              <HiOutlineTruck size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-0.5">
                Avg Revenue / Car
              </p>
              <p className="text-2xl font-bold text-slate-900 tracking-tight">
                {util.avgRevenuePerCar.toLocaleString()} {util.currency}
              </p>
            </div>
          </div>
        </div>
      )}

      {health && (
        <div className={card}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <HiOutlineChartBar className="text-blue-600" size={20} />
              <span>Fleet Condition</span>
            </h2>
            <div className="text-sm font-medium text-slate-500">
              Problem reports:{" "}
              <b className="text-amber-600">{health.openProblemReports}</b> ·{" "}
              <Link to="/accidents" className="text-blue-600 hover:underline">
                Open accidents:{" "}
                <b className="text-red-600">{health.openAccidents}</b>
              </Link>
            </div>
          </div>
          <div className="pt-2">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={health.conditions}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="condition"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 font-medium pt-2 border-t border-slate-100">
            A car can have several conditions, so counts can exceed the total (
            {health.total}).
          </p>
        </div>
      )}

      {plan && (
        <div className={card}>
          <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
            <HiOutlineTruck className="text-blue-600" size={20} />
            <span>Fleet Plan by City</span>
          </h2>
          <div className="pt-2">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={plan.targets}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="city"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                />
                <YAxis tick={{ fontSize: 12, fill: "#64748b" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#ffffff",
                    borderColor: "#e2e8f0",
                    borderRadius: "0.75rem",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="currentCars"
                  name="Current"
                  fill="#10b981"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  dataKey="targetCars"
                  name="Target"
                  fill="#f59e0b"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <form
            onSubmit={handleSavePlan}
            className="flex flex-wrap items-end gap-3 pt-4 border-t border-slate-100"
          >
            {plan.targets.map((t) => (
              <div key={t.city}>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  {t.city} target
                </label>
                <input
                  type="number"
                  min={0}
                  value={targets[t.city] ?? ""}
                  onChange={(e) =>
                    setTargets({ ...targets, [t.city]: e.target.value })
                  }
                  className={input + " w-28"}
                />
              </div>
            ))}
            <button
              disabled={saving}
              className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl disabled:opacity-50 transition shadow-sm"
            >
              {saving ? "Saving..." : "Save plan"}
            </button>
          </form>
        </div>
      )}

      <div className={card}>
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <HiOutlineTruck className="text-blue-600" size={20} />
          <span>Fleet Moves</span>
        </h2>
        {moves.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium py-2">No moves.</p>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm text-left min-w-[700px]">
              <thead className="text-xs uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Car</th>
                  <th className="py-3.5 px-4 font-semibold">Route</th>
                  <th className="py-3.5 px-4 font-semibold">Scheduled</th>
                  <th className="py-3.5 px-4 font-semibold">Assigned to</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {moves.map((m) => (
                  <tr
                    key={m.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <Link
                        to={`/cars/${m.carId}`}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        {m.plateNumber}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-slate-600 font-medium">
                      {m.fromCity} → {m.toCity}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {new Date(m.scheduledAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 text-slate-600">
                      {m.assignedTo ?? "-"}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          m.status === "Completed"
                            ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                            : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
                        }`}
                      >
                        {m.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className={card}>
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <HiOutlineMapPin className="text-blue-600" size={20} />
          <span>Parking Zones & Gas Stations</span>
        </h2>
        <div
          className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm"
          style={{ height: "380px" }}
        >
          <MapContainer
            center={[25.2, 55.3]}
            zoom={10}
            style={{ height: "100%", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {parking.map((p) => (
              <Circle
                key={`p${p.id}`}
                center={[p.latitude, p.longitude]}
                radius={p.radiusMeters}
                pathOptions={{
                  color: p.isFree ? "#16a34a" : "#2563eb",
                  fillOpacity: 0.2,
                }}
              >
                <Popup>
                  {p.name} · {p.isFree ? "Free" : "Paid"} · {p.radiusMeters} m
                </Popup>
              </Circle>
            ))}
            {gas.map((g) => (
              <CircleMarker
                key={`g${g.id}`}
                center={[g.latitude, g.longitude]}
                radius={7}
                pathOptions={{
                  color: "#dc2626",
                  fillColor: "#ef4444",
                  fillOpacity: 0.9,
                }}
              >
                <Popup>
                  {g.name} ({g.brand})
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>
        <p className="text-xs text-slate-500 font-medium">
          Circles = parking zones (green free, blue paid). Red dots = gas
          stations. {parking.length} zones, {gas.length} stations.
        </p>
      </div>
    </div>
  );
}
