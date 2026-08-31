import { Navigate } from "react-router-dom";

import { ROUTES } from "../../constants/routes";
import { getStoredAuthSession } from "../../utils/auth";

function CustomerDashboardPage() {
  const session = getStoredAuthSession();

  if (!session.token || session.user?.role !== "CUSTOMER") {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-xl font-medium text-slate-700">
        This page is no longer used by the app layout.
      </p>
    </div>
  );
}

export default CustomerDashboardPage;
