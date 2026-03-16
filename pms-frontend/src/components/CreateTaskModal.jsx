import { useEffect, useState } from "react";
import Modal from "./Modal";

const initial = {
  title: "",
  description: "",
  assignUser: "",
  projectId: "",
  status: "PLANNING",
};

export default function CreateTaskModal({
  isOpen,
  onClose,
  onSubmit,
  projects = [],
  users = [],
  initialData = null,
}) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        assignUser: initialData.userId ? String(initialData.userId) : "",
        projectId: initialData.projectId ? String(initialData.projectId) : "",
        status: initialData.status || "PLANNING",
      });
      return;
    }
    setForm(initial);
  }, [initialData, isOpen]);

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const submit = () => {
    if (!form.title.trim() || !form.projectId || !form.assignUser) return;
    onSubmit(form);
    setForm(initial);
    onClose();
  };

  return (
    <Modal
      title={initialData ? "Edit Task" : "Create Task"}
      isOpen={isOpen}
      onClose={onClose}
      footer={[
        <button
          key="cancel"
          onClick={onClose}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Cancel
        </button>,
        <button
          key="create"
          onClick={submit}
          className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
        >
          {initialData ? "Update" : "Create"}
        </button>,
      ]}
    >
      <div className="grid gap-4">
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          placeholder="Title"
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Description"
          className="min-h-24 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
        />
        <select
          name="assignUser"
          value={form.assignUser}
          onChange={onChange}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
        >
          <option value="">Assign user</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
        <select
          name="projectId"
          value={form.projectId}
          onChange={onChange}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
        >
          <option value="">Select project</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.title}
            </option>
          ))}
        </select>
        <select
          name="status"
          value={form.status}
          onChange={onChange}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
        >
          <option value="PLANNING">Planning</option>
          <option value="ACTIVE">Active</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>
    </Modal>
  );
}
