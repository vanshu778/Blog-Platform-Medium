import { useEffect, useRef } from 'react'

export default function ConfirmModal({
  open,
  title = 'Are you sure?',
  message = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) {
  const cancelRef = useRef(null)

  // Focus the cancel button when modal opens & trap Escape key
  useEffect(() => {
    if (!open) return
    cancelRef.current?.focus()
    const handleKey = (e) => {
      if (e.key === 'Escape') onCancel()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-none" />

      {/* Modal card */}
      <div
        className="relative z-10 bg-surface rounded-xl shadow-xl border border-border w-full max-w-sm mx-4 p-6 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-serif text-lg font-semibold text-ink mb-2">
          {title}
        </h3>
        <p className="text-sm text-ink-muted leading-relaxed mb-6">
          {message}
        </p>

        <div className="flex items-center justify-end gap-3">
          <button
            ref={cancelRef}
            onClick={onCancel}
            className="text-sm font-medium text-ink-light border border-border px-4 py-2 rounded-full hover:bg-surface-alt transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="text-sm font-medium text-white bg-danger px-4 py-2 rounded-full hover:bg-red-700 transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
