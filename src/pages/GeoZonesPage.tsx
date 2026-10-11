import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polygon,
  Popup,
  useMapEvents,
} from "react-leaflet";
import {
  getGeoZones,
  createGeoZone,
  updateGeoZone,
  deleteGeoZone,
} from "../api/geozones";
import type { GeoZone } from "../types/geozone";
import {
  HiOutlineMap,
  HiOutlinePlus,
  HiOutlineXMark,
  HiOutlineExclamationCircle,
  HiOutlineTrash,
  HiOutlinePencilSquare,
} from "react-icons/hi2";

type Point = {
  lat: number;
  lng: number;
};

function ClickCollector({ onPoint }: { onPoint: (point: Point) => void }) {
  useMapEvents({
    click(e) {
      onPoint({
        lat: e.latlng.lat,
        lng: e.latlng.lng,
      });
    },
  });

  return null;
}

export default function GeoZonesPage() {
  const [zones, setZones] = useState<GeoZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [name, setName] = useState("");
  const [type, setType] = useState("Operating");
  const [color, setColor] = useState("#2563EB");
  const [isActive, setIsActive] = useState(true);

  const [drawPoints, setDrawPoints] = useState<Point[]>([]);

  useEffect(() => {
    loadZones();
  }, []);

  function loadZones() {
    setLoading(true);

    getGeoZones()
      .then((data) => {
        setZones(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Failed to load zones.");
        setLoading(false);
      });
  }

  function handleAddClick() {
    setEditingId(null);

    setName("");
    setType("Operating");
    setColor("#2563EB");
    setIsActive(true);

    setDrawPoints([]);

    setError("");
    setShowForm(true);
  }

  function handleEditClick(zone: GeoZone) {
    setEditingId(zone.id);

    setName(zone.name);
    setType(zone.type);
    setColor(zone.color);
    setIsActive(zone.isActive);

    setDrawPoints(zone.polygon);

    setError("");
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (drawPoints.length < 3) {
      setError("Click at least 3 points on the map to draw the zone.");
      return;
    }

    try {
      if (editingId !== null) {
        await updateGeoZone(editingId, {
          name,
          type,
          isActive,
          color,
          polygon: drawPoints,
        });
      } else {
        await createGeoZone({
          name,
          type,
          isActive,
          color,
          polygon: drawPoints,
        });
      }

      setShowForm(false);
      setEditingId(null);
      setDrawPoints([]);

      loadZones();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Are you sure you want to delete this zone?")) {
      return;
    }

    try {
      await deleteGeoZone(id);

      loadZones();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to delete zone.");
    }
  }

  if (loading) {
    return (
      <div className="py-12 text-center text-slate-500 font-medium">
        Loading geo zones...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineMap className="text-blue-600" size={28} />
            <span>Geo Zones Management</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure operating, restricted, and parking zones on the map.
          </p>
        </div>

        <button
          onClick={() => (showForm ? setShowForm(false) : handleAddClick())}
          className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-sm shadow-blue-600/20 transition"
        >
          {showForm ? (
            <HiOutlineXMark size={18} />
          ) : (
            <HiOutlinePlus size={18} />
          )}
          <span>{showForm ? "Close Form" : "Add Zone"}</span>
        </button>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4"
        >
          <h3 className="text-base font-bold text-slate-800">
            {editingId !== null ? "Edit Geo Zone" : "Create New Geo Zone"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Zone Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. Downtown Zone"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Operating">Operating</option>
                <option value="Restricted">Restricted</option>
                <option value="NoParking">NoParking</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                Color
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 border border-slate-300 rounded-xl p-1 bg-white cursor-pointer"
              />
            </div>

            <div className="flex items-center gap-2.5 h-10 pt-5">
              <input
                type="checkbox"
                id="activeCheck"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="activeCheck"
                className="text-sm font-semibold text-slate-700"
              >
                Active Zone
              </label>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
            <div className="text-xs font-medium text-slate-500 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-700">
                {drawPoints.length}
              </span>{" "}
              point(s) selected. Click on the map to add polygon corners.
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setDrawPoints((prev) => prev.slice(0, -1))}
                disabled={drawPoints.length === 0}
                className="text-xs font-semibold text-slate-600 border border-slate-300 px-4 py-2 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition bg-white"
              >
                Undo Point
              </button>

              <button
                type="button"
                onClick={() => setDrawPoints([])}
                disabled={drawPoints.length === 0}
                className="text-xs font-semibold text-slate-600 border border-slate-300 px-4 py-2 rounded-xl disabled:opacity-40 hover:bg-slate-50 transition bg-white"
              >
                Clear All
              </button>

              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-xl shadow-sm transition"
              >
                {editingId !== null ? "Update Zone" : "Create Zone"}
              </button>
            </div>
          </div>
        </form>
      )}

      <div
        className="rounded-2xl overflow-hidden shadow-sm border border-slate-200"
        style={{ height: "450px" }}
      >
        <MapContainer
          center={[25.15, 55.3]}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {showForm && (
            <ClickCollector
              onPoint={(point) => setDrawPoints((prev) => [...prev, point])}
            />
          )}

          {zones.map((zone) => (
            <Polygon
              key={zone.id}
              positions={zone.polygon.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: zone.isActive ? 0.3 : 0.1,
              }}
            >
              <Popup>
                <div className="text-sm p-1">
                  <p className="font-bold text-slate-900">{zone.name}</p>
                  <p className="text-xs text-slate-500 font-medium">
                    Type: {zone.type}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    Status: {zone.isActive ? "Active" : "Inactive"}
                  </p>
                </div>
              </Popup>
            </Polygon>
          ))}

          {showForm && drawPoints.length > 0 && (
            <Polygon
              positions={drawPoints.map((p) => [p.lat, p.lng])}
              pathOptions={{
                color,
                fillColor: color,
                dashArray: "6",
                fillOpacity: 0.15,
              }}
            />
          )}
        </MapContainer>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-sm text-left min-w-[600px]">
            <thead className="bg-slate-50/70 text-slate-500 font-semibold border-b border-slate-200 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {zones.map((zone) => (
                <tr
                  key={zone.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-3">
                    <span
                      className="inline-block w-3.5 h-3.5 rounded-md shadow-xs shrink-0"
                      style={{
                        backgroundColor: zone.color,
                      }}
                    />
                    <span>{zone.name}</span>
                  </td>

                  <td className="px-6 py-4 text-slate-600 font-medium">
                    {zone.type}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        zone.isActive
                          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                          : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                      }`}
                    >
                      {zone.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => handleEditClick(zone)}
                      className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-xl transition inline-flex items-center gap-1"
                    >
                      <HiOutlinePencilSquare size={16} />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => handleDelete(zone.id)}
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
