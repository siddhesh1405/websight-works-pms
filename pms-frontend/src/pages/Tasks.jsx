import { useEffect, useState } from "react";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import CreateSubtaskModal from "../components/CreateSubtaskModal";
import CreateTaskModal from "../components/CreateTaskModal";
import Modal from "../components/Modal";
import StatusBadge from "../components/StatusBadge";
import { isAdminUser } from "../constants/auth";
import { api } from "../services/api";

export default function Tasks() {
  const adminView = isAdminUser();
  const [error, setError] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [openSubtaskModal, setOpenSubtaskModal] = useState(false);
  const [subtaskTaskOptions, setSubtaskTaskOptions] = useState([]);
  const [viewTask, setViewTask] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTask, setDeletingTask] = useState(null);
  const [deletingSubtask, setDeletingSubtask] = useState(null);

  const loadTasks = async (projectId = "") => {
    try {
      const data = await api.getTasks(projectId ? { projectId } : {});
      setTasks(data);
      setError("");
      return data;
    } catch (err) {
      setError(err.message || "Failed to load tasks.");
      throw err;
    }
  };

  useEffect(() => {
    api.getProjects().then(setProjects);
    api.getUsers().then(setUsers);
    loadTasks();
  }, []);

  const onFilterChange = (event) => {
    const projectId = event.target.value;
    setSelectedProject(projectId);
    loadTasks(projectId);
  };

  const saveTask = async (payload) => {
    const mappedPayload = {
      title: payload.title,
      description: payload.description,
      projectId: payload.projectId,
      userId: payload.assignUser,
      status: payload.status,
    };

    try {
      if (editingTask) {
        await api.updateTask(editingTask.id, mappedPayload);
      } else {
        await api.createTask(mappedPayload);
      }

      await loadTasks(selectedProject);
      setEditingTask(null);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to save task.");
    }
  };

  const removeTask = async () => {
    if (!deletingTask) return;
    try {
      await api.deleteTask(deletingTask.id);
      await loadTasks(selectedProject);
      if (viewTask && String(viewTask.id) === String(deletingTask.id)) {
        setViewTask(null);
      }
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete task.");
    } finally {
      setDeletingTask(null);
    }
  };

  const openCreateSubtask = (task) => {
    setSubtaskTaskOptions([task]);
    setOpenSubtaskModal(true);
  };

  const saveSubtask = async (payload) => {
    try {
      await api.createSubtask(payload.taskId, {
        ...payload,
        userId: payload.assignUser,
      });
      await loadTasks(selectedProject);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to create subtask.");
    }
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    try {
      await api.toggleSubtask(taskId, subtaskId);
      await loadTasks(selectedProject);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update subtask status.");
    }
  };

  const changeTaskStatus = async (taskId, status) => {
    try {
      await api.updateTaskStatus(taskId, status);
      await loadTasks(selectedProject);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to update task status.");
    }
  };

  const removeSubtask = async () => {
    if (!deletingSubtask) return;
    try {
      await api.deleteSubtask(deletingSubtask.taskId, deletingSubtask.subtaskId);
      await loadTasks(selectedProject);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to delete subtask.");
    } finally {
      setDeletingSubtask(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <select
          value={selectedProject}
          onChange={onFilterChange}
          className="w-full max-w-sm rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm outline-none ring-teal-500 focus:ring"
        >
          <option value="">All projects</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>

        {adminView ? (
          <button
            type="button"
            onClick={() => {
              setEditingTask(null);
              setOpenModal(true);
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <Plus size={16} />
            New Task
          </button>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            No tasks found for the selected filter.
          </div>
        ) : (
          tasks.map((task) => (
            <article key={task.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-slate-900">{task.title}</h4>
                  <p className="text-sm text-slate-500">
                    {task.project} • {task.assignedUser}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {adminView ? (
                    <StatusBadge status={task.status} />
                  ) : (
                    <select
                      value={task.status}
                      onChange={(event) => changeTaskStatus(task.id, event.target.value)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 outline-none ring-teal-500 focus:ring"
                    >
                      <option value="PLANNING">Planning</option>
                      <option value="ACTIVE">Active</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                  )}
                  <button
                    type="button"
                    onClick={() => setViewTask(task)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                  >
                    <Eye size={14} />
                    View
                  </button>
                  {adminView ? (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTask(task);
                          setOpenModal(true);
                        }}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingTask(task)}
                        className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </>
                  ) : null}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Subtasks</p>
                  {adminView ? (
                    <button
                      type="button"
                      onClick={() => openCreateSubtask(task)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                    >
                      <Plus size={12} />
                      Create Subtask
                    </button>
                  ) : null}
                </div>
                {task.subtasks?.length ? (
                  <div className="space-y-2">
                    {task.subtasks.map((subtask) => (
                      <div
                        key={subtask.id}
                        className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2"
                      >
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={subtask.done}
                            onChange={() => toggleSubtask(task.id, subtask.id)}
                            className="h-4 w-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                          />
                          <div>
                            <p className={`text-sm font-medium ${subtask.done ? "line-through text-slate-400" : "text-slate-800"}`}>
                              {subtask.title}
                            </p>
                            <p className="text-xs text-slate-500">{subtask.assignedUser || "Unknown"}</p>
                          </div>
                        </label>
                        <div className="flex items-center gap-2">
                          <StatusBadge status={subtask.status} />
                          {adminView ? (
                            <button
                              type="button"
                              onClick={() =>
                                setDeletingSubtask({
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
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No subtasks for this task.</p>
                )}
              </div>
            </article>
          ))
        )}
      </div>

      {adminView ? (
        <CreateTaskModal
          isOpen={openModal}
          onClose={() => {
            setOpenModal(false);
            setEditingTask(null);
          }}
          onSubmit={saveTask}
          projects={projects}
          users={users}
          initialData={editingTask}
        />
      ) : null}

      {adminView ? (
        <CreateSubtaskModal
          isOpen={openSubtaskModal}
          onClose={() => setOpenSubtaskModal(false)}
          onSubmit={saveSubtask}
          users={users}
          tasks={subtaskTaskOptions}
        />
      ) : null}

      <Modal
        title="Task Details"
        isOpen={Boolean(viewTask)}
        onClose={() => setViewTask(null)}
        footer={[
          <button
            key="close"
            onClick={() => setViewTask(null)}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Close
          </button>,
        ]}
      >
        {viewTask ? (
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-slate-500">Title</p>
              <p className="font-medium text-slate-800">{viewTask.title}</p>
            </div>
            <div>
              <p className="text-slate-500">Description</p>
              <p className="text-slate-700">{viewTask.description || "-"}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-slate-500">Project</p>
                <p className="font-medium text-slate-800">{viewTask.project}</p>
              </div>
              <div>
                <p className="text-slate-500">Assignee</p>
                <p className="font-medium text-slate-800">{viewTask.assignedUser}</p>
              </div>
            </div>
            <div>
              <p className="mb-1 text-slate-500">Status</p>
              <StatusBadge status={viewTask.status} />
            </div>
            <div>
              <p className="mb-2 text-slate-500">Subtasks</p>
              {viewTask.subtasks?.length ? (
                <div className="space-y-2">
                  {viewTask.subtasks.map((subtask) => (
                    <div
                      key={subtask.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <div>
                        <p className={`font-medium ${subtask.done ? "line-through text-slate-400" : "text-slate-800"}`}>
                          {subtask.title}
                        </p>
                        <p className="text-xs text-slate-500">{subtask.assignedUser || "Unknown"}</p>
                      </div>
                      <StatusBadge status={subtask.status} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No subtasks for this task.</p>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {adminView ? (
        <ConfirmDialog
          isOpen={Boolean(deletingTask)}
          title="Delete Task"
          message={deletingTask ? `Delete task "${deletingTask.title}" and all its subtasks?` : ""}
          confirmLabel="Delete"
          onCancel={() => setDeletingTask(null)}
          onConfirm={removeTask}
        />
      ) : null}

      {adminView ? (
        <ConfirmDialog
          isOpen={Boolean(deletingSubtask)}
          title="Delete Subtask"
          message={deletingSubtask ? `Delete subtask "${deletingSubtask.title}"?` : ""}
          confirmLabel="Delete"
          onCancel={() => setDeletingSubtask(null)}
          onConfirm={removeSubtask}
        />
      ) : null}
    </div>
  );
}
