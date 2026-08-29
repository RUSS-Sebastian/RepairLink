import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/customer/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";

import MainLayout from "../layouts/MainLayout";

import { ROUTES } from "../constants/routes";

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

      <Route
        path={ROUTES.LOGIN}
        element={<LoginPage />}
      />

      <Route
        path={ROUTES.SIGNUP}
        element={<SignupPage />}
      />

      <Route
        path="/"
        element={<Navigate to={ROUTES.LANDING} replace />}
      />

      <Route
        path="*"
        element={<Navigate to={ROUTES.LANDING} replace />}
      />
    </Routes>
  );
}

export default AppRoutes;