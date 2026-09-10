import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface InputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  title: string;
  label: string;
  placeholder?: string;
  defaultValue?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'text' | 'number' | 'password';
  min?: number;
  max?: number;
}

export default function InputDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  label,
  placeholder,
  defaultValue = '',
  confirmText = 'OK',
  cancelText = 'Cancel',
  type = 'text',
  min,
  max,
}: InputDialogProps) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setValue(defaultValue);
    }
  }, [isOpen, defaultValue]);

  const handleConfirm = () => {
    if (value.trim()) {
      if (type === 'number') {
        const numValue = Number(value);
        if (isNaN(numValue)) {
          return;
        }
        if (min !== undefined && numValue < min) {
          return;
        }
        if (max !== undefined && numValue > max) {
          return;
        }
      }
      onConfirm(value);
      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

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

        <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>

        <div className="mb-6">
          <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
            {label}
          </label>
          <input
            type={type}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            min={min}
            max={max}
            className="premium-input w-full"
            autoComplete={type === 'password' ? 'current-password' : undefined}
            autoFocus
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="rounded-xl border border-[var(--border-visible)] bg-transparent px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:bg-[var(--btn-secondary-hover-bg)] hover:text-[var(--text-primary)]"
          >
            {cancelText}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!value.trim()}
            className="rounded-xl bg-[var(--brand-primary)] px-4 py-2 text-sm font-semibold text-[var(--text-on-accent)] hover:bg-[var(--brand-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

