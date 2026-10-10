import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getCarsTracking } from "../api/cars";
import type { CarTrackingItem } from "../types/car";
import { HiOutlineMap, HiOutlineExclamationCircle } from "react-icons/hi2";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

function createColoredIcon(color: string) {
  return new L.DivIcon({
    className: "",
    html: `<div style="
      width: 14px;
      height: 14px;
      border-radius: 50%;
      background: ${color};
      border: 2px solid white;
      box-shadow: 0 1px 4px rgba(0,0,0,0.4);
    "></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function CarsTrackingPage() {
  const [cars, setCars] = useState<CarTrackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getCarsTracking()
      .then(setCars)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-slate-500">Loading...</p>;

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        Error: {error}
      </div>
    );
  }

  const center: [number, number] = [25.2048, 55.2708];
  const onlineCount = cars.filter((c) => c.online).length;
  const availableCount = cars.filter((c) => c.status === "Available").length;
  const rentedCount = cars.filter((c) => c.activeRentalId !== null).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineMap className="text-blue-600" size={28} />
            <span>Live Fleet Tracking</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time GPS tracking and telemetry for {cars.length} active fleet
            vehicles.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Online Vehicles
          </p>
          <p className="text-2xl font-bold text-emerald-600">{onlineCount}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Available Vehicles
          </p>
          <p className="text-2xl font-bold text-blue-600">{availableCount}</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
            Rented Vehicles
          </p>
          <p className="text-2xl font-bold text-slate-800">{rentedCount}</p>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden shadow-sm border border-slate-200"
        style={{ height: "600px" }}
      >
        <MapContainer
          center={center}
          zoom={11}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}"
            attribution="Tiles &copy; Esri"
          />
          <TileLayer url="https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}" />

          {cars.map((car) => {
            const markerColor =
              car.activeRentalId !== null
                ? "#ef4444"
                : car.online
                  ? "#2563eb"
                  : "#94a3b8";

            return (
              <Marker
                key={car.id}
                position={[car.latitude, car.longitude]}
                icon={createColoredIcon(markerColor)}
              >
                <Popup>
                  <div className="text-sm min-w-[160px] p-1">
                    <p className="font-bold text-slate-900">
                      {car.brandName} {car.modelName}
                    </p>
                    <p className="text-slate-500 text-xs mb-2 font-mono">
                      {car.plateNumber}
                    </p>
                    <div className="space-y-1 text-xs">
                      <p>
                        <span className="text-slate-500">Status:</span>{" "}
                        <span className="font-semibold text-slate-800">
                          {car.status}
                        </span>
                      </p>
                      <p>
                        <span className="text-slate-500">Fuel:</span>{" "}
                        <span className="font-semibold text-slate-800">
                          {car.fuelLevel.toFixed(0)}%
                        </span>
                      </p>
                      <p className="flex items-center gap-1.5 pt-1">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${car.online ? "bg-emerald-500" : "bg-slate-300"}`}
                        />
                        <span className="font-medium">
                          {car.online ? "Online" : "Offline"}
                        </span>
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>
    </div>
  );
}
