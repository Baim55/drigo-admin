import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../components/AdminLayout";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          {
            path: "/dashboard",
            element: (
              <div className="text-2xl font-bold text-slate-800">
                Dashboard Səhifəsi
              </div>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <LoginPage />,
  },
]);
