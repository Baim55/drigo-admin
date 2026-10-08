import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Polygon, Popup } from "react-leaflet";
import { getGeoZones, deleteGeoZone } from "../api/geozones";
import type { GeoZone } from "../types/geozone";

export default function GeoZonesPage() {
  const [zones, setZones] = useState<GeoZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    getGeoZones()
      .then(setZones)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Delete this zone?");
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await deleteGeoZone(id);
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeletingId(null);
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

  const center: [number, number] = [25.15, 55.3];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Geo Zones</h1>

      <div
        className="rounded-2xl overflow-hidden shadow-sm ring-1 ring-slate-200 mb-6"
        style={{ height: "450px" }}
      >
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
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
              </Popup>
            </Polygon>
          ))}
        </MapContainer>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-600 text-left border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Type</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {zones.map((zone) => (
              <tr
                key={zone.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="px-4 py-3 font-semibold text-slate-800">
                  <span
                    className="inline-block w-3 h-3 rounded-sm mr-2 align-middle"
                    style={{ backgroundColor: zone.color }}
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
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleDelete(zone.id)}
                    disabled={deletingId === zone.id}
                    className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
                  >
                    {deletingId === zone.id ? "Deleting..." : "Delete"}
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
