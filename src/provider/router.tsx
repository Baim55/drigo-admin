import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../components/AdminLayout";
import DashboardPage from "../pages/DashboardPage";
import CarsPage from "../pages/CarsPage";
import CarDetailPage from "../pages/CarDetailPage";
import CarsTrackingPage from "../pages/CarsTrackingPage";
import ProblematicCarsPage from "../pages/ProblematicCarsPage";
import RentalsPage from "../pages/RentalsPage";
import RentalDetailPage from "../pages/RentalDetailPage";
import CustomersPage from "../pages/CustomersPage";

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
            element: <DashboardPage />,
          },
          {
            path: "/cars",
            element: <CarsPage />,
          },
          {
            path: "/cars/tracking",
            element: <CarsTrackingPage />,
          },
          {
            path: "/cars/problematic",
            element: <ProblematicCarsPage />,
          },
          {
            path: "/rentals",
            element: <RentalsPage />,
          },
          {
            path: "/customers",
            element: <CustomersPage />,
          },
          {
            path: "/cars/:id",
            element: <CarDetailPage />,
          },
          {
            path: "/rentals/:id",
            element: <RentalDetailPage />,
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
