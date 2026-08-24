import { Eye, EyeOff } from "lucide-react";

function FormInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  icon: Icon,
  showPassword,
  onTogglePassword,
}) {
  const isPassword = type === "password";

  return (
    <div className="form-group">
      <label htmlFor={name} className="form-label">
        {label}
      </label>

      <div className={`input-wrapper ${error ? "input-error" : ""}`}>
        {Icon && <Icon className="input-icon" size={19} />}

        <input
          id={name}
          name={name}
          type={isPassword && showPassword ? "text" : type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className="form-input"
          autoComplete={name}
        />

        {isPassword && (
          <button
            type="button"
            className="password-toggle"
            onClick={onTogglePassword}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff size={19} />
            ) : (
              <Eye size={19} />
            )}
          </button>
        )}
      </div>

      {error && <p className="field-error">{error}</p>}
    </div>
  );
}

export default FormInput;