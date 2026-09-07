import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

function FormInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  maxLength,
  helperText,
  className = "",
  disabled = false,
  ...rest
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div>
      {label && (
        <label
          htmlFor={name}
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          {label}
          {required && <span className="ml-1 text-red-500">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          className={`w-full rounded-xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 ${
            isPassword ? "pr-11" : ""
          } ${
            error
              ? "border-red-400 focus:border-red-500"
              : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
          } ${disabled ? "cursor-not-allowed bg-slate-50 text-slate-500" : ""} ${className}`}
          {...rest}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            disabled={disabled}
            aria-label={
              showPassword
                ? `Hide ${label || "password"}`
                : `Show ${label || "password"}`
            }
            title={
              showPassword
                ? `Hide ${label || "password"}`
                : `Show ${label || "password"}`
            }
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-xl text-slate-400 transition hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {helperText && !error && (
        <p className="mt-1.5 text-xs text-slate-500">{helperText}</p>
      )}

      {error && (
        <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

export default FormInput;
