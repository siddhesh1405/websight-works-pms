import { useEffect, useState } from "react";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import ConfirmDialog from "../components/ConfirmDialog";
import Modal from "../components/Modal";
import Table from "../components/Table";
import { api } from "../services/api";

const columns = [
  { key: "name", title: "Name" },
  { key: "email", title: "Email" },
  { key: "role", title: "Role" },
  { key: "actions", title: "Actions" },
];

const roleClass = {
  Admin: "bg-rose-100 text-rose-700 ring-rose-200",
  Member: "bg-indigo-100 text-indigo-700 ring-indigo-200",
};
const PROTECTED_ADMIN_EMAIL = "admin@websightworks.org";
const isAdminUser = (user) => {
  const emailProtected = user?.email?.toLowerCase() === PROTECTED_ADMIN_EMAIL;
  const roleAdmin = String(user?.role || "").toLowerCase() === "admin";
  return emailProtected || roleAdmin;
};

export default function Users() {
  const [users, setUsers] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Member",
  });

  const loadUsers = async () => {
    const data = await api.getUsers();
    setUsers(data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const openCreate = () => {
    setEditingUser(null);
    setForm({ name: "", email: "", password: "", role: "Member" });
    setOpenModal(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      name: user.name || "",
      email: user.email || "",
      password: "",
      role: user.role || "Member",
    });
    setOpenModal(true);
  };

  const saveUser = async () => {
    if (!form.name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Name, email and password are required.");
      return;
    }

    try {
      const normalizedEmail = form.email.trim().toLowerCase();
      const payload = {
        ...form,
        email:
          editingUser && editingUser.email?.toLowerCase() === PROTECTED_ADMIN_EMAIL
            ? PROTECTED_ADMIN_EMAIL
            : normalizedEmail,
      };
      if (editingUser) {
        await api.updateUser(editingUser.id, payload);
      } else {
        await api.createUser(payload);
      }
      await loadUsers();
      setOpenModal(false);
      setEditingUser(null);
      setError("");
    } catch (err) {
      setError(err.message || "Failed to save user.");
      console.error(err);
    }
  };

  const removeUser = async () => {
    if (!deletingUser) return;
    if (isAdminUser(deletingUser)) {
      setError("Admin user cannot be deleted.");
      setDeletingUser(null);
      return;
    }
    try {
      await api.deleteUser(deletingUser.id);
      await loadUsers();
    } catch (err) {
      setError(err.message || "Failed to remove user.");
      console.error(err);
    } finally {
      setDeletingUser(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}

      <Table
        columns={columns}
        data={users}
        renderRow={(user) => (
          <tr key={user.id} className="transition hover:bg-slate-50/80">
            <td className="px-4 py-3 text-sm font-medium text-slate-800">{user.name}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{user.email}</td>
            <td className="px-4 py-3 text-sm">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${roleClass[user.role] || roleClass.Member}`}
              >
                {user.role}
              </span>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEdit(user)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                >
                  <Pencil size={13} />
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => setDeletingUser(user)}
                  disabled={isAdminUser(user)}
                  className="inline-flex items-center gap-1 rounded-lg border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={13} />
                  Remove
                </button>
              </div>
            </td>
          </tr>
        )}
      />

      <Modal
        title={editingUser ? "Edit User" : "Add User"}
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingUser(null);
          setError("");
        }}
        footer={[
          <button
            key="cancel"
            onClick={() => {
              setOpenModal(false);
              setEditingUser(null);
              setError("");
            }}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>,
          <button
            key="save"
            onClick={saveUser}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-700"
          >
            {editingUser ? "Update" : "Create"}
          </button>,
        ]}
      >
        <div className="grid gap-3">
          <input
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            placeholder="Name"
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
          />
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            placeholder="Email"
            disabled={editingUser?.email?.toLowerCase() === PROTECTED_ADMIN_EMAIL}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
          />
          {editingUser?.email?.toLowerCase() === PROTECTED_ADMIN_EMAIL ? (
            <p className="text-xs text-slate-500">Protected admin email cannot be changed.</p>
          ) : null}
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            placeholder={editingUser ? "New password" : "Password"}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
          />
          <select
            value={form.role}
            onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none ring-teal-500 focus:ring"
          >
            <option value="Admin">Admin</option>
            <option value="Member">Member</option>
          </select>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={Boolean(deletingUser)}
        title="Remove User"
        message={deletingUser ? `Remove user "${deletingUser.name}"?` : ""}
        confirmLabel="Remove"
        onCancel={() => setDeletingUser(null)}
        onConfirm={removeUser}
      />
    </div>
  );
}
