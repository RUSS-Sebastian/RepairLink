import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Menu,
  X,
  Wrench,
} from "lucide-react";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-8">

        {/* Logo */}
        <Link
          to="/landing"
          onClick={closeMenu}
          className="flex items-center gap-2"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900 text-white">
            <Wrench size={20} strokeWidth={2} />
          </span>

          <span className="text-xl font-bold tracking-tight text-slate-900">
            RepairLink
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-7 lg:flex">

          <Link
            to="/landing"
            className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
          >
            Home
          </Link>

          <a
            href="/landing#how-it-works"
            className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
          >
            How It Works
          </a>

          <a
            href="/landing#services"
            className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
          >
            Services
          </a>

          <a
            href="/landing#why-repairlink"
            className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
          >
            Why RepairLink
          </a>

          <a
            href="/landing#contact"
            className="text-sm font-medium text-slate-700 transition hover:text-slate-950"
          >
            Contact
          </a>

          <Link
            to="/login"
            className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            Login
          </Link>

          <Link
            to="/signup"
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Sign Up
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </nav>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="border-t border-slate-200 bg-white lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col px-6 py-4">

            <Link
              to="/landing"
              onClick={closeMenu}
              className="border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
            >
              Home
            </Link>

            <a
              href="/landing#how-it-works"
              onClick={closeMenu}
              className="border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
            >
              How It Works
            </a>

            <a
              href="/landing#services"
              onClick={closeMenu}
              className="border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
            >
              Services
            </a>

            <a
              href="/landing#why-repairlink"
              onClick={closeMenu}
              className="border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
            >
              Why RepairLink
            </a>

            <a
              href="/landing#contact"
              onClick={closeMenu}
              className="border-b border-slate-100 py-3 text-sm font-medium text-slate-700"
            >
              Contact
            </a>

            <Link
              to="/login"
              onClick={closeMenu}
              className="py-3 text-sm font-semibold text-slate-700"
            >
              Login
            </Link>

            <Link
              to="/signup"
              onClick={closeMenu}
              className="mt-2 rounded-lg bg-slate-900 px-5 py-3 text-center text-sm font-semibold text-white"
            >
              Sign Up
            </Link>

          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;