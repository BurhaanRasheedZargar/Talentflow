import { useEffect, useState } from 'react'
import { useCreateAssessment, useUpdateAssessment } from '../hooks/useAssessments'

export function CreateEditAssessmentModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: any | null }) {
  const isEdit = Boolean(initial?.id)
  const [score, setScore] = useState<number>(initial?.score ?? 0)
  const [status, setStatus] = useState<string>(initial?.status ?? 'pending')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setScore(initial?.score ?? 0)
    setStatus(initial?.status ?? 'pending')
    setError(null)
  }, [initial, open])

  const create = useCreateAssessment()
  const update = useUpdateAssessment()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    try {
      if (isEdit) await update.mutateAsync({ id: initial!.id, input: { score, status } })
      else await create.mutateAsync({ candidateId: initial?.candidateId, jobId: initial?.jobId, score, status })
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to save')
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="tf-card max-w-md w-full p-6 animate-slideUp">
        <h2 className="text-xl font-bold mb-4 tf-title">{isEdit ? 'Edit Assessment' : 'New Assessment'}</h2>
        {error && <div className="mb-3 px-3 py-2 bg-red-900/30 border border-red-700/50 text-red-400 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="ass-score" className="block text-sm font-semibold text-slate-200 mb-2">Score (0-100)</label>
            <input 
              id="ass-score" 
              type="number" 
              min={0} 
              max={100} 
              placeholder="85"
              className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all" 
              value={score} 
              onChange={e => setScore(Number(e.target.value))}
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="ass-status" className="block text-sm font-semibold text-slate-200 mb-2">Status</label>
            <select 
              id="ass-status" 
              className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all" 
              value={status} 
              onChange={e => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={onClose} className="tf-btn tf-btn--ghost">Cancel</button>
            <button type="submit" className="tf-btn tf-btn--primary" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Assessment')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


