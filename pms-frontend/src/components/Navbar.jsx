import { LogOut, Search, UserCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TOKEN_KEY, getAuthUser } from "../constants/auth";

export default function Navbar({ title, subtitle }) {
  const navigate = useNavigate();
  const authUser = getAuthUser();
  const roleLabel = authUser?.role === "ADMIN" ? "Admin" : "Member";

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    navigate("/login", { replace: true });
  };

  return (
    <header className="mb-6 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-2xl text-slate-900">{title}</h1>
          {subtitle ? <p className="text-sm text-slate-500">{subtitle}</p> : null}
        </div>

        <div className="flex items-center gap-2">
          <label className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-slate-500 md:flex">
            <Search size={16} />
            <input
              placeholder="Quick search"
              className="w-40 bg-transparent text-sm text-slate-700 outline-none"
            />
          </label>
          <button className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            <UserCircle2 size={18} />
            {roleLabel}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
