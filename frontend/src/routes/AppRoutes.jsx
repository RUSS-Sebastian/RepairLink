import { Navigate, Route, Routes } from "react-router-dom";

import LandingPage from "../pages/customer/LandingPage";
import LoginPage from "../pages/auth/LoginPage";
import SignupPage from "../pages/auth/SignupPage";

import MyVehiclesPage from "../pages/customer/MyVehiclesPage";
import VehicleDetailsPage from "../pages/customer/VehicleDetailsPage";

import CustomerDashboardPage from "../pages/customer/CustomerDashboardPage";
import ServiceRequestPage from "../pages/customer/ServiceRequestPage";
import ActiveServicePage from "../pages/customer/ActiveServicePage";
import AppointmentsPage from "../pages/customer/AppointmentsPage";
import CustomerLoyaltyPage from "../pages/customer/CustomerLoyaltyPage";
import ProfilePage from "../pages/customer/ProfilePage";
import CustomerNotificationsPage from "../pages/customer/NotificationsPage";
import PartsPage from "../pages/admin/PartsPage";
import SchedulePage from "../pages/admin/SchedulePage";
import AdditionalServicesPage from "../pages/admin/AdditionalServicesPage";
import AdminProfilePage from "../pages/admin/AdminProfilePage";
import LoyaltyPage from "../pages/admin/LoyaltyPage";
import AdminDashboardPage from "../pages/admin/AdminDashboardPage";
import StaffAccountsPage from "../pages/admin/StaffAccountsPage";
import StaffDashboardPage from "../pages/staff/StaffDashboardPage";
import StaffPlaceholderPage from "../pages/staff/StaffPlaceholderPage";
import StaffNotificationsPage from "../pages/staff/StaffNotificationsPage";
import StaffServiceRequestsPage from "../pages/staff/StaffServiceRequestsPage";
import StaffServiceRequestDetailPage from "../pages/staff/StaffServiceRequestDetailPage";
import StaffAppointmentsPage from "../pages/staff/StaffAppointmentsPage";
import AppLayout from "../layouts/AppLayout";
import MainLayout from "../layouts/MainLayout";

import {
  Activity,
  Bell,
  CalendarDays,
  Car,
  FileText,
  Gauge,
  Truck,
  User,
  UserCheck,
  Users,
  Wrench,
} from "lucide-react";

import { ROUTES } from "../constants/routes";
import { getStoredAuthSession } from "../utils/auth";

function isStaffRole(role) {
  return role === "STAFF" || role === "CENTER_STAFF";
}

function getDefaultRouteForSession() {
  const session = getStoredAuthSession();
  if (!session.token) {
    return ROUTES.LANDING;
  }
  if (session.user?.role === "ADMIN") {
    return ROUTES.ADMIN_DASHBOARD;
  }
  if (isStaffRole(session.user?.role)) {
    return ROUTES.STAFF_DASHBOARD;
  }
  return ROUTES.DASHBOARD;
}

function ProtectedCustomerRoute({ children }) {
  const { token, user } = getStoredAuthSession();

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user?.role === "ADMIN") {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  if (isStaffRole(user?.role)) {
    return <Navigate to={ROUTES.STAFF_DASHBOARD} replace />;
  }

  if (user?.role !== "CUSTOMER") {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function ProtectedAdminRoute({ children }) {
  const { token, user } = getStoredAuthSession();

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user?.role === "CUSTOMER") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  if (isStaffRole(user?.role)) {
    return <Navigate to={ROUTES.STAFF_DASHBOARD} replace />;
  }

  if (user?.role !== "ADMIN") {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <AppLayout>{children}</AppLayout>;
}

function ProtectedStaffRoute({ children }) {
  const { token, user } = getStoredAuthSession();

  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  if (user?.role === "ADMIN") {
    return <Navigate to={ROUTES.ADMIN_DASHBOARD} replace />;
  }

  if (user?.role === "CUSTOMER") {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  if (!isStaffRole(user?.role)) {
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
            <MyVehiclesPage />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.SERVICE_REQUEST}
        element={
          <ProtectedCustomerRoute>
            <ServiceRequestPage />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.APPOINTMENTS}
        element={
          <ProtectedCustomerRoute>
            <AppointmentsPage />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.ACTIVE_SERVICE}
        element={
          <ProtectedCustomerRoute>
            <ActiveServicePage />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path={ROUTES.LOYALTY}
        element={
          <ProtectedCustomerRoute>
            <CustomerLoyaltyPage />
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
            <CustomerNotificationsPage />
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
            <PartsPage />
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
            <AdditionalServicesPage />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_SCHEDULING}
        element={
          <ProtectedAdminRoute>
            <SchedulePage />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_SCHEDULING_NEW}
        element={
          <ProtectedAdminRoute>
            <SchedulePage mode="create" />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_SCHEDULING_DETAIL}
        element={
          <ProtectedAdminRoute>
            <SchedulePage mode="detail" />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_LOYALTY}
        element={
          <ProtectedAdminRoute>
            <LoyaltyPage />
          </ProtectedAdminRoute>
        }
      />

      <Route
        path={ROUTES.ADMIN_STAFF}
        element={
          <ProtectedAdminRoute>
            <StaffAccountsPage />
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
        path={ROUTES.ADMIN_PROFILE}
        element={
          <ProtectedAdminRoute>
            <AdminProfilePage />
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
        element={
          <ProtectedCustomerRoute>
            <MyVehiclesPage />
          </ProtectedCustomerRoute>
        }
      />

      <Route
        path="/customer/vehicles/:id"
        element={
          <ProtectedCustomerRoute>
            <VehicleDetailsPage />
          </ProtectedCustomerRoute>
        }
      />

      {/* Staff Routes */}
      <Route
        path={ROUTES.STAFF_DASHBOARD}
        element={
          <ProtectedStaffRoute>
            <StaffDashboardPage />
          </ProtectedStaffRoute>
        }
      />

      <Route
        path={ROUTES.STAFF_SERVICE_REQUESTS}
        element={
          <ProtectedStaffRoute>
            <StaffServiceRequestsPage />
          </ProtectedStaffRoute>
        }
      />

      <Route
        path={ROUTES.STAFF_SERVICE_REQUEST_DETAIL}
        element={
          <ProtectedStaffRoute>
            <StaffServiceRequestDetailPage />
          </ProtectedStaffRoute>
        }
      />

      <Route
        path={ROUTES.STAFF_APPOINTMENTS}
        element={
          <ProtectedStaffRoute>
            <StaffAppointmentsPage />
          </ProtectedStaffRoute>
        }
      />

      <Route
        path={ROUTES.STAFF_CHECKIN}
        element={
          <ProtectedStaffRoute>
            <StaffPlaceholderPage
              title="Customer Check In"
              description="Process arriving vehicles, log current odometer readings, and verify condition notes."
              icon={UserCheck}
            />
          </ProtectedStaffRoute>
        }
      />

      <Route
        path={ROUTES.STAFF_VEHICLES}
        element={
          <ProtectedStaffRoute>
            <StaffPlaceholderPage
              title="Vehicles Directory"
              description="Search and inspect registered customer vehicles, specifications, and service logs."
              icon={Car}
            />
          </ProtectedStaffRoute>
        }
      />

      <Route
        path={ROUTES.STAFF_ESTIMATES}
        element={
          <ProtectedStaffRoute>
            <StaffPlaceholderPage
              title="Estimates"
              description="Prepare, revise, and dispatch repair cost estimates for customer approval."
              icon={FileText}
            />
          </ProtectedStaffRoute>
        }
      />

      <Route
        path={ROUTES.STAFF_WORK_ORDERS}
        element={
          <ProtectedStaffRoute>
            <StaffPlaceholderPage
              title="Work Orders"
              description="Manage ongoing repair jobs, assign mechanics, and track repair stage progress."
              icon={Wrench}
            />
          </ProtectedStaffRoute>
        }
      />

      <Route
        path={ROUTES.STAFF_ADDITIONAL_WORK}
        element={
          <ProtectedStaffRoute>
            <StaffPlaceholderPage
              title="Additional Work"
              description="Request authorization for unexpected repair requirements discovered during service."
              icon={Activity}
            />
          </ProtectedStaffRoute>
        }
      />

      <Route
        path={ROUTES.STAFF_CUSTOMERS}
        element={
          <ProtectedStaffRoute>
            <StaffPlaceholderPage
              title="Customers"
              description="Access customer contact information, vehicle portfolios, and loyalty accounts."
              icon={Users}
            />
          </ProtectedStaffRoute>
        }
      />

      <Route
        path={ROUTES.STAFF_PICKUP_DELIVERY}
        element={
          <ProtectedStaffRoute>
            <StaffPlaceholderPage
              title="Pickup & Delivery"
              description="Dispatch and track concierge vehicle pickup and drop-off transport operations."
              icon={Truck}
            />
          </ProtectedStaffRoute>
        }
      />

      <Route
        path={ROUTES.STAFF_NOTIFICATIONS}
        element={
          <ProtectedStaffRoute>
            <StaffNotificationsPage />
          </ProtectedStaffRoute>
        }
      />

      <Route
        path={ROUTES.STAFF_PROFILE}
        element={
          <ProtectedStaffRoute>
            <StaffPlaceholderPage
              title="Staff Profile"
              description="Manage your staff profile details, center credentials, and security preferences."
              icon={User}
            />
          </ProtectedStaffRoute>
        }
      />

      {/* Default */}
      <Route
        path="/"
        element={<Navigate to={getDefaultRouteForSession()} replace />}
      />

      {/* Unknown routes */}
      <Route
        path="*"
        element={<Navigate to={getDefaultRouteForSession()} replace />}
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
