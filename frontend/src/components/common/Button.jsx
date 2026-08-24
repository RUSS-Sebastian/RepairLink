function Button({
  children,
  type = "button",
  loading = false,
  disabled = false,
  onClick,
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className="primary-button"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}

export default Button;