import { AlertTriangle } from 'lucide-react';
import Modal from './Modal.jsx';

export default function ConfirmDialog({ open, title, message, confirmLabel, onConfirm, onCancel }) {
  return (
    <Modal open={open} role="alertdialog" labelledBy="confirm-title" describedBy="confirm-text" onClose={onCancel}>
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/15 text-rose-400">
        <AlertTriangle size={26} aria-hidden="true" />
      </span>
      <h2 id="confirm-title" className="mt-4 text-xl font-bold">
        {title}
      </h2>
      <p id="confirm-text" className="mt-1.5 text-sm text-muted">
        {message}
      </p>
      <div className="mt-6 grid grid-cols-2 gap-3">
        <button type="button" className="btn" onClick={onCancel} data-autofocus>
          Cancel
        </button>
        <button type="button" className="btn-danger" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
