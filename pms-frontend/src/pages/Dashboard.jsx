import { useEffect, useState } from "react";
import { FolderKanban, ListChecks, CheckCircle2, UsersRound } from "lucide-react";
import Card from "../components/Card";
import ProgressBar from "../components/ProgressBar";
import StatusBadge from "../components/StatusBadge";
import Table from "../components/Table";
import { api } from "../services/api";

const columns = [
  { key: "title", title: "Title" },
  { key: "startDate", title: "Start Date" },
  { key: "endDate", title: "End Date" },
  { key: "status", title: "Status" },
];

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    api.getDashboardMetrics().then(setMetrics);
  }, []);

  if (!metrics) {
    return <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card title="Total Projects" value={metrics.totalProjects} icon={FolderKanban} />
        <Card title="Active Tasks" value={metrics.activeTasks} icon={ListChecks} />
        <Card title="Completed Tasks" value={metrics.completedTasks} icon={CheckCircle2} />
        <Card title="Team Members" value={metrics.teamMembers} icon={UsersRound} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div>
          <h2 className="mb-3 font-display text-lg text-slate-900">Recent Projects</h2>
          <Table
            columns={columns}
            data={metrics.recentProjects}
            renderRow={(project) => (
              <tr key={project.id} className="transition hover:bg-slate-50/80">
                <td className="px-4 py-3 text-sm font-medium text-slate-800">{project.title}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{project.startDate}</td>
                <td className="px-4 py-3 text-sm text-slate-600">{project.endDate}</td>
                <td className="px-4 py-3 text-sm"><StatusBadge status={project.status} /></td>
              </tr>
            )}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg text-slate-900">Project Progress</h2>
          <div className="space-y-4">
            {metrics.progress.map((item) => (
              <div key={item.id}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <p className="font-medium text-slate-700">{item.title}</p>
                  <p className="text-slate-500">{item.value}%</p>
                </div>
                <ProgressBar value={item.value} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
