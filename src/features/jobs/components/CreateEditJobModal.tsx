import { useState, useEffect } from 'react'
import type { Job } from '../../../db/types'
import { useCreateJob, useUpdateJob } from '../hooks/useJobs'
import { useLocationOptions } from '../hooks/useLocations'

export function CreateEditJobModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: Job | null }) {
  const isEdit = Boolean(initial?.id)
  const [title, setTitle] = useState(initial?.title ?? '')
  const [department, setDepartment] = useState(initial?.department ?? '')
  const [location, setLocation] = useState(initial?.location ?? 'Remote')
  const [status, setStatus] = useState<Job['status']>(initial?.status ?? 'open')
  const [tags, setTags] = useState<string>((initial?.tags ?? []).join(', '))
  const [description, setDescription] = useState<string>(initial?.description ?? '')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setTitle(initial?.title ?? '')
    setDepartment(initial?.department ?? '')
    setLocation(initial?.location ?? 'Remote')
    setStatus(initial?.status ?? 'open')
    setTags((initial?.tags ?? []).join(', '))
    setDescription(initial?.description ?? '')
    setError(null)
  }, [initial, open])

  const create = useCreateJob()
  const update = useUpdateJob()
  const { data: locationOptions, isLoading: locLoading, isError: locError } = useLocationOptions()

  function validate(): string | null {
    if (!title.trim()) return 'Title is required'
    return null
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const v = validate()
    if (v) return setError(v)
    const input = {
      title: title.trim(),
      department: department.trim(),
      location: location.trim(),
      status,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      description: description.trim(),
    }
    try {
      if (isEdit) {
        await update.mutateAsync({ id: initial!.id as number, input })
      } else {
        await create.mutateAsync(input)
      }
      onClose()
    } catch (err: any) {
      setError(err?.message || 'Failed to save')
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
      <div className="tf-card max-w-lg w-full p-6 animate-slideUp">
        <h2 className="text-xl font-bold mb-4 tf-title">{isEdit ? 'Edit Job' : 'Create Job'}</h2>
        {error && <div className="mb-3 px-3 py-2 bg-red-900/30 border border-red-700/50 text-red-400 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="job-title" className="block text-sm font-semibold text-slate-200 mb-2">Title *</label>
            <input 
              id="job-title" 
              type="text"
              placeholder="Senior Frontend Engineer" 
              className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all" 
              value={title} 
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="job-dept" className="block text-sm font-semibold text-slate-200 mb-2">Department</label>
              <input 
                id="job-dept" 
                type="text"
                placeholder="Engineering" 
                className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all" 
                value={department} 
                onChange={e => setDepartment(e.target.value)} 
              />
            </div>
            <div>
              <label htmlFor="job-location" className="block text-sm font-semibold text-slate-200 mb-2">Location</label>
              <select 
                id="job-location" 
                className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all" 
                value={location} 
                onChange={e => setLocation(e.target.value)}
              >
                <option value="">{locLoading ? 'Loading…' : (locError ? 'Failed to load' : 'Select a location')}</option>
                <option value="Remote">Remote</option>
                {(locationOptions ?? []).map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="job-description" className="block text-sm font-semibold text-slate-200 mb-2">Description</label>
            <textarea 
              id="job-description" 
              placeholder="Describe the role, responsibilities, and requirements" 
              className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all resize-none" 
              rows={4}
              value={description} 
              onChange={e => setDescription(e.target.value)} 
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="job-status" className="block text-sm font-semibold text-slate-200 mb-2">Status</label>
              <select 
                id="job-status" 
                className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all" 
                value={status} 
                onChange={e => setStatus(e.target.value as Job['status'])}
              >
                <option value="open">Open</option>
                <option value="paused">Paused</option>
                <option value="closed">Closed</option>
              </select>
            </div>
            <div>
              <label htmlFor="job-tags" className="block text-sm font-semibold text-slate-200 mb-2">Tags</label>
              <input 
                id="job-tags" 
                type="text"
                placeholder="frontend, react, typescript" 
                className="w-full bg-slate-700/50 border-2 border-slate-600 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-400/20 transition-all" 
                value={tags} 
                onChange={e => setTags(e.target.value)} 
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end pt-4">
            <button type="button" onClick={onClose} className="tf-btn tf-btn--ghost">Cancel</button>
            <button type="submit" className="tf-btn tf-btn--primary" disabled={create.isPending || update.isPending}>
              {create.isPending || update.isPending ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Job')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}


