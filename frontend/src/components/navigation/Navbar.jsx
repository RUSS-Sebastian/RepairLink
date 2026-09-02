import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, CarFront, ArrowRight } from "lucide-react";

import Button from "../common/Button";
import { ROUTES } from "../../constants/routes";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobile = () => setMobileOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        {/* Logo */}
        <Link
          to={ROUTES.LANDING}
          onClick={closeMobile}
          className="flex items-center gap-3"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/20">
            <img
              src="images/repairlink-logo.png"
              alt="RepairLink"
              className="h-7 w-7 object-contain"
            />
          </div>

          <div>
            <span className="block text-lg font-bold tracking-tight text-slate-900">
              Repair<span className="text-blue-600">Link</span>
            </span>
            <span className="hidden text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:block">
              Smarter vehicle care
            </span>
          </div>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center gap-7 lg:flex">
          <a
            href="#home"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Home
          </a>

          <a
            href="#how-it-works"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            How It Works
          </a>

          <a
            href="#services"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Services
          </a>

          <a
            href="#why-repairlink"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Why RepairLink
          </a>

          <a
            href="#contact"
            className="text-sm font-medium text-slate-600 transition hover:text-blue-600"
          >
            Contact
          </a>
        </nav>

        {/* Desktop buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button to={ROUTES.LOGIN} variant="secondary" className="px-4 py-2.5">
            Login
          </Button>

          <Button to={ROUTES.SIGNUP} className="px-4 py-2.5">
            Sign Up
            <ArrowRight className="ml-2" size={16} />
          </Button>
        </div>

        {/* Mobile button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="rounded-lg p-2 text-slate-700 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {/* Mobile navigation */}
      {mobileOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 md:hidden">
          <nav className="flex flex-col gap-4">
            <a href="#home" onClick={closeMobile} className="font-medium">
              Home
            </a>

            <a
              href="#how-it-works"
              onClick={closeMobile}
              className="font-medium"
            >
              How It Works
            </a>

            <a href="#services" onClick={closeMobile} className="font-medium">
              Services
            </a>

            <a
              href="#why-repairlink"
              onClick={closeMobile}
              className="font-medium"
            >
              Why RepairLink
            </a>

            <a href="#contact" onClick={closeMobile} className="font-medium">
              Contact
            </a>

            <div className="flex gap-3 pt-3">
              <Button
                to={ROUTES.LOGIN}
                variant="secondary"
                className="flex-1"
                onClick={closeMobile}
              >
                Login
              </Button>

              <Button
                to={ROUTES.SIGNUP}
                className="flex-1"
                onClick={closeMobile}
              >
                Sign Up
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;
