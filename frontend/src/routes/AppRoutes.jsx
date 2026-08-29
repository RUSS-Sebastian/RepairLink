import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/customer/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";

import MainLayout from "../layouts/MainLayout";

import { ROUTES } from "../constants/routes";
import { getStoredAuthSession } from "../utils/auth";

function ProtectedCustomerRoute() {
  const { token, user } = getStoredAuthSession();

  if (!token || user?.role !== "CUSTOMER") {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <CustomerDashboardPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTES.LANDING}
        element={
          <MainLayout>
            <LandingPage />
          </MainLayout>
        }
      />

      <Route path={ROUTES.LOGIN} element={<LoginPage />} />

      <Route path={ROUTES.SIGNUP} element={<SignupPage />} />

      <Route
        path={ROUTES.CUSTOMER_DASHBOARD}
        element={<ProtectedCustomerRoute />}
      />

      <Route path="/" element={<Navigate to={ROUTES.LANDING} replace />} />

      <Route path="*" element={<Navigate to={ROUTES.LANDING} replace />} />
    </Routes>
  );
}

export default AppRoutes;
