import { Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "../pages/customer/LandingPage.jsx";
import LoginPage from "../pages/auth/LoginPage.jsx";
import SignupPage from "../pages/auth/SignupPage.jsx";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/landing" replace />} />

      <Route path="/landing" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />

      <Route path="/signup" element={<SignupPage />} />

      <Route path="*" element={<Navigate to="/landing" replace />} />
    </Routes>
  );
}

export default AppRoutes;