import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

const pageMeta = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Track project health, velocity, and delivery progress.",
  },
  "/projects": {
    title: "Projects",
    subtitle: "Manage scope, timelines, and status across all projects.",
  },
  "/tasks": {
    title: "Tasks",
    subtitle: "Coordinate work items and assignments in one place.",
  },
  "/users": {
    title: "Users",
    subtitle: "Control team access and role distribution.",
  },
};

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const dynamicMeta =
    location.pathname.startsWith("/projects/")
      ? {
          title: "Project Details",
          subtitle: "Review project progress and subtask execution.",
        }
      : pageMeta[location.pathname] || {
          title: "Workspace",
          subtitle: "Project management command center.",
        };

  return (
    <div className="relative min-h-screen bg-[radial-gradient(circle_at_top_left,_#dffaf6_0%,_#f6faff_42%,_#f8fafc_100%)]">
      <div className="flex min-h-screen">
        <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
        <main className="w-full p-4 pt-16 sm:p-6 sm:pt-6">
          <Navbar title={dynamicMeta.title} subtitle={dynamicMeta.subtitle} />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
