import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getCustomerById, verifyCustomer } from "../api/customers";
import type { CustomerDetail, DocumentDetail } from "../types/customer";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [verifying, setVerifying] = useState(false);

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

  if (loading) return <p className="text-slate-500">Loading...</p>;

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!customer) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        to="/customers"
        className="text-sm text-blue-600 hover:underline mb-4 inline-block"
      >
        ← Back to customers
      </Link>
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {customer.profilePhotoUrl ? (
              <img
                src={customer.profilePhotoUrl}
                alt={customer.fullName}
                className="w-16 h-16 rounded-full object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-xl font-semibold">
                {customer.fullName.charAt(0)}
              </div>
            )}
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                {customer.fullName}
              </h1>
              <p className="text-sm text-slate-500">
                {customer.phoneNumber} · {customer.email ?? "No email"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {customer.isBlocked && (
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-red-50 text-red-600 ring-1 ring-red-200">
                Blocked
              </span>
            )}
            {customer.isVerified ? (
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-green-50 text-green-700 ring-1 ring-green-200">
                Verified
              </span>
            ) : (
              <span className="px-3 py-1.5 rounded-full text-sm font-semibold bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                Pending
              </span>
            )}
          </div>
        </div>
        {!customer.isVerified && (
          <div className="flex gap-2 mt-4 pt-4 border-t border-slate-100">
            <button
              onClick={() => handleVerify(true)}
              disabled={verifying}
              className="text-sm font-medium px-4 py-2 rounded-md bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 transition"
            >
              {verifying ? "Processing..." : "Approve"}
            </button>
            <button
              onClick={() => handleVerify(false)}
              disabled={verifying}
              className="text-sm font-medium px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition"
            >
              Reject
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
          Face verification
        </h2>
        {customer.faceVerifyDetail ? (
          <div className="flex items-center gap-4">
            {customer.faceVerifyDetail.selfieUrl && (
              <img
                src={customer.faceVerifyDetail.selfieUrl}
                alt="Selfie"
                className="w-20 h-20 rounded-lg object-cover"
              />
            )}
            <dl className="space-y-1 text-sm w-64">
              <Row label="Status" value={customer.faceVerifyDetail.status} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Account
          </h2>
          <dl className="space-y-2 text-sm">
            <Row label="Type" value={customer.userType} />
            <Row label="Platform" value={customer.platform} />
            <Row label="Gender" value={customer.gender ?? "N/A"} />
            <Row label="Approved" value={customer.isApproved ? "Yes" : "No"} />
            <Row label="Bonus balance" value={`${customer.bonusBalance} AED`} />
          </dl>
        </div>
        {customer.referralDetail && (
          <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
              Referral
            </h2>
            <dl className="space-y-2 text-sm">
              <Row label="Code" value={customer.referralDetail.code} />
              <Row
                label="Referred by"
                value={customer.referralDetail.referredByCode ?? "N/A"}
              />
              <Row
                label="Referred count"
                value={customer.referralDetail.referredCount}
              />
              <Row
                label="Bonus earned"
                value={`${customer.referralDetail.bonusEarned} AED`}
              />
            </dl>
          </div>
        )}
      </div>
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
      <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
        <h3 className="text-sm font-semibold text-slate-700 mb-2">{title}</h3>
        <p className="text-sm text-slate-400">Not uploaded.</p>
      </div>
    );
  }

  const statusStyle =
    doc.status === "Verified"
      ? "bg-green-50 text-green-700 ring-1 ring-green-200"
      : doc.status === "Rejected"
        ? "bg-red-50 text-red-700 ring-1 ring-red-200"
        : "bg-amber-50 text-amber-700 ring-1 ring-amber-200";

  return (
    <div className="bg-white rounded-2xl shadow-sm ring-1 ring-slate-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusStyle}`}
        >
          {doc.status}
        </span>
      </div>
      {doc.frontUrl && (
        <img
          src={doc.frontUrl}
          alt={title}
          className="w-full h-24 object-cover rounded-md mb-2"
        />
      )}
      {doc.ocr && (
        <p className="text-xs text-slate-500">
          {doc.ocr.number} · exp.{" "}
          {new Date(doc.ocr.expiryDate).toLocaleDateString()}
        </p>
      )}
      {doc.rejectionReason && (
        <p className="text-xs text-red-600 mt-1">
          Reason: {doc.rejectionReason}
        </p>
      )}
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
