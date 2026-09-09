import { Link } from "react-router-dom";
import { ArrowLeft, Sparkles } from "lucide-react";
import { ROUTES } from "../../constants/routes";

export default function StaffPlaceholderPage({
  title,
  description = "This staff module is currently being configured.",
  icon: Icon,
}) {
  return (
    <div className="flex min-h-[65vh] flex-col items-center justify-center text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#0261F3] shadow-sm">
        {Icon ? <Icon size={30} strokeWidth={1.8} /> : <Sparkles size={30} strokeWidth={1.8} />}
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
        {description}
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Link
          to={ROUTES.STAFF_DASHBOARD}
          className="inline-flex items-center gap-2 rounded-xl bg-[#0261F3] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#0256D6]"
        >
          <ArrowLeft size={16} />
          Back to Staff Dashboard
        </Link>
      </div>
    </div>
  );
}
