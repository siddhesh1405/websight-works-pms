import { useEffect, useState } from "react";
import Modal from "./Modal";

const initial = {
  taskId: "",
  title: "",
  description: "",
  assignUser: "",
  status: "PLANNING",
};

export default function CreateSubtaskModal({ isOpen, onClose, onSubmit, users = [], tasks = [] }) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (!isOpen) return;
    if (tasks.length === 1) {
      setForm((prev) => ({ ...prev, taskId: String(tasks[0].id) }));
      return;
    }
    setForm((prev) => ({ ...prev, taskId: "" }));
  }, [isOpen, tasks]);

  const onChange = (event) => setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));

  const submit = () => {
    if (!form.taskId || !form.title.trim() || !form.assignUser) return;
    onSubmit(form);
    setForm(initial);
    onClose();
  };

  return (
    <Modal
      title="Create Subtask"
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
          Add
        </button>,
      ]}
    >
      <div className="grid gap-4">
        <select
          name="taskId"
          value={form.taskId}
          onChange={onChange}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
        >
          <option value="">Select task for subtask</option>
          {tasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
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
