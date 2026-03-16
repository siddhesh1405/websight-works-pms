import Modal from "./Modal";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  message,
  onCancel,
  onConfirm,
  confirmLabel = "Delete",
}) {
  return (
    <Modal
      title={title}
      isOpen={isOpen}
      onClose={onCancel}
      footer={[
        <button
          key="cancel"
          onClick={onCancel}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Cancel
        </button>,
        <button
          key="confirm"
          onClick={onConfirm}
          className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          {confirmLabel}
        </button>,
      ]}
    >
      <p className="text-sm text-slate-600">{message}</p>
    </Modal>
  );
}
