import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/customer/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";

import MyVehiclesPage from "../pages/customer/MyVehiclesPage";
import VehicleDetailsPage from "../pages/customer/VehicleDetailsPage";

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

function ProtectedAdminRoute({ children }) {
  const { token, user } = getStoredAuthSession();

  if (!token || user?.role !== "ADMIN") {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

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
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <ProtectedAdminRoute>
            <AdminDashboardPage />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_PARTS}
        element={
          <ProtectedAdminRoute>
            <PagePlaceholder title="Parts" />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_LABOR_RATES}
        element={
          <ProtectedAdminRoute>
            <PagePlaceholder title="Labor Rates" />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_ADDITIONAL_SERVICES}
        element={
          <ProtectedAdminRoute>
            <PagePlaceholder title="Additional Services" />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_SCHEDULING}
        element={
          <ProtectedAdminRoute>
            <PagePlaceholder title="Scheduling" />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_LOYALTY}
        element={
          <ProtectedAdminRoute>
            <PagePlaceholder title="Loyalty" />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_NOTIFICATIONS}
        element={
          <ProtectedAdminRoute>
            <PagePlaceholder title="Notifications" />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_AUDIT_LOG}
        element={
          <ProtectedAdminRoute>
            <PagePlaceholder title="Audit Log" />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_PROFILE}
        element={
          <ProtectedAdminRoute>
            <PagePlaceholder title="Admin Profile" />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.CUSTOMER_DASHBOARD}
        element={<Navigate to={ROUTES.DASHBOARD} replace />}
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
        element={
          <Navigate
            to={
              getStoredAuthSession().token
                ? getStoredAuthSession().user?.role === "ADMIN"
                  ? ROUTES.ADMIN_DASHBOARD
                  : ROUTES.DASHBOARD
                : ROUTES.LANDING
            }
            replace
          />
        }
      />

      {/* Unknown routes */}
      <Route
        path="*"
        element={
          <Navigate
            to={
              getStoredAuthSession().user?.role === "ADMIN"
                ? ROUTES.ADMIN_DASHBOARD
                : ROUTES.DASHBOARD
            }
            replace
          />
        }
      />
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

function AdminDashboardPage() {
  const session = getStoredAuthSession();
  const username = session.user?.fullName || "Admin";

  return (
    <div className="flex h-full flex-col justify-center">
      <p className="text-4xl font-bold tracking-tight text-slate-900">
        Hello, {username}
      </p>
      <p className="mt-4 text-xl text-slate-600">
        Welcome to the admin console dashboard.
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
