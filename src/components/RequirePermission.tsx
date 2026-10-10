import { useOutletContext } from "react-router-dom";

type Ctx = { permissions: string[] | null; isSuper: boolean };

export default function RequirePermission({
  code,
  children,
}: {
  code: string;
  children: React.ReactNode;
}) {
  const { permissions, isSuper } = useOutletContext<Ctx>();

  if (permissions === null) return <p className="text-slate-500">Loading...</p>;
  if (isSuper || permissions.includes(code)) return <>{children}</>;

  return (
    <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-6 text-center">
      <p className="font-semibold text-amber-800">Access denied</p>
      <p className="text-sm text-amber-700 mt-1">
        You don't have the "{code}" permission for this page.
      </p>
    </div>
  );
}
