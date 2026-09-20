import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCarById } from "../api/cars";
import type { CarDetail } from "../types/car";

export default function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCarById(Number(id))
      .then(setCar)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="text-slate-500">Yüklənir...</p>;

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        Xəta: {error}
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="max-w-5xl mx-auto">
      <Link
        to="/cars"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Maşınlara qayıt
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
              {car.isActive ? "Aktiv" : "Deaktiv"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Texniki məlumat
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Ban tipi" value={car.bodyType} />
            <Row label="Yanacaq növü" value={car.fuelTypeName} />
            <Row
              label="Yanacaq səviyyəsi"
              value={`${car.fuelLevel.toFixed(1)} / ${car.fuelTankCapacity}`}
            />
            <Row label="Oturacaq sayı" value={car.seats} />
            <Row label="Maksimum sürət" value={`${car.maxSpeed} km/saat`} />
            <Row label="Yürüş" value={`${car.distance.toFixed(1)} km`} />
            <Row label="Şassi nömrəsi" value={car.chassisNumber} />
            <Row label="IMEI" value={car.imei} />
          </dl>
        </div>

        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Qiymət və Lokasiya
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Qiymət (gündəlik)" value={`${car.price} AED`} />
            <Row label="Ünvan" value={car.location.address} />
            <Row label="Şəhər" value={car.location.city} />
            <Row
              label="Pulsuz parking"
              value={car.freeParking ? "Var" : "Yox"}
            />
            <Row label="Pulsuz yanacaq" value={car.freeFuel ? "Var" : "Yox"} />
            <Row label="Sığorta" value={car.insurance ? "Var" : "Yox"} />
          </dl>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Xüsusiyyətlər
        </h2>
        {car.carFeatures.length === 0 ? (
          <p className="text-sm text-slate-400">Xüsusiyyət yoxdur.</p>
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
          Trip bitirmə üçün mövcud şəhərlər
        </h2>
        {car.endTripAvailableCities.length === 0 ? (
          <p className="text-sm text-slate-400">Məlumat yoxdur.</p>
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
