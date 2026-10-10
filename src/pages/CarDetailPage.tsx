import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  deleteCar,
  getCarById,
  getCarStatus,
  sendCarCommand,
  toggleCarActive,
  updateCar,
  type CarCommand,
  type CarStatus,
} from "../api/cars";
import type { CarDetail } from "../types/car";
import {
  HiOutlineArrowLongLeft,
  HiOutlineExclamationCircle,
  HiOutlinePencilSquare,
  HiOutlineTrash,
  HiOutlineShieldCheck,
  HiOutlineCog6Tooth,
} from "react-icons/hi2";

export default function CarDetailPage() {
  const { id } = useParams();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();
  const [toggling, setToggling] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [status, setStatus] = useState<CarStatus | null>(null);
  const [statusError, setStatusError] = useState("");
  const [sendingCommand, setSendingCommand] = useState<CarCommand | null>(null);

  const [formData, setFormData] = useState({
    maxSpeed: "",
    plateNumber: "",
    manufactureYear: "",
    chassisNumber: "",
    transmission: "",
    distance: "",
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getCarById(Number(id))
      .then((data) => {
        setCar(data);
        setFormData({
          maxSpeed: String(data.maxSpeed || ""),
          plateNumber: data.plateNumber || "",
          manufactureYear: String(data.manufactureYear || ""),
          chassisNumber: data.chassisNumber || "",
          transmission:
            data.transmission !== undefined ? String(data.transmission) : "",
          distance: String(data.distance || ""),
        });
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    getCarStatus(Number(id))
      .then(setStatus)
      .catch((err) => setStatusError((err as Error).message));
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
      const payload: Record<string, unknown> = {
        maxSpeed: Number(formData.maxSpeed),
        plateNumber: formData.plateNumber,
        manufactureYear: Number(formData.manufactureYear),
        chassisNumber: formData.chassisNumber,
        distance: Number(formData.distance),
      };
      if (formData.transmission !== "") {
        payload.transmission = Number(formData.transmission);
      }
      await updateCar(Number(id), payload);
      const fresh = await getCarById(Number(id));
      setCar(fresh);
      setFormData({
        maxSpeed: String(fresh.maxSpeed || ""),
        plateNumber: fresh.plateNumber || "",
        manufactureYear: String(fresh.manufactureYear || ""),
        chassisNumber: fresh.chassisNumber || "",
        transmission:
          fresh.transmission !== undefined ? String(fresh.transmission) : "",
        distance: String(fresh.distance || ""),
      });
      setIsEditing(false);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    if (!id) return;
    setToggling(true);
    setError("");
    try {
      const updated = await toggleCarActive(Number(id));
      setCar((prev) => (prev ? { ...prev, ...updated } : updated));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setToggling(false);
    }
  }

  async function handleDelete() {
    if (!id) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this car? This cannot be undone.",
    );
    if (!confirmed) return;

    setDeleting(true);
    setError("");
    try {
      await deleteCar(Number(id));
      navigate("/cars");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setDeleting(false);
    }
  }

  async function handleSendCommand(command: CarCommand) {
    if (!id) return;
    setSendingCommand(command);
    setStatusError("");
    try {
      await sendCarCommand(Number(id), command);
      const updated = await getCarStatus(Number(id));
      setStatus(updated);
    } catch (err) {
      setStatusError((err as Error).message);
    } finally {
      setSendingCommand(null);
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <Link
        to="/cars"
        className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1.5"
      >
        <HiOutlineArrowLongLeft size={20} />
        <span>Back to cars</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="h-64 sm:h-80 w-full overflow-hidden bg-slate-100">
          <img
            src={car.imageUrl}
            alt={`${car.brandName} ${car.modelName}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                {car.brandName} {car.modelName}{" "}
                <span className="text-slate-400 font-normal">
                  ({car.manufactureYear})
                </span>
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-1 flex items-center gap-2">
                <span className="bg-slate-100 px-2.5 py-0.5 rounded-lg text-slate-700">
                  {car.plateNumber}
                </span>
                <span>·</span>
                <span>{car.colorName}</span>
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  car.isActive
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-slate-100 text-slate-600 ring-1 ring-slate-200"
                }`}
              >
                {car.isActive ? "Active" : "Inactive"}
              </span>
              <button
                onClick={handleToggleActive}
                disabled={toggling}
                className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition shadow-xs"
              >
                {toggling ? "..." : car.isActive ? "Deactivate" : "Activate"}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs font-semibold px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition shadow-xs"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <HiOutlineShieldCheck size={18} className="text-blue-600" />
              <span>Live status & commands</span>
            </h2>

            {statusError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-sm text-red-600 mb-4">
                Error: {statusError}
              </div>
            )}

            {status ? (
              <dl className="space-y-2.5 text-sm mb-6">
                <Row label="Engine" value={status.engineOn ? "On" : "Off"} />
                <Row
                  label="Doors locked"
                  value={status.doorsLocked ? "Yes" : "No"}
                />
                <Row label="Online" value={status.online ? "Yes" : "No"} />
                <Row label="Speed" value={`${status.speed} km/h`} />
                <Row
                  label="Fuel level"
                  value={`${status.fuelLevel.toFixed(1)}%`}
                />
              </dl>
            ) : (
              <p className="text-sm text-slate-400 mb-6 font-medium">
                Loading telemetry status...
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pt-4 border-t border-slate-100">
            <CommandButton
              label="Lock"
              active={sendingCommand === "lock"}
              onClick={() => handleSendCommand("lock")}
            />
            <CommandButton
              label="Unlock"
              active={sendingCommand === "unlock"}
              onClick={() => handleSendCommand("unlock")}
            />
            <CommandButton
              label="Engine on"
              active={sendingCommand === "engine_on"}
              onClick={() => handleSendCommand("engine_on")}
            />
            <CommandButton
              label="Engine off"
              active={sendingCommand === "engine_off"}
              onClick={() => handleSendCommand("engine_off")}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <HiOutlineCog6Tooth size={18} className="text-blue-600" />
              <span>Technical details</span>
            </h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs font-semibold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1"
              >
                <HiOutlinePencilSquare size={16} />
                <span>Edit</span>
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-semibold text-slate-500 hover:bg-slate-100 px-3 py-1.5 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-1.5 rounded-lg disabled:opacity-50 transition shadow-xs"
                >
                  {saving ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

          {!isEditing ? (
            <dl className="space-y-2.5 text-sm">
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
              <Row
                label="Transmission"
                value={
                  car.transmission === 0
                    ? "Automatic"
                    : car.transmission === 1
                      ? "Manual"
                      : "N/A"
                }
              />
            </dl>
          ) : (
            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Max speed (km/h)
                </label>
                <input
                  type="number"
                  value={formData.maxSpeed}
                  onChange={(e) =>
                    setFormData({ ...formData, maxSpeed: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Plate number
                </label>
                <input
                  type="text"
                  value={formData.plateNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, plateNumber: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Manufacture Year
                </label>
                <input
                  type="number"
                  value={formData.manufactureYear}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      manufactureYear: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Chassis number
                </label>
                <input
                  type="text"
                  value={formData.chassisNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, chassisNumber: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Transmission
                </label>
                <select
                  value={formData.transmission}
                  onChange={(e) =>
                    setFormData({ ...formData, transmission: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="">Select transmission</option>
                  <option value="0">Automatic</option>
                  <option value="1">Manual</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Mileage (km)
                </label>
                <input
                  type="number"
                  value={formData.distance}
                  onChange={(e) =>
                    setFormData({ ...formData, distance: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Features
          </h2>
          {car.carFeatures.length === 0 ? (
            <p className="text-sm text-slate-400">No features.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {car.carFeatures.map((f) => (
                <span
                  key={f.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700 ring-1 ring-blue-200/80"
                >
                  {f.name}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Cities available for ending trip
          </h2>
          {car.endTripAvailableCities.length === 0 ? (
            <p className="text-sm text-slate-400">No data.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {car.endTripAvailableCities.map((c) => (
                <span
                  key={c.id}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700"
                >
                  {c.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between py-1.5 border-b border-slate-100 last:border-0">
      <dt className="text-slate-500 font-medium">{label}</dt>
      <dd className="font-semibold text-slate-800">{value}</dd>
    </div>
  );
}

function CommandButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      disabled={active}
      className="text-xs font-semibold px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 disabled:opacity-50 transition shadow-xs"
    >
      {active ? "Sending..." : label}
    </button>
  );
}
