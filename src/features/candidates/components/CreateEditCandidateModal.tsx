import { useEffect, useState } from 'react'
import { useCreateCandidate, useUpdateCandidate } from '../hooks/useCandidates'

export function CreateEditCandidateModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: any | null }) {
  const isEdit = Boolean(initial?.id)
  const [name, setName] = useState(initial?.name ?? '')
  const [email, setEmail] = useState(initial?.email ?? '')
  const [stage, setStage] = useState(initial?.stage ?? 'applied')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setName(initial?.name ?? '')
    setEmail(initial?.email ?? '')
    setStage(initial?.stage ?? 'applied')
    setError(null)
  }, [initial, open])

  const create = useCreateCandidate()
  const update = useUpdateCandidate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return setError('Name and email are required')
    try {
      if (isEdit) await update.mutateAsync({ id: initial!.id, input: { name: name.trim(), email: email.trim(), stage } })
      else await create.mutateAsync({ name: name.trim(), email: email.trim(), stage })
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to save')
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="tf-card max-w-md w-full p-6 animate-slideUp">
        <h2 className="text-xl font-bold mb-4 tf-title">{isEdit ? 'Edit Candidate' : 'New Candidate'}</h2>
        {error && <div className="mb-3 px-3 py-2 bg-red-900/30 border border-red-700/50 text-red-400 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="cand-name" className="block text-sm font-semibold text-slate-200 mb-2">Full Name *</label>
            <input 
              id="cand-name" 
              type="text"
              placeholder="John Doe" 
              className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all" 
              value={name} 
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div>
            <label htmlFor="cand-email" className="block text-sm font-semibold text-slate-200 mb-2">Email Address *</label>
            <input 
              id="cand-email" 
              type="email"
              placeholder="john.doe@example.com" 
              className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <label htmlFor="cand-stage" className="block text-sm font-semibold text-slate-200 mb-2">Current Stage</label>
            <select 
              id="cand-stage" 
              className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all" 
              value={stage} 
              onChange={e => setStage(e.target.value)}
            >
              <option value="applied">Applied</option>
              <option value="screen">Screen</option>
              <option value="interview">Interview</option>
              <option value="offer">Offer</option>
              <option value="rejected">Rejected</option>
              <option value="hired">Hired</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={onClose} className="tf-btn tf-btn--ghost">Cancel</button>
            <button type="submit" className="tf-btn tf-btn--primary" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Saving...' : (isEdit ? 'Save Changes' : 'Add Candidate')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


