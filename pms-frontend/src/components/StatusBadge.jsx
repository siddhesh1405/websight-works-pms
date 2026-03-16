const styles = {
  PLANNING: "bg-amber-100 text-amber-700 ring-amber-200",
  ACTIVE: "bg-sky-100 text-sky-700 ring-sky-200",
  TODO: "bg-amber-100 text-amber-700 ring-amber-200",
  IN_PROGRESS: "bg-sky-100 text-sky-700 ring-sky-200",
  COMPLETED: "bg-emerald-100 text-emerald-700 ring-emerald-200",
};

export default function StatusBadge({ status }) {
  const normalized = (status || "").toUpperCase();
  const className = styles[normalized] || "bg-slate-100 text-slate-700 ring-slate-200";

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${className}`}>
      {normalized === "IN_PROGRESS"
        ? "In Progress"
        : normalized.charAt(0) + normalized.slice(1).toLowerCase()}
    </span>
  );
}
