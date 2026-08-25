import {
  ArrowRight,
  BadgeCheck,
  BatteryCharging,
  CalendarCheck,
  Car,
  CheckCircle2,
  Circle,
  ClipboardCheck,
  CreditCard,
  Gauge,
  Headphones,
  History,
  Search,
  ShieldCheck,
  Sparkles,
  Wrench,
  Zap,
} from "lucide-react";

import Button from "../../components/common/Button";
import SectionTitle from "../../components/common/SectionTitle";
import { ROUTES } from "../../constants/routes";

const services = [
  {
    title: "General Maintenance",
    description: "Keep your vehicle running reliably with scheduled maintenance.",
    icon: Wrench,
  },
  {
    title: "Diagnostics",
    description: "Identify vehicle issues with a structured digital diagnostic process.",
    icon: Search,
  },
  {
    title: "Brake Service",
    description: "Monitor brake inspections, recommendations and repair progress.",
    icon: Gauge,
  },
  {
    title: "Engine Service",
    description: "Manage engine-related repairs with clear service information.",
    icon: Zap,
  },
  {
    title: "Electrical Service",
    description: "Track battery, electrical and vehicle system service.",
    icon: BatteryCharging,
  },
  {
    title: "Tire Service",
    description: "Keep tire maintenance and service records organized.",
    icon: Car,
  },
];

const processSteps = [
  {
    number: "01",
    title: "Request Service",
    description: "Tell us what your vehicle needs and submit a service request.",
    icon: ClipboardCheck,
  },
  {
    number: "02",
    title: "Schedule",
    description: "Choose a convenient appointment and keep everything organized.",
    icon: CalendarCheck,
  },
  {
    number: "03",
    title: "Inspect",
    description: "Review inspection findings and understand what your vehicle needs.",
    icon: Search,
  },
  {
    number: "04",
    title: "Approve",
    description: "Review your digital estimate before repair work begins.",
    icon: CheckCircle2,
  },
  {
    number: "05",
    title: "Track Repair",
    description: "Follow your vehicle's repair progress from one dashboard.",
    icon: Gauge,
  },
  {
    number: "06",
    title: "Pay & Collect",
    description: "Complete payment and prepare for pickup or delivery.",
    icon: CreditCard,
  },
];

const benefits = [
  {
    title: "Transparent repair process",
    description: "Know where your vehicle is in the service journey.",
    icon: ShieldCheck,
  },
  {
    title: "Digital estimates",
    description: "Review repair information before approving additional work.",
    icon: ClipboardCheck,
  },
  {
    title: "Real-time updates",
    description: "Stay informed as your repair progresses.",
    icon: Zap,
  },
  {
    title: "Service history",
    description: "Keep your vehicle maintenance history accessible.",
    icon: History,
  },
  {
    title: "Secure payments",
    description: "A streamlined experience for completing service payments.",
    icon: CreditCard,
  },
  {
    title: "Convenient support",
    description: "Keep communication and service information connected.",
    icon: Headphones,
  },
];

function LandingPage() {
  return (
    <div className="overflow-hidden">

      {/* HERO */}
      <section
        id="home"
        className="relative bg-slate-950 text-white"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(37,99,235,0.25),transparent_35%)]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 lg:grid-cols-2 lg:px-8 lg:py-28">

          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
              <Sparkles size={16} />
              Smarter vehicle service management
            </div>

            <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Take control of your vehicle's
              <span className="text-blue-400"> repair journey.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
              RepairLink helps customers manage vehicle repairs and
              maintenance digitally — from service requests and estimates
              to repair progress, payment and vehicle history.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button to={ROUTES.SIGNUP}>
                Get Started
                <ArrowRight className="ml-2" size={18} />
              </Button>

              <Button
                to={ROUTES.LOGIN}
                variant="secondary"
                className="border-slate-700 bg-slate-900 text-white hover:border-blue-400 hover:bg-slate-800"
              >
                Sign In
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-sm text-slate-400">
              <span className="flex items-center gap-2">
                <BadgeCheck size={17} className="text-blue-400" />
                Digital service records
              </span>

              <span className="flex items-center gap-2">
                <BadgeCheck size={17} className="text-blue-400" />
                Clear repair updates
              </span>

              <span className="flex items-center gap-2">
                <BadgeCheck size={17} className="text-blue-400" />
                Customer-focused
              </span>
            </div>
          </div>

          {/* Hero dashboard */}
          <div className="relative">
            <div className="absolute -inset-8 rounded-full bg-blue-600/10 blur-3xl" />

            <div className="relative rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl backdrop-blur">

              <div className="rounded-2xl bg-white p-5 text-slate-900">

                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Vehicle service
                    </p>
                    <h3 className="mt-1 text-lg font-bold">
                      Toyota Camry
                    </h3>
                  </div>

                  <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600">
                    In Progress
                  </span>
                </div>

                <div className="mt-6 space-y-5">

                  <div className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <p className="font-semibold">Service requested</p>
                      <p className="text-sm text-slate-500">
                        Vehicle received by service team
                      </p>
                    </div>
                  </div>

                  <div className="ml-4 h-5 border-l-2 border-dashed border-blue-200" />

                  <div className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                      <CheckCircle2 size={18} />
                    </div>

                    <div>
                      <p className="font-semibold">Inspection completed</p>
                      <p className="text-sm text-slate-500">
                        Findings are ready for review
                      </p>
                    </div>
                  </div>

                  <div className="ml-4 h-5 border-l-2 border-dashed border-slate-200" />

                  <div className="flex gap-4">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-blue-500 bg-blue-50 text-blue-600">
                      <Wrench size={17} />
                    </div>

                    <div>
                      <p className="font-semibold">Repair in progress</p>
                      <p className="text-sm text-slate-500">
                        Estimated completion: Today
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 rounded-xl bg-slate-50 p-4">
                  <div className="mb-2 flex justify-between text-xs font-semibold">
                    <span>Repair progress</span>
                    <span className="text-blue-600">68%</span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className="h-full w-[68%] rounded-full bg-blue-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* STATS */}
      <section className="border-b border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 divide-y divide-slate-100 px-5 py-8 sm:grid-cols-3 sm:divide-x sm:divide-y-0 lg:px-8">

          <div className="px-5 py-4 text-center">
            <p className="text-3xl font-bold text-slate-900">10K+</p>
            <p className="mt-1 text-sm text-slate-500">Vehicles Serviced</p>
            <p className="mt-1 text-xs text-slate-400">Prototype value</p>
          </div>

          <div className="px-5 py-4 text-center">
            <p className="text-3xl font-bold text-slate-900">95%</p>
            <p className="mt-1 text-sm text-slate-500">Customer Satisfaction</p>
            <p className="mt-1 text-xs text-slate-400">Prototype value</p>
          </div>

          <div className="px-5 py-4 text-center">
            <p className="text-3xl font-bold text-slate-900">24/7</p>
            <p className="mt-1 text-sm text-slate-500">Repair Updates</p>
            <p className="mt-1 text-xs text-slate-400">Prototype value</p>
          </div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section
        id="how-it-works"
        className="bg-slate-50 px-5 py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">

          <SectionTitle
            eyebrow="How it works"
            title="Your entire repair journey, connected."
            description="RepairLink brings the important steps of vehicle service into one organized digital experience."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {processSteps.map((step) => {
              const Icon = step.icon;

              return (
                <div
                  key={step.number}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-200/50"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Icon size={21} />
                    </div>

                    <span className="text-sm font-bold text-slate-300">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-bold text-slate-900">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section
        id="services"
        className="bg-white px-5 py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">

          <SectionTitle
            eyebrow="Services"
            title="Everything your vehicle needs."
            description="A digital experience designed around the most important vehicle maintenance and repair services."
          />

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = service.icon;

              return (
                <div
                  key={service.title}
                  className="rounded-2xl border border-slate-200 p-6 transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                    <Icon size={23} />
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {service.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {service.description}
                  </p>

                  <span className="mt-5 inline-flex items-center text-sm font-semibold text-blue-600">
                    Available through RepairLink
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY REPAIRLINK */}
      <section
        id="why-repairlink"
        className="bg-slate-950 px-5 py-20 text-white lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">

          <SectionTitle
            eyebrow="Why RepairLink"
            title="Built around a better service experience."
            description="The goal is simple: make vehicle repair easier to understand, easier to track and easier to manage."
          />

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:bg-white/10"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400">
                    <Icon size={21} />
                  </div>

                  <h3 className="mt-5 font-bold">
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
      </section>

      {/* TRACKING */}
      <section className="bg-slate-50 px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">

          <div>
            <SectionTitle
              centered={false}
              eyebrow="Repair tracking"
              title="Always know what's happening with your vehicle."
              description="The RepairLink experience is designed to make repair progress easy to understand at every stage."
            />

            <div className="mt-8 space-y-5">

              <div className="flex gap-4">
                <CheckCircle2 className="mt-1 text-blue-600" />
                <div>
                  <h4 className="font-bold">Service Requested</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Your service request has been received.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <CheckCircle2 className="mt-1 text-blue-600" />
                <div>
                  <h4 className="font-bold">Inspection</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Vehicle inspection and findings are complete.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="mt-1 h-6 w-6 rounded-full border-2 border-blue-600 bg-blue-50" />
                <div>
                  <h4 className="font-bold">Estimate</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Review and approve the proposed repair work.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 opacity-50">
                <Circle className="mt-1" />
                <div>
                  <h4 className="font-bold">Repair</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Approved repair work begins.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 opacity-50">
                <Circle className="mt-1" />
                <div>
                  <h4 className="font-bold">Ready for Pickup</h4>
                  <p className="mt-1 text-sm text-slate-500">
                    Your vehicle is ready to collect.
                  </p>
                </div>
              </div>

            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="rounded-2xl bg-slate-950 p-6 text-white">

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-400">
                    Current service
                  </p>

                  <h3 className="mt-1 text-xl font-bold">
                    Brake Service
                  </h3>
                </div>

                <div className="rounded-xl bg-blue-500/10 p-3 text-blue-400">
                  <Wrench size={23} />
                </div>
              </div>

              <div className="mt-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">
                    Overall progress
                  </span>

                  <span className="font-bold text-blue-400">
                    60%
                  </span>
                </div>

                <div className="mt-3 h-3 rounded-full bg-slate-800">
                  <div className="h-full w-[60%] rounded-full bg-blue-500" />
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-500">
                    Estimate
                  </p>

                  <p className="mt-1 font-bold">
                    Ready
                  </p>
                </div>

                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-xs text-slate-500">
                    Status
                  </p>

                  <p className="mt-1 font-bold text-blue-400">
                    In Progress
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="px-5 py-20 lg:px-8 lg:py-28"
      >
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-blue-600 px-6 py-14 text-center text-white shadow-2xl shadow-blue-600/20 sm:px-12">

          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-100">
            Start with RepairLink
          </p>

          <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
            Ready to take control of your vehicle service?
          </h2>

          <p className="mx-auto mt-5 max-w-2xl text-blue-100">
            Create your RepairLink account and experience a more organized
            way to manage vehicle repairs and maintenance.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button
              to={ROUTES.SIGNUP}
              variant="light"
            >
              Create Account
              <ArrowRight className="ml-2" size={18} />
            </Button>

            <Button
              to={ROUTES.LOGIN}
              variant="secondary"
              className="border-blue-400 bg-blue-700 text-white hover:bg-blue-800"
            >
              Sign In
            </Button>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-200 bg-white">

        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-14 md:grid-cols-4 lg:px-8">

          <div className="md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Car size={20} />
              </div>

              <span className="text-xl font-bold">
                Repair<span className="text-blue-600">Link</span>
              </span>
            </div>

            <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
              A digital vehicle service platform designed to make repairs,
              maintenance and service communication easier to manage.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900">
              Navigation
            </h4>

            <div className="mt-4 space-y-3 text-sm text-slate-500">
              <a href="#home" className="block hover:text-blue-600">
                Home
              </a>

              <a href="#how-it-works" className="block hover:text-blue-600">
                How It Works
              </a>

              <a href="#services" className="block hover:text-blue-600">
                Services
              </a>

              <a href="#why-repairlink" className="block hover:text-blue-600">
                Why RepairLink
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900">
              Company
            </h4>

            <div className="mt-4 space-y-3 text-sm text-slate-500">
              <a href="#contact" className="block hover:text-blue-600">
                Contact
              </a>

              <button className="block hover:text-blue-600">
                Privacy
              </button>

              <button className="block hover:text-blue-600">
                Terms
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100">
          <div className="mx-auto flex max-w-7xl flex-col justify-between gap-3 px-5 py-5 text-xs text-slate-400 sm:flex-row lg:px-8">
            <p>
              © 2026 RepairLink. Prototype interface.
            </p>

            <p>
              Built for digital vehicle service management.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default LandingPage;