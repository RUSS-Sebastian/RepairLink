import { useEffect, useState } from "react";

function PhoneInput({
  label = "Phone number",
  name = "phone",
  countryCode = "+95",
  value,
  onChange,
  onCountryCodeChange,
  error,
  required = false,
}) {
  const [phone, setPhone] = useState(value || "");

  useEffect(() => {
    setPhone(value || "");
  }, [value]);

  const handlePhoneChange = (event) => {
    const newValue = event.target.value.replace(/\D/g, "");

    setPhone(newValue);

    onChange({
      target: {
        name,
        value: newValue,
      },
    });
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-semibold text-slate-700"
      >
        {label}
      </label>

      <div
        className={`flex overflow-hidden rounded-xl border bg-white transition-all duration-200 ${
          error
            ? "border-red-400"
            : "border-slate-200 focus-within:border-blue-500"
        }`}
      >
        <select
          value={countryCode}
          onChange={(event) => onCountryCodeChange(event.target.value)}
          className="border-0 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700 outline-none"
          aria-label="Country code"
        >
          <option value="+95">🇲🇲 +95</option>
          <option value="+1">🇺🇸 +1</option>
          <option value="+44">🇬🇧 +44</option>
          <option value="+91">🇮🇳 +91</option>
          <option value="+65">🇸🇬 +65</option>
          <option value="+66">🇹🇭 +66</option>
        </select>

        <input
          id={name}
          name={name}
          type="tel"
          inputMode="numeric"
          autoComplete="tel"
          placeholder="912345678"
          value={phone}
          onChange={handlePhoneChange}
          required={required}
          className="min-w-0 flex-1 border-0 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
      </div>

      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default PhoneInput;
