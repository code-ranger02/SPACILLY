import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info' | 'success';
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      icon: AlertTriangle,
      iconColor: 'text-red-600',
      iconBg: 'bg-red-100 dark:bg-red-900/20',
      confirmBg: 'bg-red-600 hover:bg-red-700',
      confirmText: 'text-white',
    },
    warning: {
      icon: AlertTriangle,
      iconColor: 'text-amber-600',
      iconBg: 'bg-amber-100 dark:bg-amber-900/20',
      confirmBg: 'bg-amber-600 hover:bg-amber-700',
      confirmText: 'text-white',
    },
    info: {
      icon: Info,
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-100 dark:bg-blue-900/20',
      confirmBg: 'bg-blue-600 hover:bg-blue-700',
      confirmText: 'text-white',
    },
    success: {
      icon: CheckCircle,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-100 dark:bg-emerald-900/20',
      confirmBg: 'bg-emerald-600 hover:bg-emerald-700',
      confirmText: 'text-white',
    },
  };

  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--bg-overlay)] px-4 py-6"
      data-sp-overlay="backdrop"
      onClick={onClose}
    >
      <div
        className="sp-overlay-surface relative w-full max-w-md rounded-2xl border p-6"
        data-sp-overlay="dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-start gap-4">
          <div className={`flex h-12 w-12 items-center justify-center rounded-full ${styles.iconBg}`}>
            <Icon className={`h-6 w-6 ${styles.iconColor}`} />
          </div>
          <div className="flex-1">
            <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">{message}</p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--border-visible)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--btn-secondary-hover-bg)] hover:text-[var(--text-primary)]"
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`rounded-xl px-4 py-2 text-sm font-semibold ${
              variant === 'danger'
                ? 'bg-[var(--sp-error)] text-white hover:opacity-90'
                : 'bg-[var(--brand-primary)] text-[var(--text-on-accent)] hover:bg-[var(--brand-primary-hover)]'
            } transition-colors`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

