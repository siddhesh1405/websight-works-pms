export default function Card({ title, value, icon: Icon, subtitle }) {
  return (
    <div className="rounded-2xl border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        {Icon ? (
          <div className="rounded-xl bg-teal-50 p-2 text-teal-700">
            <Icon size={18} />
          </div>
        ) : null}
      </div>
      <p className="text-3xl font-bold tracking-tight text-slate-900">{value}</p>
      {subtitle ? <p className="mt-2 text-xs text-slate-500">{subtitle}</p> : null}
    </div>
  );
}
