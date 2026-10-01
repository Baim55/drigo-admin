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
import CustomerDetailPage from "../pages/CustomerDetailPage";
import DebtorsPage from "../pages/DebtorsPage";
import DebtorDetailPage from "../pages/DebtorDetailPage";
import FineDetailPage from "../pages/FineDetailPage";
import FinesPage from "../pages/FinesPage";
import ReservationsPage from "../pages/ReservationsPage";
import ReservationDetailPage from "../pages/ReservationDetailPage";
import SupportPage from "../pages/SupportPage";
import SupportDetailPage from "../pages/SupportDetailPage";

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
            path: "/debts",
            element: <DebtorsPage />,
          },
          {
            path: "/fines",
            element: <FinesPage />,
          },
          {
            path: "/reservations",
            element: <ReservationsPage />,
          },
          {
            path: "/support",
            element: <SupportPage />,
          },
          {
            path: "/cars/:id",
            element: <CarDetailPage />,
          },
          {
            path: "/rentals/:id",
            element: <RentalDetailPage />,
          },
          {
            path: "/customers/:id",
            element: <CustomerDetailPage />,
          },
          {
            path: "/debts/:id",
            element: <DebtorDetailPage />,
          },
          {
            path: "/fines/:id",
            element: <FineDetailPage />,
          },
          {
            path: "/reservations/:id",
            element: <ReservationDetailPage />,
          },
          {
            path: "/support/:id",
            element: <SupportDetailPage />,
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
