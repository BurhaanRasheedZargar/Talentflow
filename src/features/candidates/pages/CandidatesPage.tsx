import { useRef, useState } from 'react'
import { useCandidatesList, useDeleteCandidate } from '../hooks/useCandidates'
import { CreateEditCandidateModal } from '../components/CreateEditCandidateModal'
import { useState as useReactState } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { Link } from 'react-router-dom'

export default function CandidatesPage() {
  const [search, setSearch] = useState('')
  const [stage, setStage] = useState('')
  const { data, isLoading, isError, error } = useCandidatesList({ page: 1, pageSize: 20, search, stage })
  const del = useDeleteCandidate()
  const [open, setOpen] = useReactState(false)
  const [editing, setEditing] = useReactState<any | null>(null)

  const parentRef = useRef<HTMLDivElement | null>(null)
  const rowVirtualizer = useVirtualizer({
    count: data?.items.length ?? 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80,
    overscan: 10,
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tf-title">Candidates</h1>
          <p className="text-sm tf-muted mt-1">Manage your talent pipeline</p>
        </div>
        <div className="flex gap-3">
          <Link to="/candidates/kanban" className="tf-btn tf-btn--accent">
            📊 Kanban View
          </Link>
          <button className="tf-btn tf-btn--primary" onClick={()=>{ setEditing(null); setOpen(true); }}>
            <span className="mr-2">+</span> New Candidate
          </button>
        </div>
      </div>

      <div className="tf-card p-4 flex gap-4">
        <div className="flex-1">
          <label htmlFor="cand-search" className="block text-sm font-semibold tf-muted mb-2">Search</label>
          <input 
            id="cand-search" 
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-400 transition-all" 
            placeholder="Search by name or email..." 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>
        <div className="w-56">
          <label htmlFor="cand-stage" className="block text-sm font-semibold tf-muted mb-2">Filter by Stage</label>
          <select 
            id="cand-stage" 
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:border-indigo-400 transition-all" 
            value={stage} 
            onChange={e => setStage(e.target.value)}
          >
            <option value="">All Stages</option>
            <option value="applied">Applied</option>
            <option value="screen">Screen</option>
            <option value="interview">Interview</option>
            <option value="offer">Offer</option>
            <option value="rejected">Rejected</option>
            <option value="hired">Hired</option>
          </select>
        </div>
      </div>

      {isLoading && <div className="text-center py-12 tf-muted">Loading candidates...</div>}
      {isError && <div className="tf-card p-4 bg-red-900/30 border-red-700/50 text-red-400">Error: {(error as Error).message}</div>}
      
      <div ref={parentRef} className="tf-card overflow-hidden" style={{ height: 600, overflow: 'auto' }}>
        <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
          {rowVirtualizer.getVirtualItems().map(vi => {
            const c = data!.items[vi.index]
            const stageColors: Record<string, string> = {
              applied: 'bg-slate-700/50 text-slate-300 border border-slate-600',
              screen: 'bg-orange-900/40 text-orange-300 border border-orange-700',
              interview: 'bg-blue-900/40 text-blue-300 border border-blue-700',
              offer: 'bg-pink-900/40 text-pink-300 border border-pink-700',
              hired: 'bg-green-900/40 text-green-300 border border-green-700',
              rejected: 'bg-red-900/40 text-red-300 border border-red-700',
            }
            return (
              <div 
                key={c.id} 
                className="absolute left-0 right-0 px-4 py-2 border-b border-slate-700/30 hover:bg-gradient-to-r hover:from-indigo-900/20 hover:to-pink-900/20 transition-all duration-500 group" 
                style={{ top: vi.start, height: vi.size }}
              >
                <div className="flex items-center justify-between h-full">
                  <div className="flex-1">
                    <div className="font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors duration-400">{c.name}</div>
                    <div className="text-sm tf-muted">{c.email}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stageColors[c.stage] || 'bg-slate-700/50'}`}>
                      {c.stage}
                    </span>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-400">
                      <button className="tf-btn tf-btn--ghost text-sm py-1" onClick={()=>{ setEditing(c); setOpen(true); }}>Edit</button>
                      <button className="tf-btn tf-btn--danger text-sm py-1" onClick={()=> del.mutate(c.id)}>Delete</button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <CreateEditCandidateModal open={open} onClose={()=>setOpen(false)} initial={editing} />
    </div>
  )
}


