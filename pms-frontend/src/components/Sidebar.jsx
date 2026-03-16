import { LayoutDashboard, FolderKanban, ListTodo, Users, PanelLeftClose } from "lucide-react";
import { NavLink } from "react-router-dom";
import BrandLogo from "./BrandLogo";
import { isAdminUser } from "../constants/auth";

const links = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: ListTodo },
  { to: "/users", label: "Users", icon: Users },
];

export default function Sidebar({ open, setOpen }) {
  const visibleLinks = isAdminUser() ? links : links.filter((link) => link.to === "/tasks");

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-lg border border-slate-300 bg-white p-2 text-slate-700 shadow sm:hidden"
      >
        <PanelLeftClose size={18} />
      </button>

      {open ? (
        <button
          aria-label="Close sidebar backdrop"
          className="fixed inset-0 z-30 bg-slate-900/40 sm:hidden"
          onClick={() => setOpen(false)}
        />
      ) : null}

      <aside
        className={`fixed z-40 h-full w-72 border-r border-slate-200 bg-white/95 p-6 backdrop-blur transition-transform sm:static sm:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-10 flex items-center gap-3">
          <BrandLogo size="sm" />
          <div>
            <p className="font-display text-lg leading-none text-slate-900">Websight Works PMS</p>
            <p className="text-xs text-slate-500">Execution Workspace</p>
          </div>
        </div>

        <nav className="space-y-2">
          {visibleLinks.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-teal-50 text-teal-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
