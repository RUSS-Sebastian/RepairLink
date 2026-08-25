import { Link } from "react-router-dom";
import { CarFront } from "lucide-react";
import { ROUTES } from "../constants/routes";

function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">

        {/* Left panel */}
        <div className="hidden w-[45%] flex-col justify-between bg-slate-950 p-10 text-white lg:flex">

          <Link to={ROUTES.LANDING} className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
              <CarFront size={23} />
            </div>

            <span className="text-xl font-bold">
              Repair<span className="text-blue-400">Link</span>
            </span>
          </Link>

          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.2em] text-blue-400">
              Digital vehicle care
            </p>

            <h1 className="max-w-lg text-4xl font-bold leading-tight xl:text-5xl">
              A simpler way to manage every repair.
            </h1>

            <p className="mt-6 max-w-lg leading-7 text-slate-400">
              Keep your vehicle service requests, estimates, repair updates
              and service history connected in one place.
            </p>
          </div>

          <p className="text-sm text-slate-500">
            © 2026 RepairLink. Prototype interface.
          </p>
        </div>

        {/* Form */}
        <div className="flex flex-1 items-center justify-center px-5 py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;