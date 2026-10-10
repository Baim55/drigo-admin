import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getSupportContext } from "../api/support";
import type { SupportContext } from "../types/support";
import {
  HiOutlineUser,
  HiOutlineShieldCheck,
  HiOutlineTruck,
  HiOutlineCreditCard,
  HiOutlineExclamationCircle,
} from "react-icons/hi2";

function badge(value: string) {
  const style =
    value === "Verified"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : value === "Rejected"
        ? "bg-red-50 text-red-700 ring-1 ring-red-200"
        : "bg-amber-50 text-amber-700 ring-1 ring-amber-200";
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${style}`}
    >
      {value}
    </span>
  );
}

export default function SupportContextPanel({
  ticketId,
}: {
  ticketId: number;
}) {
  const [ctx, setCtx] = useState<SupportContext | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSupportContext(ticketId)
      .then(setCtx)
      .catch((err) => setError((err as Error).message));
  }, [ticketId]);

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
        <HiOutlineExclamationCircle size={20} className="shrink-0" />
        <span>Context error: {error}</span>
      </div>
    );
  }

  if (!ctx)
    return (
      <div className="py-8 text-center text-slate-400 font-medium text-sm">
        Loading context...
      </div>
    );

  return (
    <div className="space-y-4 text-sm">
      {/* Customer Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <HiOutlineUser size={16} className="text-blue-600" />
          <span>Customer profile</span>
        </h3>
        <div>
          <Link
            to={`/customers/${ctx.member.id}`}
            className="font-bold text-slate-900 hover:text-blue-600 hover:underline"
          >
            {ctx.member.fullName}
          </Link>
          <p className="text-slate-500 text-xs font-mono mt-0.5">
            {ctx.member.phoneNumber}
          </p>
          <p className="text-slate-500 text-xs">
            {ctx.member.email ?? "No email"}
          </p>
        </div>
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">Bonus balance:</span>
          <span className="font-semibold text-slate-800">
            {ctx.member.bonusBalance} AED
          </span>
        </div>
        <div className="flex flex-wrap gap-1.5 pt-1">
          {ctx.flags.isBlocked && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 ring-1 ring-red-200">
              Blocked
            </span>
          )}
          {ctx.flags.unverified && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
              Unverified
            </span>
          )}
          {ctx.flags.hasDebt && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 ring-1 ring-red-200">
              Has debt
            </span>
          )}
        </div>
      </div>

      {/* Verification Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <HiOutlineShieldCheck size={16} className="text-blue-600" />
          <span>Verification status</span>
        </h3>
        <div className="space-y-2 text-xs font-medium">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Passport</span>
            {badge(ctx.verification.passport)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Driver license</span>
            {badge(ctx.verification.driverLicense)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Face</span>
            {badge(ctx.verification.face)}
          </div>
        </div>
      </div>

      {/* Active Rental Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <HiOutlineTruck size={16} className="text-blue-600" />
          <span>Active rental</span>
        </h3>
        {ctx.activeRental ? (
          <div className="space-y-1">
            <Link
              to={`/rentals/${ctx.activeRental.id}`}
              className="font-bold text-blue-600 hover:underline"
            >
              Rental #{ctx.activeRental.id}
            </Link>
            <p className="text-slate-600 text-xs font-medium">
              {ctx.activeRental.car}
            </p>
            <p className="text-slate-500 text-xs">{ctx.activeRental.status}</p>
          </div>
        ) : (
          <p className="text-slate-400 text-xs font-medium">None active</p>
        )}
      </div>

      {/* Outstanding Debt Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <HiOutlineCreditCard size={16} className="text-blue-600" />
          <span>Outstanding debt</span>
        </h3>
        {ctx.outstandingDebt.count > 0 ? (
          <Link
            to={`/debts/${ctx.member.id}`}
            className="font-bold text-red-600 hover:underline block"
          >
            {ctx.outstandingDebt.total} {ctx.outstandingDebt.currency} (
            {ctx.outstandingDebt.count} items)
          </Link>
        ) : (
          <p className="text-slate-400 text-xs font-medium">No debt</p>
        )}
      </div>
    </div>
  );
}
