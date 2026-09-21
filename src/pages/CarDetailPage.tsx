import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCarById, updateCar } from "../api/cars";
import type { CarDetail } from "../types/car";

export default function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    maxSpeed: "0",
    price: "0",
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCarById(Number(id))
      .then((data) => {
        setCar(data);
        setFormData({
          maxSpeed: String(data.maxSpeed),
          price: String(data.price),
        });
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-slate-500">Loading...</p>;

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!car) return null;

  async function handleSave() {
    if (!id) return;
    setSaving(true);
    setError("");
    try {
      const payload = {
        maxSpeed: Number(formData.maxSpeed),
        price: Number(formData.price),
      };
      const updated = await updateCar(Number(id), payload);
      setCar((prev) => (prev ? { ...prev, ...updated } : updated));
      setIsEditing(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        to="/cars"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to cars
      </Link>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 overflow-hidden mb-6">
        <img
          src={car.imageUrl}
          alt={`${car.brandName} ${car.modelName}`}
          className="w-full h-64 object-cover"
        />
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {car.brandName} {car.modelName} ({car.manufactureYear})
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {car.plateNumber} · {car.colorName}
              </p>
            </div>
            <span
              className={`px-3 py-1.5 rounded-full text-sm font-semibold ${
                car.isActive
                  ? "bg-green-50 text-green-700 ring-1 ring-green-200"
                  : "bg-slate-100 text-slate-500 ring-1 ring-slate-200"
              }`}
            >
              {car.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
            Technical details
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="text-xs font-medium text-blue-600 hover:underline"
            >
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="text-xs font-medium text-slate-500 hover:underline"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="text-xs font-medium text-blue-600 hover:underline disabled:opacity-50"
              >
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          )}
        </div>

        {!isEditing ? (
          <dl className="space-y-2 text-sm">
            <Row label="Body type" value={car.bodyType} />
            <Row label="Fuel type" value={car.fuelTypeName} />
            <Row
              label="Fuel level"
              value={`${car.fuelLevel.toFixed(1)} / ${car.fuelTankCapacity}`}
            />
            <Row label="Seats" value={car.seats} />
            <Row label="Max speed" value={`${car.maxSpeed} km/h`} />
            <Row label="Price (daily)" value={`${car.price} AED`} />
            <Row label="Mileage" value={`${car.distance.toFixed(1)} km`} />
            <Row label="Chassis number" value={car.chassisNumber} />
            <Row label="IMEI" value={car.imei} />
          </dl>
        ) : (
          <div className="space-y-3 text-sm">
            <div>
              <label className="block text-slate-500 mb-1">
                Max speed (km/h)
              </label>
              <input
                type="number"
                value={formData.maxSpeed}
                onChange={(e) =>
                  setFormData({ ...formData, maxSpeed: e.target.value })
                }
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-slate-500 mb-1">
                Price (daily, AED)
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Features
        </h2>
        {car.carFeatures.length === 0 ? (
          <p className="text-sm text-slate-400">No features.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {car.carFeatures.map((f) => (
              <span
                key={f.id}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 ring-1 ring-blue-200"
              >
                {f.name}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Cities available for ending trip
        </h2>
        {car.endTripAvailableCities.length === 0 ? (
          <p className="text-sm text-slate-400">No data.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {car.endTripAvailableCities.map((c) => (
              <span
                key={c.id}
                className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600"
              >
                {c.name}
              </span>
            ))}
          </div>
        )}
      </div>
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
