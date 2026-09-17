import { createBrowserRouter } from "react-router-dom";
import LoginPage from "../pages/LoginPage";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/dashboard",
    element: <div>Dashboard</div>,
  },
  {
    path: "*",
    element: <LoginPage />,
  },
]);
