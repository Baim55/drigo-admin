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
    return <p className="text-slate-500">Loading...</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Geo Zones</h1>

        <button
          onClick={() => (showForm ? setShowForm(false) : handleAddClick())}
          className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md"
        >
          {showForm ? "Close" : "+ Add Zone"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 text-sm">
          Error: {error}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-end"
        >
          <div>
            <label className="block text-xs text-slate-500 mb-1">
              Zone Name
            </label>

            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm"
              placeholder="e.g. Zone 1"
            />
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Type</label>

            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="border border-slate-300 rounded-md px-3 py-2 text-sm bg-white"
            >
              <option value="Operating">Operating</option>
              <option value="Restricted">Restricted</option>
              <option value="NoParking">NoParking</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-slate-500 mb-1">Color</label>

            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-9 border border-slate-300 rounded-md p-1 bg-white cursor-pointer"
            />
          </div>

          <div className="flex items-center gap-2 h-9">
            <input
              type="checkbox"
              id="activeCheck"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4"
            />

            <label htmlFor="activeCheck" className="text-sm text-slate-700">
              Active
            </label>
          </div>

          <div className="text-xs text-slate-500 self-center">
            {drawPoints.length} point(s) selected.
            <br />
            Click on the map to add.
          </div>

          <button
            type="button"
            onClick={() => setDrawPoints((prev) => prev.slice(0, -1))}
            disabled={drawPoints.length === 0}
            className="text-xs text-slate-600 border border-slate-300 px-3 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Undo point
          </button>

          <button
            type="button"
            onClick={() => setDrawPoints([])}
            disabled={drawPoints.length === 0}
            className="text-xs text-slate-600 border border-slate-300 px-3 py-2 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Clear
          </button>

          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-md"
          >
            {editingId !== null ? "Update" : "Create"}
          </button>
        </form>
      )}

      <div
        className="rounded-xl overflow-hidden shadow-sm border border-slate-200 mb-6"
        style={{ height: "400px" }}
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
                <p className="font-semibold">{zone.name}</p>
                <p className="text-xs text-slate-500">{zone.type}</p>
                <p className="text-xs text-slate-500">
                  {zone.isActive ? "Active" : "Inactive"}
                </p>
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

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {zones.map((zone) => (
              <tr key={zone.id} className="hover:bg-slate-50">
                {/* Name */}
                <td className="px-4 py-3 font-medium text-slate-800">
                  <span
                    className="inline-block w-3 h-3 rounded-sm mr-2"
                    style={{
                      backgroundColor: zone.color,
                    }}
                  />

                  {zone.name}
                </td>

                <td className="px-4 py-3 text-slate-600">{zone.type}</td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      zone.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {zone.isActive ? "Active" : "Inactive"}
                  </span>
                </td>

                <td className="px-4 py-3 text-right space-x-3">
                  <button
                    onClick={() => handleEditClick(zone)}
                    className="text-blue-600 hover:underline text-xs font-medium"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(zone.id)}
                    className="text-red-600 hover:underline text-xs font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
