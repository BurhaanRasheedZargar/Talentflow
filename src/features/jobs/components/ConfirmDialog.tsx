import { ReactNode } from 'react'

export function ConfirmDialog({ open, title, message, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onCancel }: { open: boolean; title: string; message?: ReactNode; confirmText?: string; cancelText?: string; onConfirm: () => void; onCancel: () => void }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-sm w-full p-4">
        <h3 className="text-base font-semibold mb-2">{title}</h3>
        {message && <div className="text-sm text-gray-600 mb-4">{message}</div>}
        <div className="flex justify-end gap-2">
          <button className="px-3 py-1 border rounded" onClick={onCancel}>{cancelText}</button>
          <button className="px-3 py-1 bg-rose-600 text-white rounded hover:bg-rose-700" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}


