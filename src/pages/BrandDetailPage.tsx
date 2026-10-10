import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  getBrandModels,
  getBrandColors,
  createBrandModel,
  createBrandColor,
} from "../api/brands";
import type { BrandModel, BrandColor } from "../api/brands";
import {
  HiOutlineArrowLongLeft,
  HiOutlineExclamationCircle,
  HiOutlineCube,
  HiOutlineSwatch,
  HiOutlinePlus,
} from "react-icons/hi2";

export default function BrandDetailPage() {
  const { id } = useParams();
  const brandId = Number(id);
  const [models, setModels] = useState<BrandModel[]>([]);
  const [colors, setColors] = useState<BrandColor[]>([]);
  const [error, setError] = useState("");

  const [mName, setMName] = useState("");
  const [mSeats, setMSeats] = useState("5");
  const [mSpeed, setMSpeed] = useState("180");
  const [cName, setCName] = useState("");
  const [cHex, setCHex] = useState("#2563EB");

  const [savingModel, setSavingModel] = useState(false);
  const [savingColor, setSavingColor] = useState(false);

  useEffect(() => {
    load();
  }, [id]);

  function load() {
    getBrandModels(brandId)
      .then(setModels)
      .catch((e) => setError((e as Error).message));
    getBrandColors(brandId)
      .then(setColors)
      .catch((e) => setError((e as Error).message));
  }

  async function addModel(e: React.FormEvent) {
    e.preventDefault();
    setSavingModel(true);
    setError("");
    try {
      await createBrandModel(brandId, {
        name: mName.trim(),
        seats: Number(mSeats),
        maxSpeed: Number(mSpeed),
      });
      setMName("");
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingModel(false);
    }
  }

  async function addColor(e: React.FormEvent) {
    e.preventDefault();
    setSavingColor(true);
    setError("");
    try {
      await createBrandColor(brandId, { name: cName.trim(), hexCode: cHex });
      setCName("");
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSavingColor(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back Link */}
      <Link
        to="/brands"
        className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1.5"
      >
        <HiOutlineArrowLongLeft size={20} />
        <span>Back to brands</span>
      </Link>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}

      {/* Models Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <HiOutlineCube size={18} className="text-blue-600" />
          <span>Brand Models</span>
        </h2>

        <form
          onSubmit={addModel}
          className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end bg-slate-50/70 p-4 rounded-xl border border-slate-100"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Model Name
            </label>
            <input
              required
              value={mName}
              onChange={(e) => setMName(e.target.value)}
              placeholder="e.g. Model S"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Seats
            </label>
            <input
              type="number"
              value={mSeats}
              onChange={(e) => setMSeats(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Max Speed (km/h)
            </label>
            <input
              type="number"
              value={mSpeed}
              onChange={(e) => setMSpeed(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            disabled={savingModel}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50 h-[38px]"
          >
            <HiOutlinePlus size={16} />
            <span>{savingModel ? "Adding..." : "Add model"}</span>
          </button>
        </form>

        {models.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium py-4 text-center">
            No models registered yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {models.map((m) => (
              <li
                key={m.id}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
              >
                <span className="font-bold text-slate-900">{m.name}</span>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                  {m.seats} seats · {m.maxSpeed} km/h
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Colors Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-6">
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <HiOutlineSwatch size={18} className="text-blue-600" />
          <span>Brand Colors</span>
        </h2>

        <form
          onSubmit={addColor}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end bg-slate-50/70 p-4 rounded-xl border border-slate-100"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Color Name
            </label>
            <input
              required
              value={cName}
              onChange={(e) => setCName(e.target.value)}
              placeholder="e.g. Pearl White"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Hex Code
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={cHex}
                onChange={(e) => setCHex(e.target.value)}
                className="w-12 h-[38px] border border-slate-300 rounded-xl p-1 bg-white cursor-pointer shrink-0"
              />
              <input
                type="text"
                value={cHex}
                onChange={(e) => setCHex(e.target.value)}
                className="w-full rounded-xl border border-slate-300 px-3.5 py-2 text-sm uppercase bg-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            disabled={savingColor}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition shadow-sm disabled:opacity-50 h-[38px]"
          >
            <HiOutlinePlus size={16} />
            <span>{savingColor ? "Adding..." : "Add color"}</span>
          </button>
        </form>

        {colors.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium py-4 text-center">
            No colors registered yet.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {colors.map((c) => (
              <li
                key={c.id}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="w-5 h-5 rounded-full border border-slate-200 shadow-xs"
                    style={{ backgroundColor: c.hexCode }}
                  />
                  <span className="font-bold text-slate-900">{c.name}</span>
                </div>
                <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
                  {c.hexCode}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
