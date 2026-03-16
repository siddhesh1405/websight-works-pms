export default function ProgressBar({ value }) {
  return (
    <div className="h-2.5 w-full rounded-full bg-slate-200">
      <div
        className="h-2.5 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
