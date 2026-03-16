import { useEffect, useMemo, useState } from "react";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import CreateProjectModal from "../components/CreateProjectModal";
import ConfirmDialog from "../components/ConfirmDialog";
import EmptyState from "../components/EmptyState";
import ProgressBar from "../components/ProgressBar";
import StatusBadge from "../components/StatusBadge";
import Table from "../components/Table";
import { isAdminUser } from "../constants/auth";
import { api } from "../services/api";

const columns = [
  { key: "title", title: "Title" },
  { key: "description", title: "Description" },
  { key: "startDate", title: "Start Date" },
  { key: "endDate", title: "End Date" },
  { key: "progress", title: "Progress" },
  { key: "status", title: "Status" },
  { key: "actions", title: "Actions" },
];

export default function Projects() {
  const adminView = isAdminUser();
  const [search, setSearch] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);

  const deriveProjectFromTasks = (project, allTasks) => {
    const relatedTasks = allTasks.filter((task) => String(task.projectId) === String(project.id));
    if (!relatedTasks.length) {
      return { ...project, status: "PLANNING", progress: 0 };
    }

    const completedCount = relatedTasks.filter((task) => task.status === "COMPLETED").length;
    const planningOnly = relatedTasks.every((task) => task.status === "PLANNING");
    const progress = Math.round((completedCount / relatedTasks.length) * 100);

    let status = "ACTIVE";
    if (completedCount === relatedTasks.length) status = "COMPLETED";
    else if (planningOnly) status = "PLANNING";

    return { ...project, status, progress };
  };

  const loadProjects = async () => {
    try {
      const projectData = await api.getProjects();
      let taskData = [];

      try {
        taskData = await api.getTasks();
      } catch (taskErr) {
        console.warn("Tasks fetch failed while loading projects. Falling back to project-only view.", taskErr);
      }

      setProjects(projectData.map((project) => deriveProjectFromTasks(project, taskData)));
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load projects.");
      console.error(err);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const createProject = async (payload) => {
    try {
      if (editingProject) {
        await api.updateProject(editingProject.id, payload);
      } else {
        await api.createProject(payload);
      }
      await loadProjects();
      setError("");
      setEditingProject(null);
    } catch (err) {
      setError(err.message || "Failed to save project.");
      console.error(err);
    }
  };

  const removeProject = async () => {
    if (!deletingProject) return;
    try {
      await api.deleteProject(deletingProject.id);
      await loadProjects();
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete project.");
      console.error(err);
    } finally {
      setDeletingProject(null);
    }
  };

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return projects.filter(
      (project) =>
        project.title.toLowerCase().includes(term) ||
        project.description.toLowerCase().includes(term),
    );
  }, [projects, search]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <label className="flex w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">
          <Search size={16} className="text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search projects"
            className="w-full bg-transparent text-sm text-slate-700 outline-none"
          />
        </label>

        {adminView ? (
          <button
            type="button"
            onClick={() => {
              setEditingProject(null);
              setOpenModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <Plus size={16} />
            New Project
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="No projects yet"
          message={adminView ? "Create your first project" : "No projects assigned"}
          actionLabel={adminView ? "+ New Project" : undefined}
          onAction={adminView ? () => setOpenModal(true) : undefined}
        />
      ) : (
        <Table
          columns={columns}
          data={filtered}
          renderRow={(project) => (
            <tr key={project.id} className="transition hover:bg-slate-50/80">
              <td className="px-4 py-3 text-sm font-medium text-slate-800">{project.title}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{project.description}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{project.startDate}</td>
              <td className="px-4 py-3 text-sm text-slate-600">{project.endDate}</td>
              <td className="px-4 py-3">
                <div className="space-y-1">
                  <ProgressBar value={project.progress} />
                  <p className="text-xs text-slate-500">{project.progress}%</p>
                </div>
              </td>
              <td className="px-4 py-3 text-sm"><StatusBadge status={project.status} /></td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <Eye size={14} />
                    View
                  </Link>
                  {adminView ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingProject(project);
                          setOpenModal(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingProject(project)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </td>
            </tr>
          )}
        />
      )}

      {adminView ? (
        <CreateProjectModal
          isOpen={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingProject(null);
          }}
          onSubmit={createProject}
          initialData={editingProject}
        />
      ) : null}

      {adminView ? (
        <ConfirmDialog
          isOpen={Boolean(deletingProject)}
          title="Delete Project"
          message={
            deletingProject
              ? `Delete project "${deletingProject.title}"? This will also delete related tasks and subtasks.`
              : ""
          }
          confirmLabel="Delete"
          onCancel={() => setDeletingProject(null)}
          onConfirm={removeProject}
        />
      ) : null}
    </div>
  );
}
