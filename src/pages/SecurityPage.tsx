import { useEffect, useState } from "react";
import {
  getBlockedIps,
  blockIp,
  unblockIp,
  getBlockedCountries,
  blockCountry,
  unblockCountry,
  getSmsMode,
  setSmsMode,
} from "../api/security";
import type { BlockedIp, BlockedCountry } from "../api/security";
import {
  HiOutlineShieldCheck,
  HiOutlineExclamationCircle,
  HiOutlineGlobeAmericas,
  HiOutlineServer,
  HiOutlineChatBubbleBottomCenterText,
} from "react-icons/hi2";

export default function SecurityPage() {
  const [ips, setIps] = useState<BlockedIp[]>([]);
  const [countries, setCountries] = useState<BlockedCountry[]>([]);
  const [mode, setMode] = useState("Whitelist");
  const [smsCountries, setSmsCountries] = useState("");
  const [ip, setIp] = useState("");
  const [ipReason, setIpReason] = useState("");
  const [cc, setCc] = useState("");
  const [ccReason, setCcReason] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  function load() {
    Promise.all([getBlockedIps(), getBlockedCountries(), getSmsMode()])
      .then(([i, c, s]) => {
        setIps(i);
        setCountries(c);
        setMode(s.mode);
        setSmsCountries(s.countries.join(", "));
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false));
  }

  async function run(fn: () => Promise<unknown>, done?: string) {
    setError("");
    setMessage("");
    try {
      await fn();
      if (done) setMessage(done);
      load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  function addIp(e: React.FormEvent) {
    e.preventDefault();
    run(() => blockIp(ip.trim(), ipReason.trim()));
    setIp("");
    setIpReason("");
  }

  function addCountry(e: React.FormEvent) {
    e.preventDefault();
    run(() => blockCountry(cc.trim().toUpperCase(), ccReason.trim()));
    setCc("");
    setCcReason("");
  }

  function saveSms(e: React.FormEvent) {
    e.preventDefault();
    const list = smsCountries
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .filter(Boolean);
    run(() => setSmsMode(mode, list), "SMS mode saved.");
  }

  if (loading) return <p className="text-slate-500 font-medium">Loading...</p>;

  const input =
    "rounded-xl border border-slate-300 px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500";
  const card =
    "bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 space-y-5";

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <HiOutlineShieldCheck className="text-blue-600" size={28} />
            <span>Security & Access Control</span>
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage blocked IP addresses, country restrictions, and SMS
            distribution settings.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
          <HiOutlineExclamationCircle size={20} className="shrink-0" />
          <span>Error: {error}</span>
        </div>
      )}
      {message && (
        <div className="rounded-xl bg-green-50 border border-green-200 p-4 text-sm text-green-700 flex items-center gap-3">
          <HiOutlineShieldCheck size={20} className="shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Blocked IPs Section */}
      <div className={card}>
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <HiOutlineServer className="text-blue-600" size={20} />
          <span>Blocked IPs</span>
        </h2>
        <form onSubmit={addIp} className="flex flex-wrap gap-3">
          <input
            required
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            placeholder="IP address"
            className={input}
          />
          <input
            required
            value={ipReason}
            onChange={(e) => setIpReason(e.target.value)}
            placeholder="Reason"
            className={`${input} flex-1 min-w-[200px]`}
          />
          <button className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition shadow-sm">
            Block IP
          </button>
        </form>
        {ips.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium py-2">
            No blocked IPs.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {ips.map((b) => (
              <li
                key={b.entry}
                className="py-3 flex items-center justify-between"
              >
                <span>
                  <span className="font-mono font-bold text-slate-900">
                    {b.entry}
                  </span>
                  <span className="text-slate-500 ml-3">
                    {b.reason} · {new Date(b.blockedAt).toLocaleDateString()}
                  </span>
                </span>
                <button
                  onClick={() =>
                    window.confirm(`Unblock ${b.entry}?`) &&
                    run(() => unblockIp(b.entry))
                  }
                  className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition"
                >
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Blocked Countries Section */}
      <div className={card}>
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <HiOutlineGlobeAmericas className="text-blue-600" size={20} />
          <span>Blocked Countries</span>
        </h2>
        <form onSubmit={addCountry} className="flex flex-wrap gap-3">
          <input
            required
            maxLength={2}
            value={cc}
            onChange={(e) => setCc(e.target.value)}
            placeholder="Code (e.g. XX)"
            className={`${input} w-32 uppercase`}
          />
          <input
            required
            value={ccReason}
            onChange={(e) => setCcReason(e.target.value)}
            placeholder="Reason"
            className={`${input} flex-1 min-w-[200px]`}
          />
          <button className="text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl transition shadow-sm">
            Block Country
          </button>
        </form>
        {countries.length === 0 ? (
          <p className="text-sm text-slate-400 font-medium py-2">
            No blocked countries.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100 text-sm">
            {countries.map((c) => (
              <li
                key={c.countryCode}
                className="py-3 flex items-center justify-between"
              >
                <span>
                  <span className="font-mono font-bold text-slate-900">
                    {c.countryCode}
                  </span>
                  <span className="text-slate-500 ml-3">
                    {c.reason} · {new Date(c.blockedAt).toLocaleDateString()}
                  </span>
                </span>
                <button
                  onClick={() =>
                    window.confirm(`Unblock ${c.countryCode}?`) &&
                    run(() => unblockCountry(c.countryCode))
                  }
                  className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-xl transition"
                >
                  Unblock
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* SMS Country Mode Section */}
      <form onSubmit={saveSms} className={card}>
        <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
          <HiOutlineChatBubbleBottomCenterText
            className="text-blue-600"
            size={20}
          />
          <span>SMS Country Mode</span>
        </h2>
        <div className="flex flex-wrap items-end gap-3">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className={`${input} bg-white`}
          >
            <option value="Whitelist">Whitelist</option>
            <option value="Blacklist">Blacklist</option>
          </select>
          <input
            value={smsCountries}
            onChange={(e) => setSmsCountries(e.target.value)}
            placeholder="AE, AZ, TR"
            className={`${input} flex-1 min-w-[200px]`}
          />
          <button className="text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-xl transition shadow-sm">
            Save SMS Mode
          </button>
        </div>
      </form>
    </div>
  );
}
