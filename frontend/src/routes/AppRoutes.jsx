import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/customer/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";
import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";
import ProfilePage from "../pages/customer/ProfilePage";
import AppLayout from "../layouts/AppLayout";
import MainLayout from "../layouts/MainLayout";

import { ROUTES } from "../constants/routes";
import { getStoredAuthSession } from "../utils/auth";

function ProtectedCustomerRoute({ children }) {
  const { token, user } = getStoredAuthSession();

  if (!token || user?.role !== "CUSTOMER") {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
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
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedCustomerRoute>
            <DashboardPage />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.MY_VEHICLES}
        element={
          <ProtectedCustomerRoute>
            <PagePlaceholder title="My Vehicles" />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.SERVICE_REQUEST}
        element={
          <ProtectedCustomerRoute>
            <PagePlaceholder title="Service Request" />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.APPOINTMENTS}
        element={
          <ProtectedCustomerRoute>
            <PagePlaceholder title="Appointments" />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.ACTIVE_SERVICE}
        element={
          <ProtectedCustomerRoute>
            <PagePlaceholder title="Active Service" />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.LOYALTY}
        element={
          <ProtectedCustomerRoute>
            <PagePlaceholder title="Loyalty" />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.SERVICE_HISTORY}
        element={
          <ProtectedCustomerRoute>
            <PagePlaceholder title="Service History" />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.REVIEWS}
        element={
          <ProtectedCustomerRoute>
            <PagePlaceholder title="Reviews" />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.NOTIFICATIONS}
        element={
          <ProtectedCustomerRoute>
            <PagePlaceholder title="Notifications" />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.PROFILE}
        element={
          <ProtectedCustomerRoute>
            <ProfilePage />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.CUSTOMER_DASHBOARD}
        element={<Navigate to={ROUTES.DASHBOARD} replace />}
      />

      <Route
        path="/"
        element={
          <Navigate
            to={
              getStoredAuthSession().token &&
              getStoredAuthSession().user?.role === "CUSTOMER"
                ? ROUTES.DASHBOARD
                : ROUTES.LANDING
            }
            replace
          />
        }
      />

      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}

function DashboardPage() {
  const session = getStoredAuthSession();
  const username = session.user?.fullName || "Customer";

  return (
    <div className="flex h-full flex-col justify-center">
      <p className="text-4xl font-bold tracking-tight text-slate-900">
        Hello, {username}
      </p>
      <p className="mt-4 text-xl text-slate-600">
        Welcome to your RepairLink dashboard.
      </p>
    </div>
  );
}

function PagePlaceholder({ title }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-xl font-medium text-slate-700">
        You are at the {title} page.
      </p>
    </div>
  );
}

export default AppRoutes;
