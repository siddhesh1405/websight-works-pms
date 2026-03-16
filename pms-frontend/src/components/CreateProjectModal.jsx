import { useEffect, useState } from "react";
import Modal from "./Modal";

const initial = {
  title: "",
  description: "",
  startDate: "",
  endDate: "",
  status: "PLANNING",
};

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
}) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        startDate: initialData.startDate || "",
        endDate: initialData.endDate || "",
        status: initialData.status || "PLANNING",
      });
      return;
    }
    setForm(initial);
  }, [initialData, isOpen]);

  const updateField = (event) => {
    setForm((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const submit = () => {
    if (!form.title.trim() || !form.description.trim() || !form.startDate || !form.endDate) return;
    onSubmit(form);
    setForm(initial);
    onClose();
  };

  return (
    <Modal
      title={initialData ? "Edit Project" : "Create Project"}
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
          onChange={updateField}
          placeholder="Title"
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
        />
        <textarea
          name="description"
          value={form.description}
          onChange={updateField}
          placeholder="Description"
          className="min-h-24 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
        />
        <div className="grid grid-cols-2 gap-3">
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={updateField}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
          />
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={updateField}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
          />
        </div>
        <select
          name="status"
          value={form.status}
          onChange={updateField}
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
