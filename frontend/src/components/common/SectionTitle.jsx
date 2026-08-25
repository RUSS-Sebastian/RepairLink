function SectionTitle({
  eyebrow,
  title,
  description,
  centered = true,
}) {
  return (
    <div
      className={`max-w-3xl ${
        centered ? "mx-auto text-center" : "text-left"
      }`}
    >
      {eyebrow && (
        <p className="mb-3 text-sm font-bold uppercase tracking-[0.2em] text-blue-600">
          {eyebrow}
        </p>
      )}

      <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 text-base leading-7 text-slate-600 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

export default SectionTitle;