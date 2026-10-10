import { Outlet, useNavigate, Link, NavLink } from "react-router-dom";
import { logout } from "../api/auth";
import { useState } from "react";
import {
  HiOutlineChartPie,
  HiOutlineTruck,
  HiOutlineDocumentText,
  HiOutlineUsers,
  HiOutlineCreditCard,
  HiOutlineExclamationTriangle,
  HiOutlineShieldExclamation,
  HiOutlineCalendarDays,
  HiOutlineChatBubbleBottomCenterText,
  HiOutlineChartBarSquare,
  HiOutlineDocumentDuplicate,
  HiOutlineTag,
  HiOutlineBuildingStorefront,
  HiOutlineCog6Tooth,
  HiOutlineMap,
  HiOutlineArrowRightOnRectangle,
  HiOutlineBars3,
  HiOutlineXMark,
} from "react-icons/hi2";

const NAV_LINKS = [
  { to: "/dashboard", label: "Dashboard", icon: HiOutlineChartPie },
  { to: "/cars", label: "Cars", icon: HiOutlineTruck },
  { to: "/rentals", label: "Rentals", icon: HiOutlineDocumentText },
  { to: "/customers", label: "Customers", icon: HiOutlineUsers },
  { to: "/debts", label: "Debts", icon: HiOutlineCreditCard },
  { to: "/fines", label: "Fines", icon: HiOutlineExclamationTriangle },
  { to: "/accidents", label: "Accidents", icon: HiOutlineShieldExclamation },
  { to: "/reservations", label: "Reservations", icon: HiOutlineCalendarDays },
  {
    to: "/support",
    label: "Support",
    icon: HiOutlineChatBubbleBottomCenterText,
  },
  { to: "/analytics", label: "Analytics", icon: HiOutlineChartBarSquare },
  { to: "/tariffs", label: "Tariffs", icon: HiOutlineDocumentDuplicate },
  { to: "/discounts", label: "Discounts", icon: HiOutlineTag },
  { to: "/brands", label: "Brands", icon: HiOutlineBuildingStorefront },
  { to: "/settings", label: "Settings", icon: HiOutlineCog6Tooth },
  { to: "/geozones", label: "Geo Zones", icon: HiOutlineMap },
];

export default function AdminLayout() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {open && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 transition-opacity md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 flex flex-col transform transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-slate-800 ${
          open ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        <div className="p-6 flex items-center justify-between border-b border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg shadow-blue-600/30">
              D
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white block">
                DRIGO
              </span>
              <span className="text-xs text-slate-400 font-medium">
                Admin Control Panel
              </span>
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="md:hidden text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <HiOutlineXMark size={20} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {NAV_LINKS.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/25"
                      : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      className={isActive ? "text-white" : "text-slate-400"}
                    />
                    <span>{link.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-600 text-red-400 hover:text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all duration-200 border border-red-500/20 hover:border-transparent"
          >
            <HiOutlineArrowRightOnRectangle size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition"
              aria-label="Open menu"
            >
              <HiOutlineBars3 size={24} />
            </button>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Management Portal
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-semibold flex items-center justify-center text-xs">
                AD
              </div>
              <div className="hidden sm:block text-left">
                <span className="text-xs font-bold text-slate-800 block">
                  Administrator
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Super Admin
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
