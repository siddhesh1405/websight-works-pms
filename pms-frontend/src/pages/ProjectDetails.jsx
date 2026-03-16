import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import CreateSubtaskModal from "../components/CreateSubtaskModal";
import ProgressBar from "../components/ProgressBar";
import StatusBadge from "../components/StatusBadge";
import { isAdminUser } from "../constants/auth";
import { api } from "../services/api";

export default function ProjectDetails() {
  const adminView = isAdminUser();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [deleteState, setDeleteState] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const [projectResponse, tasksResponse] = await Promise.all([
        api.getProjectById(id),
        api.getTasksByProject(id),
      ]);
      setProject(projectResponse);
      setTasks(tasksResponse);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load project details.");
    }
  };

  useEffect(() => {
    load();
    api.getUsers().then(setUsers);
  }, [id]);

  const createSubtask = async (payload) => {
    try {
      await api.createSubtask(payload.taskId, {
        ...payload,
        userId: payload.assignUser,
      });
      await load();
      setError("");
    } catch (err) {
      setError(err.message || "Failed to create subtask.");
    }
  };

  const toggle = async (taskId, subtaskId) => {
    try {
      await api.toggleSubtask(taskId, subtaskId);
      await load();
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update subtask status.");
    }
  };

  const confirmDelete = async () => {
    if (!deleteState) return;
    try {
      if (deleteState.type === "task") {
        await api.deleteTask(deleteState.taskId);
      } else {
        await api.deleteSubtask(deleteState.taskId, deleteState.subtaskId);
      }
      setDeleteState(null);
      await load();
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete item.");
      setDeleteState(null);
    }
  };

  if (!project) {
    return <div className="rounded-2xl bg-white p-6 text-slate-500 shadow-sm">Project not found.</div>;
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl text-slate-900">{project.title}</h2>
          <StatusBadge status={project.status} />
        </div>
        <p className="mb-4 text-sm text-slate-600">{project.description}</p>
        <div className="mb-2 flex items-center justify-between text-sm text-slate-600">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h3 className="font-display text-lg text-slate-900">Task List</h3>
          <button
            onClick={() => setOpenModal(true)}
            disabled={!tasks.length || !adminView}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            <Plus size={15} />
            Create Subtask
          </button>
        </div>

        {tasks.map((task) => (
          <article key={task.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-base font-semibold text-slate-800">{task.title}</h4>
              <div className="flex items-center gap-2">
                <StatusBadge status={task.status} />
                {adminView ? (
                  <button
                    type="button"
                    onClick={() =>
                      setDeleteState({
                        type: "task",
                        taskId: task.id,
                        title: task.title,
                      })
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                  >
                    <Trash2 size={12} />
                    Delete Task
                  </button>
                ) : null}
              </div>
            </div>

            <p className="mb-4 text-sm text-slate-600">{task.description}</p>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Subtask list with checkboxes</p>
            <div className="space-y-2">
              {task.subtasks.length === 0 ? (
                <p className="text-sm text-slate-500">No subtasks yet.</p>
              ) : (
                task.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 hover:bg-slate-50">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={subtask.done}
                        onChange={() => toggle(task.id, subtask.id)}
                        disabled={!adminView}
                        className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                      />
                      <span className={`text-sm ${subtask.done ? "text-slate-400 line-through" : "text-slate-700"}`}>
                        {subtask.title}
                      </span>
                    </label>
                    {adminView ? (
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteState({
                            type: "subtask",
                            taskId: task.id,
                            subtaskId: subtask.id,
                            title: subtask.title,
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-md border border-rose-200 px-2 py-1 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    ) : null}
                  </div>
                ))
              )}
            </div>
          </article>
        ))}
      </section>

      {adminView ? (
        <CreateSubtaskModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          onSubmit={createSubtask}
          users={users}
          tasks={tasks}
        />
      ) : null}

      {adminView ? (
        <ConfirmDialog
          isOpen={Boolean(deleteState)}
          title={deleteState?.type === "task" ? "Delete Task" : "Delete Subtask"}
          message={
            deleteState
              ? deleteState.type === "task"
                ? `Delete task "${deleteState.title}" and all its subtasks?`
                : `Delete subtask "${deleteState.title}"?`
              : ""
          }
          confirmLabel="Delete"
          onCancel={() => setDeleteState(null)}
          onConfirm={confirmDelete}
        />
      ) : null}
    </div>
  );
}
