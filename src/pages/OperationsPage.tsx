import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getCleanings,
  cancelCleaning,
  getCarServices,
  setCarServiceStatus,
  getInquiries,
  setInquiryStatus,
} from "../api/operations";
import type { Cleaning, CarService, BusinessInquiry } from "../api/operations";
import {
  HiOutlineWrenchScrewdriver,
  HiOutlineExclamationCircle,
  HiOutlineSparkles,
  HiOutlineTruck,
  HiOutlineBuildingOffice2,
  HiOutlineXMark,
} from "react-icons/hi2";

type Tab = "cleanings" | "services" | "inquiries";

const SERVICE_STATUSES = ["Scheduled", "InProgress", "Completed", "Cancelled"];
const INQUIRY_STATUSES = ["New", "Contacted", "Closed"];

const badge = (s: string) =>
  `px-3 py-1 rounded-full text-xs font-semibold ${
    s === "Completed" || s === "Closed"
      ? "bg-green-50 text-green-700 ring-1 ring-green-200"
      : s === "Cancelled"
        ? "bg-red-50 text-red-700 ring-1 ring-red-200"
        : s === "InProgress" || s === "Contacted"
          ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
          : "bg-blue-50 text-blue-700 ring-1 ring-blue-200"
  }`;

const th = "px-6 py-3.5";
const td = "px-6 py-4 text-slate-600";

export default function OperationsPage() {
  const [tab, setTab] = useState<Tab>("cleanings");
  const [cleanings, setCleanings] = useState<Cleaning[]>([]);
  const [services, setServices] = useState<CarService[]>([]);
  const [inquiries, setInquiries] = useState<BusinessInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    load();
  }, []);

  function load() {
    setLoading(true);
    Promise.all([getCleanings(), getCarServices(), getInquiries()])
      .then(([c, s, i]) => {
        setCleanings(c);
        setServices(s);
        setInquiries(i);
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  async function run(id: number, fn: () => Promise<unknown>) {
    setBusyId(id);
    setError("");
    try {
      await fn();
      load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusyId(null);
    }
  }

  const tabBtn = (t: Tab, label: string, icon: React.ReactNode) => (
    <button
      onClick={() => setTab(t)}
      className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
        tab === t
          ? "bg-slate-900 text-white shadow-sm"
          : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const box =
    "bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden";
  const head =
    "bg-slate-50 text-slate-500 text-left text-xs uppercase tracking-wider border-b border-slate-200 font-semibold";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineWrenchScrewdriver className="text-blue-600" size={28} />
            <span>Operations</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage car cleanings, maintenance services, and corporate business
            inquiries.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabBtn("cleanings", "Cleanings", <HiOutlineSparkles size={18} />)}
        {tabBtn("services", "Car services", <HiOutlineTruck size={18} />)}
        {tabBtn(
          "inquiries",
          "Business inquiries",
          <HiOutlineBuildingOffice2 size={18} />,
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}
      {loading && <p className="text-slate-500 font-medium">Loading...</p>}

      {!loading && tab === "cleanings" && (
        <div className={box}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm min-w-[700px]">
              <thead className={head}>
                <tr>
                  <th className={th}>Car</th>
                  <th className={th}>Type</th>
                  <th className={th}>Scheduled</th>
                  <th className={th}>Cost</th>
                  <th className={th}>Status</th>
                  <th className={th} className="text-right px-6">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cleanings.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className={td}>
                      <Link
                        to={`/cars/${c.carId}`}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        {c.carName} ({c.plateNumber})
                      </Link>
                    </td>
                    <td className={td}>{c.type}</td>
                    <td className={td}>
                      {new Date(c.scheduledAt).toLocaleDateString()}
                    </td>
                    <td className={`${td} font-semibold`}>
                      {c.cost} {c.currency}
                    </td>
                    <td className="px-6 py-4">
                      <span className={badge(c.status)}>{c.status}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {(c.status === "Scheduled" ||
                        c.status === "InProgress") && (
                        <button
                          disabled={busyId === c.id}
                          onClick={() =>
                            window.confirm("Cancel this cleaning?") &&
                            run(c.id, () => cancelCleaning(c.id))
                          }
                          className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                        >
                          <HiOutlineXMark size={14} />
                          <span>Cancel</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === "services" && (
        <div className={box}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm min-w-[700px]">
              <thead className={head}>
                <tr>
                  <th className={th}>Car</th>
                  <th className={th}>Type</th>
                  <th className={th}>Odometer</th>
                  <th className={th}>Cost</th>
                  <th className={th}>Scheduled</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {services.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className={td}>
                      <Link
                        to={`/cars/${s.carId}`}
                        className="font-bold text-blue-600 hover:underline"
                      >
                        {s.plateNumber}
                      </Link>
                    </td>
                    <td className={td}>{s.type}</td>
                    <td className={td}>{s.odometer.toLocaleString()} km</td>
                    <td className={`${td} font-semibold`}>
                      {s.cost} {s.currency}
                    </td>
                    <td className={td}>
                      {new Date(s.scheduledAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={s.status}
                        disabled={busyId === s.id}
                        onChange={(e) =>
                          run(s.id, () =>
                            setCarServiceStatus(s.id, e.target.value),
                          )
                        }
                        className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer ${badge(s.status)}`}
                      >
                        {SERVICE_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tab === "inquiries" && (
        <div className={box}>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm min-w-[700px]">
              <thead className={head}>
                <tr>
                  <th className={th}>Company</th>
                  <th className={th}>Contact</th>
                  <th className={th}>Fleet</th>
                  <th className={th}>Message</th>
                  <th className={th}>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {inquiries.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {q.companyName}
                    </td>
                    <td className={td}>
                      <span className="font-semibold text-slate-800">
                        {q.contactName}
                      </span>
                      <br />
                      <span className="text-xs text-slate-400">
                        {q.email} · {q.phone}
                      </span>
                    </td>
                    <td className={td}>{q.fleetSize}</td>
                    <td className={`${td} max-w-xs truncate`} title={q.message}>
                      {q.message}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={q.status}
                        disabled={busyId === q.id}
                        onChange={(e) =>
                          run(q.id, () =>
                            setInquiryStatus(q.id, e.target.value),
                          )
                        }
                        className={`rounded-full px-3 py-1 text-xs font-semibold border-0 cursor-pointer ${badge(q.status)}`}
                      >
                        {(INQUIRY_STATUSES.includes(q.status)
                          ? INQUIRY_STATUSES
                          : [...INQUIRY_STATUSES, q.status]
                        ).map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
