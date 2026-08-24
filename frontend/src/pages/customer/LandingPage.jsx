import {
  ArrowRight,
  CalendarDays,
  Car,
  Check,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  CreditCard,
  Gauge,
  Hammer,
  HeartHandshake,
  Menu,
  Search,
  ShieldCheck,
  Sparkles,
  Truck,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const processSteps = [
  {
    number: "01",
    title: "Request Service",
    description:
      "Tell us what your vehicle needs and submit a digital service request.",
    icon: ClipboardCheck,
  },
  {
    number: "02",
    title: "Schedule",
    description:
      "Choose a convenient appointment time for your vehicle service.",
    icon: CalendarDays,
  },
  {
    number: "03",
    title: "Vehicle Inspection",
    description:
      "Your vehicle is inspected and important findings are recorded digitally.",
    icon: Search,
  },
  {
    number: "04",
    title: "Approve Estimate",
    description:
      "Review the recommended work and estimate before repairs begin.",
    icon: CreditCard,
  },
  {
    number: "05",
    title: "Track Repair",
    description:
      "Follow repair progress and stay informed as your vehicle is serviced.",
    icon: Gauge,
  },
  {
    number: "06",
    title: "Pay & Collect",
    description:
      "Complete payment and arrange convenient pickup or delivery.",
    icon: Truck,
  },
];

const services = [
  {
    title: "General Maintenance",
    description:
      "Routine maintenance to help keep your vehicle dependable.",
    icon: Wrench,
  },
  {
    title: "Diagnostics",
    description:
      "Identify vehicle problems with a clear digital diagnostic process.",
    icon: Search,
  },
  {
    title: "Brake Service",
    description:
      "Professional brake inspection, maintenance and repair.",
    icon: ShieldCheck,
  },
  {
    title: "Engine Service",
    description:
      "Support for engine inspection, maintenance and repair needs.",
    icon: Hammer,
  },
  {
    title: "Electrical Service",
    description:
      "Digital service management for electrical and electronic issues.",
    icon: Zap,
  },
  {
    title: "Tire Service",
    description:
      "Keep your vehicle ready for the road with convenient tire service.",
    icon: Car,
  },
];

const benefits = [
  {
    title: "Transparent Repair Process",
    description:
      "Keep service information, estimates and repair progress organized in one place.",
    icon: ShieldCheck,
  },
  {
    title: "Digital Estimates",
    description:
      "Review service recommendations and estimated costs digitally.",
    icon: ClipboardCheck,
  },
  {
    title: "Real-Time Repair Updates",
    description:
      "Stay informed about important changes throughout the repair process.",
    icon: Clock3,
  },
  {
    title: "Service History",
    description:
      "Keep a convenient digital record of your vehicle service journey.",
    icon: Gauge,
  },
  {
    title: "Secure Payments",
    description:
      "A streamlined digital experience for completing service payments.",
    icon: CreditCard,
  },
  {
    title: "Convenient Pickup & Delivery",
    description:
      "Make the final step easier with convenient vehicle collection options.",
    icon: Truck,
  },
];

function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900">
      {/* ==================== NAVBAR ==================== */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link
            to="/landing"
            className="flex items-center gap-3"
            onClick={closeMobileMenu}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
              <Wrench size={21} strokeWidth={2.4} />
            </div>

            <div>
              <span className="block text-xl font-bold tracking-tight text-slate-950">
                Repair<span className="text-blue-600">Link</span>
              </span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400 sm:block">
                Vehicle Service Platform
              </span>
            </div>
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <a
              href="#home"
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              Home
            </a>

            <a
              href="#how-it-works"
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              How It Works
            </a>

            <a
              href="#services"
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              Services
            </a>

            <a
              href="#why-repairlink"
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              Why RepairLink
            </a>

            <a
              href="#contact"
              className="text-sm font-semibold text-slate-700 transition hover:text-blue-600"
            >
              Contact
            </a>
          </nav>

          <div className="hidden items-center gap-3 sm:flex">
            <Link
              to="/login"
              className="rounded-xl px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100 hover:text-blue-600"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-700 transition hover:bg-slate-50 lg:hidden"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-6 py-5 lg:hidden">
            <nav className="flex flex-col gap-1">
              <a
                href="#home"
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Home
              </a>

              <a
                href="#how-it-works"
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                How It Works
              </a>

              <a
                href="#services"
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Services
              </a>

              <a
                href="#why-repairlink"
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Why RepairLink
              </a>

              <a
                href="#contact"
                onClick={closeMobileMenu}
                className="rounded-lg px-4 py-3 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Contact
              </a>

              <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  onClick={closeMobileMenu}
                  className="rounded-xl bg-blue-600 px-4 py-3 text-center text-sm font-bold text-white"
                >
                  Sign Up
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main>
        {/* ==================== HERO ==================== */}
        <section
          id="home"
          className="relative overflow-hidden bg-slate-950"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.25),transparent_35%)]" />
          <div className="absolute -right-40 top-20 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

          <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-8 lg:py-28">
            <div>
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-300">
                <Sparkles size={16} />
                Digital vehicle service management
              </div>

              <h1 className="max-w-3xl text-5xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-7xl">
                Smarter vehicle service,
                <span className="block text-blue-400">
                  connected through RepairLink.
                </span>
              </h1>

              <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300 sm:text-xl">
                RepairLink helps customers manage vehicle repair and
                maintenance digitally — from service requests and inspections
                to estimates, repair progress, payment and collection.
              </p>

              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/signup"
                  className="group inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 font-bold text-white shadow-xl shadow-blue-900/30 transition hover:bg-blue-500"
                >
                  Get Started
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>

                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-white/5 px-6 py-3.5 font-bold text-white transition hover:bg-white/10"
                >
                  Sign In
                </Link>
              </div>

              <div className="mt-9 flex flex-wrap gap-x-7 gap-y-3 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-400" />
                  Digital service records
                </div>

                <div className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-400" />
                  Clear repair updates
                </div>

                <div className="flex items-center gap-2">
                  <Check size={16} className="text-emerald-400" />
                  Customer-focused workflow
                </div>
              </div>
            </div>

            {/* Hero visual */}
            <div className="relative">
              <div className="absolute -inset-5 rounded-[2rem] bg-blue-500/10 blur-2xl" />

              <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-2xl backdrop-blur">
                <div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
                  <div className="flex items-center justify-between border-b border-white/10 pb-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Vehicle service
                      </p>
                      <h2 className="mt-1 text-lg font-bold text-white">
                        Service Overview
                      </h2>
                    </div>

                    <div className="rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
                      In Progress
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-900 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-100">
                          Current service
                        </p>
                        <p className="mt-1 text-2xl font-bold text-white">
                          Vehicle Inspection
                        </p>
                      </div>

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10">
                        <Car size={30} className="text-white" />
                      </div>
                    </div>

                    <div className="mt-8 h-2 overflow-hidden rounded-full bg-white/15">
                      <div className="h-full w-[68%] rounded-full bg-white" />
                    </div>

                    <div className="mt-3 flex justify-between text-xs text-blue-100">
                      <span>Service progress</span>
                      <span>68%</span>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-slate-500">Vehicle</p>
                      <p className="mt-1 font-semibold text-white">
                        Customer Vehicle
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                      <p className="text-xs text-slate-500">Status</p>
                      <p className="mt-1 font-semibold text-emerald-400">
                        On schedule
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                      <Clock3 size={19} />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-white">
                        Latest update
                      </p>
                      <p className="text-xs text-slate-500">
                        Inspection information updated recently
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== HOW IT WORKS ==================== */}
        <section
          id="how-it-works"
          className="scroll-mt-20 bg-slate-50 py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                How It Works
              </p>

              <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                A simpler way to manage vehicle service
              </h2>

              <p className="mt-5 text-lg leading-8 text-slate-600">
                RepairLink connects the important steps of the customer
                service journey into one organized digital experience.
              </p>
            </div>

            <div className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {processSteps.map((step) => {
                const Icon = step.icon;

                return (
                  <div
                    key={step.number}
                    className="group rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/60"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
                        <Icon size={22} />
                      </div>

                      <span className="text-sm font-bold text-slate-300">
                        {step.number}
                      </span>
                    </div>

                    <h3 className="mt-6 text-xl font-bold text-slate-950">
                      {step.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">
                      {step.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== SERVICES ==================== */}
        <section id="services" className="scroll-mt-20 bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
              <div className="max-w-2xl">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                  Services
                </p>

                <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                  Service support for every stage of vehicle ownership
                </h2>
              </div>

              <p className="max-w-md text-slate-600">
                Explore the types of vehicle service RepairLink is designed to
                help customers manage.
              </p>
            </div>

            <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => {
                const Icon = service.icon;

                return (
                  <div
                    key={service.title}
                    className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-900">
                      <Icon size={22} />
                    </div>

                    <h3 className="mt-6 text-xl font-bold text-slate-950">
                      {service.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-600">
                      {service.description}
                    </p>

                    <div className="mt-5 flex items-center gap-1 text-sm font-bold text-blue-600">
                      Service category
                      <ChevronRight size={16} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ==================== WHY REPAIRLINK ==================== */}
        <section
          id="why-repairlink"
          className="scroll-mt-20 bg-slate-950 py-24"
        >
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-400">
                  Why RepairLink
                </p>

                <h2 className="mt-3 text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  Built around a clearer customer experience.
                </h2>

                <p className="mt-6 text-lg leading-8 text-slate-400">
                  Vehicle repair can involve many conversations, documents and
                  decisions. RepairLink brings the process together so
                  customers can understand what is happening with their
                  vehicle.
                </p>

                <div className="mt-8 flex items-center gap-3 text-sm font-semibold text-blue-300">
                  <HeartHandshake size={19} />
                  Designed for connected vehicle service
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {benefits.map((benefit) => {
                  const Icon = benefit.icon;

                  return (
                    <div
                      key={benefit.title}
                      className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 transition hover:bg-white/[0.07]"
                    >
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                        <Icon size={20} />
                      </div>

                      <h3 className="mt-5 font-bold text-white">
                        {benefit.title}
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-slate-400">
                        {benefit.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ==================== REPAIR TRACKING ==================== */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50 p-6 sm:p-10 lg:p-14">
              <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                    Repair Tracking Preview
                  </p>

                  <h2 className="mt-3 text-4xl font-bold tracking-tight text-slate-950">
                    Know where your vehicle stands.
                  </h2>

                  <p className="mt-5 text-lg leading-8 text-slate-600">
                    Customers can follow a simple visual representation of
                    their vehicle's service journey from request through
                    completion.
                  </p>

                  <Link
                    to="/signup"
                    className="mt-8 inline-flex items-center gap-2 font-bold text-blue-600 hover:text-blue-700"
                  >
                    Start your service journey
                    <ArrowRight size={18} />
                  </Link>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Current service
                      </p>
                      <h3 className="mt-1 text-lg font-bold text-slate-950">
                        Repair Progress
                      </h3>
                    </div>

                    <div className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-600">
                      Demo Preview
                    </div>
                  </div>

                  <div className="mt-7 space-y-0">
                    {[
                      {
                        title: "Service Requested",
                        status: "complete",
                      },
                      {
                        title: "Inspection",
                        status: "complete",
                      },
                      {
                        title: "Estimate",
                        status: "current",
                      },
                      {
                        title: "Repair",
                        status: "upcoming",
                      },
                      {
                        title: "Ready for Pickup",
                        status: "upcoming",
                      },
                    ].map((item, index, items) => (
                      <div
                        key={item.title}
                        className="flex items-start gap-4"
                      >
                        <div className="flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full ${
                              item.status === "complete"
                                ? "bg-emerald-500 text-white"
                                : item.status === "current"
                                  ? "bg-blue-600 text-white ring-4 ring-blue-100"
                                  : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {item.status === "complete" ? (
                              <Check size={18} strokeWidth={3} />
                            ) : item.status === "current" ? (
                              <span className="h-2.5 w-2.5 rounded-full bg-white" />
                            ) : (
                              <span className="h-2 w-2 rounded-full bg-slate-300" />
                            )}
                          </div>

                          {index < items.length - 1 && (
                            <div
                              className={`h-10 w-px ${
                                item.status === "complete"
                                  ? "bg-emerald-200"
                                  : "bg-slate-200"
                              }`}
                            />
                          )}
                        </div>

                        <div className="pt-2">
                          <p
                            className={`font-semibold ${
                              item.status === "upcoming"
                                ? "text-slate-400"
                                : "text-slate-950"
                            }`}
                          >
                            {item.title}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {item.status === "complete"
                              ? "Completed"
                              : item.status === "current"
                                ? "Currently in progress"
                                : "Coming next"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== STATISTICS ==================== */}
        <section className="border-y border-slate-200 bg-slate-50 py-20">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
                Platform Preview
              </p>

              <p className="mt-3 text-sm text-slate-500">
                Prototype values shown for interface demonstration only.
              </p>
            </div>

            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-4xl font-bold text-slate-950">10K+</p>
                <p className="mt-2 font-medium text-slate-500">
                  Vehicles Serviced
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-4xl font-bold text-slate-950">95%</p>
                <p className="mt-2 font-medium text-slate-500">
                  Customer Satisfaction
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                <p className="text-4xl font-bold text-slate-950">24/7</p>
                <p className="mt-2 font-medium text-slate-500">
                  Repair Updates
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================== FINAL CTA ==================== */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-5xl px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] bg-blue-600 px-8 py-16 text-center shadow-2xl shadow-blue-600/20 sm:px-14">
              <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-slate-950/10 blur-3xl" />

              <div className="relative">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 text-white">
                  <Wrench size={26} />
                </div>

                <h2 className="mx-auto mt-7 max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                  Ready to take control of your vehicle service?
                </h2>

                <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-blue-100">
                  Create your RepairLink account and experience a more
                  connected way to manage vehicle repair and maintenance.
                </p>

                <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                  <Link
                    to="/signup"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3.5 font-bold text-blue-600 transition hover:bg-blue-50"
                  >
                    Create Account
                    <ArrowRight size={18} />
                  </Link>

                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center rounded-xl border border-white/30 bg-white/10 px-6 py-3.5 font-bold text-white transition hover:bg-white/20"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ==================== FOOTER ==================== */}
      <footer
        id="contact"
        className="scroll-mt-20 border-t border-slate-200 bg-slate-950 text-white"
      >
        <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
            <div className="lg:col-span-2">
              <Link to="/landing" className="inline-flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                  <Wrench size={21} />
                </div>

                <span className="text-xl font-bold">
                  Repair<span className="text-blue-400">Link</span>
                </span>
              </Link>

              <p className="mt-5 max-w-md leading-7 text-slate-400">
                A digital vehicle service platform designed to connect
                customers with a clearer, more organized repair experience.
              </p>
            </div>

            <div>
              <h3 className="font-bold text-white">Navigation</h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
                <a href="#home" className="hover:text-white">
                  Home
                </a>

                <a href="#how-it-works" className="hover:text-white">
                  How It Works
                </a>

                <a href="#services" className="hover:text-white">
                  Services
                </a>

                <a href="#why-repairlink" className="hover:text-white">
                  Why RepairLink
                </a>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-white">Account</h3>

              <div className="mt-5 flex flex-col gap-3 text-sm text-slate-400">
                <Link to="/login" className="hover:text-white">
                  Login
                </Link>

                <Link to="/signup" className="hover:text-white">
                  Sign Up
                </Link>

                <a href="#services" className="hover:text-white">
                  Services
                </a>

                <a href="#contact" className="hover:text-white">
                  Contact
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-5 border-t border-white/10 pt-7 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 RepairLink. All rights reserved.</p>

            <div className="flex gap-6">
              <button
                type="button"
                className="transition hover:text-white"
              >
                Privacy
              </button>

              <button
                type="button"
                className="transition hover:text-white"
              >
                Terms
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;