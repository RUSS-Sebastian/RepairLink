import { Link } from "react-router-dom";

function Button({
  children,
  to,
  type = "button",
  variant = "primary",
  className = "",
  onClick,
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

  const variants = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-lg shadow-blue-600/20",
    secondary:
      "border border-slate-200 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600",
    dark:
      "bg-slate-900 text-white hover:bg-slate-800 focus:ring-slate-500",
    light:
      "bg-white text-slate-900 hover:bg-slate-100 focus:ring-white",
  };

  const classes = `${base} ${variants[variant]} ${className}`;

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} onClick={onClick}>
      {children}
    </button>
  );
}

export default Button;