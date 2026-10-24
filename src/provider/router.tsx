import { createBrowserRouter } from "react-router-dom";
import RequirePermission from "../components/RequirePermission";
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
import AnalyticsPage from "../pages/AnalyticsPage";
import TariffsPage from "../pages/TariffsPage";
import DiscountsPage from "../pages/DiscountsPage";
import SettingsPage from "../pages/SettingsPage";
import GeoZonesPage from "../pages/GeoZonesPage";
import BrandsPage from "../pages/BrandsPage";
import AccidentsPage from "../pages/AccidentsPage";
import BrandDetailPage from "../pages/BrandDetailPage";
import DeliveriesPage from "../pages/DeliveriesPage";
import PromoCodesPage from "../pages/PromoCodesPage";
import PromotionsPage from "../pages/PromotionsPage";
import StoriesPage from "../pages/StoriesPage";
import AnalyticsInsightsPage from "../pages/AnalyticsInsightsPage";
import AdminsPage from "../pages/AdminsPage";
import ReportsPage from "../pages/ReportsPage";
import SubscriptionsPage from "../pages/SubscriptionsPage";

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
              <RequirePermission code="dashboard.view">
                <DashboardPage />
              </RequirePermission>
            ),
          },
          {
            path: "/cars",
            element: (
              <RequirePermission code="cars.view">
                <CarsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/cars/tracking",
            element: (
              <RequirePermission code="cars.view">
                <CarsTrackingPage />
              </RequirePermission>
            ),
          },
          {
            path: "/cars/problematic",
            element: (
              <RequirePermission code="cars.view">
                <ProblematicCarsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/rentals",
            element: (
              <RequirePermission code="rentals.view">
                <RentalsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/customers",
            element: (
              <RequirePermission code="customers.view">
                <CustomersPage />
              </RequirePermission>
            ),
          },
          {
            path: "/debts",
            element: (
              <RequirePermission code="debts.view">
                <DebtorsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/fines",
            element: (
              <RequirePermission code="fines.view">
                <FinesPage />
              </RequirePermission>
            ),
          },
          {
            path: "/reservations",
            element: (
              <RequirePermission code="reservations.view">
                <ReservationsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/support",
            element: (
              <RequirePermission code="support.view">
                <SupportPage />
              </RequirePermission>
            ),
          },
          {
            path: "/analytics/insights",
            element: (
              <RequirePermission code="analytics.view">
                <AnalyticsInsightsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/analytics",
            element: (
              <RequirePermission code="analytics.view">
                <AnalyticsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/tariffs",
            element: (
              <RequirePermission code="tariffs.view">
                <TariffsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/discounts",
            element: (
              <RequirePermission code="promotions.view">
                <DiscountsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/settings",
            element: (
              <RequirePermission code="settings.view">
                <SettingsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/geozones",
            element: (
              <RequirePermission code="fleet.view">
                <GeoZonesPage />
              </RequirePermission>
            ),
          },
          {
            path: "/brands",
            element: (
              <RequirePermission code="cars.view">
                <BrandsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/brands/:id",
            element: (
              <RequirePermission code="cars.view">
                <BrandDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: "/accidents",
            element: (
              <RequirePermission code="fines.view">
                <AccidentsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/deliveries",
            element: (
              <RequirePermission code="delivery.view">
                <DeliveriesPage />
              </RequirePermission>
            ),
          },
          {
            path: "/promo-codes",
            element: (
              <RequirePermission code="promotions.view">
                <PromoCodesPage />
              </RequirePermission>
            ),
          },
          {
            path: "/promotions",
            element: (
              <RequirePermission code="promotions.view">
                <PromotionsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/stories",
            element: (
              <RequirePermission code="promotions.view">
                <StoriesPage />
              </RequirePermission>
            ),
          },
          {
            path: "/admins",
            element: (
              <RequirePermission code="admins.view">
                <AdminsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/reports",
            element: (
              <RequirePermission code="analytics.view">
                <ReportsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/subscriptions",
            element: (
              <RequirePermission code="tariffs.view">
                <SubscriptionsPage />
              </RequirePermission>
            ),
          },
          {
            path: "/cars/:id",
            element: (
              <RequirePermission code="cars.view">
                <CarDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: "/rentals/:id",
            element: (
              <RequirePermission code="rentals.view">
                <RentalDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: "/customers/:id",
            element: (
              <RequirePermission code="customers.view">
                <CustomerDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: "/debts/:id",
            element: (
              <RequirePermission code="debts.view">
                <DebtorDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: "/fines/:id",
            element: (
              <RequirePermission code="fines.view">
                <FineDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: "/reservations/:id",
            element: (
              <RequirePermission code="reservations.view">
                <ReservationDetailPage />
              </RequirePermission>
            ),
          },
          {
            path: "/support/:id",
            element: (
              <RequirePermission code="support.view">
                <SupportDetailPage />
              </RequirePermission>
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
