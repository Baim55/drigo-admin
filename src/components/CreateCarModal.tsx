import { useEffect, useState } from "react";
import { createCar, getCarFeatures } from "../api/cars";
import type { CreateCarPayload } from "../api/cars";
import { getBrands, getBrandModels, getBrandColors } from "../api/brands";
import type { Brand, BrandModel, BrandColor } from "../api/brands";

interface CreateCarModalProps {
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateCarModal({
  onClose,
  onCreated,
}: CreateCarModalProps) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [models, setModels] = useState<BrandModel[]>([]);
  const [colors, setColors] = useState<BrandColor[]>([]);

  const [brandId, setBrandId] = useState<number | "">("");
  const [modelId, setModelId] = useState<number | "">("");
  const [colorId, setColorId] = useState<number | "">("");
  const [manufactureYear, setManufactureYear] = useState(
    new Date().getFullYear(),
  );
  const [plateNumber, setPlateNumber] = useState("");
  const [chassisNumber, setChassisNumber] = useState("");
  const [imei, setImei] = useState("");
  const [maxSpeed, setMaxSpeed] = useState(180);
  const [seats, setSeats] = useState(5);
  const [price, setPrice] = useState(100);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [allFeatures, setAllFeatures] = useState<
    { id: number; name: string }[]
  >([]);
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<number[]>([]);

  useEffect(() => {
    getBrands()
      .then((res) => setBrands(res.data))
      .catch((err) => setError(err.message));

    getCarFeatures()
      .then(setAllFeatures)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!brandId) {
      setModels([]);
      setColors([]);
      setModelId("");
      setColorId("");
      return;
    }
    getBrandModels(Number(brandId))
      .then(setModels)
      .catch((err) => setError((err as Error).message));
    getBrandColors(Number(brandId))
      .then(setColors)
      .catch((err) => setError((err as Error).message));
    setModelId("");
    setColorId("");
  }, [brandId]);

  useEffect(() => {
    const selected = models.find((m) => m.id === modelId);
    if (selected) {
      setSeats(selected.seats);
      setMaxSpeed(selected.maxSpeed);
    }
  }, [modelId, models]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!brandId || !modelId || !colorId) {
      setError("Please select brand, model and color.");
      return;
    }

    const payload: CreateCarPayload = {
      brandId: Number(brandId),
      modelId: Number(modelId),
      colorId: Number(colorId),
      manufactureYear,
      plateNumber,
      chassisNumber,
      imei,
      maxSpeed,
      seats,
      price,
      carFeatureIds: selectedFeatureIds,
    };

    setSaving(true);
    try {
      await createCar(payload);
      onCreated();
      onClose();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-800">Add car</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
              Error: {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <Field label="Brand">
              <select
                required
                value={brandId}
                onChange={(e) => setBrandId(Number(e.target.value))}
                className="select"
              >
                <option value="">Select brand</option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Model">
              <select
                required
                value={modelId}
                onChange={(e) => setModelId(Number(e.target.value))}
                disabled={!brandId}
                className="select"
              >
                <option value="">Select model</option>
                {models.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Color">
              <select
                required
                value={colorId}
                onChange={(e) => setColorId(Number(e.target.value))}
                disabled={!brandId}
                className="select"
              >
                <option value="">Select color</option>
                {colors.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Year">
              <input
                type="number"
                required
                value={manufactureYear}
                onChange={(e) => setManufactureYear(Number(e.target.value))}
                className="input"
              />
            </Field>

            <Field label="Plate number">
              <input
                required
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Chassis number">
              <input
                required
                value={chassisNumber}
                onChange={(e) => setChassisNumber(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="IMEI">
              <input
                required
                value={imei}
                onChange={(e) => setImei(e.target.value)}
                className="input"
              />
            </Field>

            <Field label="Seats">
              <input
                type="number"
                required
                value={seats}
                onChange={(e) => setSeats(Number(e.target.value))}
                className="input"
              />
            </Field>

            <Field label="Max speed (km/h)">
              <input
                type="number"
                required
                value={maxSpeed}
                onChange={(e) => setMaxSpeed(Number(e.target.value))}
                className="input"
              />
            </Field>

            <Field label="Price (daily, AED)">
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="input"
              />
            </Field>
            <div className="col-span-2">
              <span className="block text-slate-500 mb-1 text-sm">
                Car Features
              </span>
              <div className="flex flex-wrap gap-3 max-h-32 overflow-y-auto p-2 border border-slate-200 rounded-md">
                {allFeatures.map((feat) => {
                  const isChecked = selectedFeatureIds.includes(feat.id);
                  return (
                    <label
                      key={feat.id}
                      className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFeatureIds([
                              ...selectedFeatureIds,
                              feat.id,
                            ]);
                          } else {
                            setSelectedFeatureIds(
                              selectedFeatureIds.filter((id) => id !== feat.id),
                            );
                          }
                        }}
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      />
                      {feat.name}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-md transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50 transition"
            >
              {saving ? "Creating..." : "Create car"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="block text-slate-500 mb-1">{label}</span>
      {children}
    </label>
  );
}
