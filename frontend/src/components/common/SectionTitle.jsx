function SectionTitle({
  eyebrow,
  title,
  description,
  centered = true,
  titleClassName = "text-slate-900",
  descriptionClassName = "text-slate-600",
}) {
  return (
    <div
      className={`max-w-3xl ${centered ? "mx-auto text-center" : "text-left"}`}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
          {eyebrow}
        </p>
      )}

      <h2
        className={`text-3xl font-bold tracking-tight sm:text-4xl ${titleClassName}`}
      >
        {title}
      </h2>

      {description && (
        <p
          className={`mt-4 text-base leading-7 sm:text-lg ${descriptionClassName}`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionTitle;
