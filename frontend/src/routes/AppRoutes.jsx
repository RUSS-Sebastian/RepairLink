import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/customer/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";

import MyVehiclesPage from "../pages/customer/MyVehiclesPage";
import VehicleDetailsPage from "../pages/customer/VehicleDetailsPage";

import MainLayout from "../layouts/MainLayout";

import { ROUTES } from "../constants/routes";

function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page */}
      <Route
        path={ROUTES.LANDING}
        element={
          <MainLayout>
            <LandingPage />
          </MainLayout>
        }
      />

      {/* Authentication */}
      <Route
        path={ROUTES.LOGIN}
        element={<LoginPage />}
      />

      <Route
        path={ROUTES.SIGNUP}
        element={<SignupPage />}
      />

      {/* Customer Vehicles */}
      <Route
        path="/customer/vehicles"
        element={<MyVehiclesPage />}
      />

      <Route
        path="/customer/vehicles/:id"
        element={<VehicleDetailsPage />}
      />

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to={ROUTES.LANDING} replace />}
      />

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to={ROUTES.LANDING} replace />}
      />
    </Routes>
  );
}

export default AppRoutes;