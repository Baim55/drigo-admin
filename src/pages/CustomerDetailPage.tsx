import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getCustomerById,
  verifyCustomer,
  blockCustomer,
  restoreCustomer,
  deleteCustomer,
} from "../api/customers";
import type { CustomerDetail, DocumentDetail } from "../types/customer";
import {
  HiOutlineArrowLongLeft,
  HiOutlineExclamationCircle,
  HiOutlineUser,
  HiOutlineShare,
  HiOutlineFaceSmile,
} from "react-icons/hi2";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

  const navigate = useNavigate();
  const [actionError, setActionError] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    if (!id) return;
    loadCustomer();
  }, [id]);

  function loadCustomer() {
    if (!id) return;
    setLoading(true);
    getCustomerById(id)
      .then(setCustomer)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false));
  }

  async function handleVerify(approve: boolean) {
    if (!id) return;

    let rejectionReason: string | undefined;
    if (!approve) {
      const reason = window.prompt("Reason for rejection:");
      if (reason === null) return;
      rejectionReason = reason;
    }

    setVerifying(true);
    setError("");
    try {
      await verifyCustomer(id, { approve, rejectionReason });
      loadCustomer();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setVerifying(false);
    }
  }

  if (loading)
    return (
      <p className="py-12 text-center text-slate-500 font-medium">
        Loading customer details...
      </p>
    );

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-600 flex items-center gap-3">
        <HiOutlineExclamationCircle size={20} className="shrink-0" />
        <span>Error: {error}</span>
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Link
        to="/customers"
        className="text-sm font-semibold text-blue-600 hover:underline inline-flex items-center gap-1.5"
      >
        <HiOutlineArrowLongLeft size={20} />
        <span>Back to customers</span>
      </Link>

      {/* Header Profile Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {customer.profilePhotoUrl ? (
              <img
                src={customer.profilePhotoUrl}
                alt={customer.fullName}
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shadow-xs"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold shadow-xs">
                {customer.fullName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {customer.fullName}
              </h1>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                {customer.phoneNumber} · {customer.email ?? "No email"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {customer.isBlocked && (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-red-50 text-red-600 ring-1 ring-red-200">
                Blocked
              </span>
            )}
            {customer.isDeleted && (
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                Deleted
              </span>
            )}
            {customer.isVerified ? (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                Verified
              </span>
            ) : (
              <span className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                Pending Verification
              </span>
            )}
          </div>
        </div>

        {!customer.isVerified && (
          <div className="flex gap-3 mt-6 pt-6 border-t border-slate-100">
            <button
              onClick={() => handleVerify(true)}
              disabled={verifying}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition shadow-sm"
            >
              {verifying ? "Processing..." : "Approve Customer"}
            </button>
            <button
              onClick={() => handleVerify(false)}
              disabled={verifying}
              className="text-sm font-semibold px-5 py-2.5 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition shadow-sm"
            >
              Reject Customer
            </button>
          </div>
        )}

        {actionError && (
          <div className="mt-4 rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-600">
            Error: {actionError}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
          {customer.isDeleted ? (
            <button
              onClick={handleRestore}
              disabled={working}
              className="text-sm font-medium px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
            >
              Restore customer
            </button>
          ) : (
            <>
              <button
                onClick={handleBlockToggle}
                disabled={working}
                className="text-sm font-medium px-4 py-2 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition"
              >
                {customer.isBlocked ? "Unblock" : "Block"}
              </button>
              <button
                onClick={handleDelete}
                disabled={working}
                className="text-sm font-medium px-4 py-2 rounded-md border border-red-300 text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DocumentCard title="Passport" doc={customer.passportDetail} />
        <DocumentCard
          title="Driver License"
          doc={customer.driverLicenseDetail}
        />
        <DocumentCard
          title="National ID"
          doc={customer.nationalIdentityDetail}
        />
      </div>

      {/* Face Verification & Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Face Verification */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 flex flex-col justify-between">
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <HiOutlineFaceSmile size={18} className="text-blue-600" />
              <span>Face verification</span>
            </h2>
            {customer.faceVerifyDetail ? (
              <div className="flex items-center gap-4">
                {customer.faceVerifyDetail.selfieUrl && (
                  <img
                    src={customer.faceVerifyDetail.selfieUrl}
                    alt="Selfie"
                    className="w-20 h-20 rounded-xl object-cover border border-slate-200 shadow-xs"
                  />
                )}
                <dl className="space-y-2 text-sm flex-1">
                  <Row
                    label="Status"
                    value={customer.faceVerifyDetail.status}
                  />
                  <Row
                    label="Match score"
                    value={`${(customer.faceVerifyDetail.matchScore * 100).toFixed(0)}%`}
                  />
                </dl>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Not submitted.</p>
            )}
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <HiOutlineUser size={18} className="text-blue-600" />
            <span>Account details</span>
          </h2>
          <dl className="space-y-2.5 text-sm">
            <Row label="Type" value={customer.userType} />
            <Row label="Platform" value={customer.platform} />
            <Row label="Gender" value={customer.gender ?? "N/A"} />
            <Row label="Approved" value={customer.isApproved ? "Yes" : "No"} />
            <Row label="Bonus balance" value={`${customer.bonusBalance} AED`} />
          </dl>
        </div>
      </div>

      {/* Referral Details if available */}
      {customer.referralDetail && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
            <HiOutlineShare size={18} className="text-blue-600" />
            <span>Referral program</span>
          </h2>
          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">Code</span>
              <span className="font-bold text-slate-800 font-mono">
                {customer.referralDetail.code}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">
                Referred by
              </span>
              <span className="font-bold text-slate-800">
                {customer.referralDetail.referredByCode ?? "N/A"}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">
                Referred count
              </span>
              <span className="font-bold text-slate-800">
                {customer.referralDetail.referredCount}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs text-slate-400 block mb-1">
                Bonus earned
              </span>
              <span className="font-bold text-emerald-600">
                {customer.referralDetail.bonusEarned} AED
              </span>
            </div>
          </dl>
        </div>
      )}
    </div>
  );
}

function DocumentCard({
  title,
  doc,
}: {
  title: string;
  doc: DocumentDetail | null;
}) {
  if (!doc) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
          {title}
        </h3>
        <p className="text-sm text-slate-400 font-medium">Not uploaded.</p>
      </div>
    );
  }

  const statusStyle =
    doc.status === "Verified"
      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
      : doc.status === "Rejected"
        ? "bg-red-50 text-red-700 ring-1 ring-red-200"
        : "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </h3>
        <span
          className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusStyle}`}
        >
          {doc.status}
        </span>
      </div>
      {doc.frontUrl && (
        <div className="h-32 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-100">
          <img
            src={doc.frontUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      {doc.ocr && (
        <p className="text-xs font-medium text-slate-600">
          <span className="font-mono">{doc.ocr.number}</span> · exp.{" "}
          {new Date(doc.ocr.expiryDate).toLocaleDateString()}
        </p>
      )}
      {doc.rejectionReason && (
        <p className="text-xs font-medium text-red-600 bg-red-50 p-2 rounded-lg">
          Reason: {doc.rejectionReason}
        </p>
      )}
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
