import { Outlet, useNavigate, Link } from "react-router-dom";
import { logout } from "../api/auth";

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 text-xl font-bold tracking-wider text-blue-400">
          DRIGO Admin
        </div>

        <nav className="flex-1 px-4 space-y-1">
          <Link
            to="/dashboard"
            className="block px-3 py-2 rounded-md hover:bg-slate-800 text-sm font-medium transition"
          >
            Dashboard
          </Link>
          <Link
            to="/cars"
            className="block px-3 py-2 rounded-md hover:bg-slate-800 text-sm font-medium transition"
          >
            Cars
          </Link>
          <Link
            to="/rentals"
            className="block px-3 py-2 rounded-md hover:bg-slate-800 text-sm font-medium transition"
          >
            Rentals
          </Link>
          <Link
            to="/customers"
            className="block px-3 py-2 rounded-md hover:bg-slate-800 text-sm font-medium transition"
          >
            Customers
          </Link>
          <Link
            to="/debts"
            className="block px-3 py-2 rounded-md hover:bg-slate-800 text-sm font-medium transition"
          >
            Debts
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white text-sm font-medium py-2 rounded-md transition"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden bg-slate-100">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">Admin Panel</h2>
          <span className="text-sm font-medium text-slate-600">Admin</span>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
