import { useState, useMemo } from 'react'
import { useAssessmentsList, useDeleteAssessment } from '../hooks/useAssessments'
import { CreateEditAssessmentModal } from '../components/CreateEditAssessmentModal'
import type { AssessmentDto } from '../../../api/assessments'

export default function AssessmentsPage() {
  const [status, setStatus] = useState('')
  const { data, isLoading, isError, error } = useAssessmentsList({ page: 1, pageSize: 20, status })
  const del = useDeleteAssessment()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<any | null>(null)

  // Sort by newest first (createdAt descending)
  const sortedItems: AssessmentDto[] = useMemo(() => {
    return (data?.items ?? []).slice().sort((a: AssessmentDto, b: AssessmentDto) => (b.createdAt ?? 0) - (a.createdAt ?? 0))
  }, [data?.items])

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-xl font-semibold">Assessments</h1>
      <div className="flex gap-3">
        <div>
          <label htmlFor="ass-status" className="block text-sm font-medium">Status</label>
          <select id="ass-status" className="mt-1 border rounded px-2 py-1" value={status} onChange={e => setStatus(e.target.value)}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>
      {isLoading && <div>Loading…</div>}
      {isError && <div className="text-red-600">Error: {(error as Error).message}</div>}
      <div className="flex justify-end">
        <button className="px-3 py-1 bg-indigo-600 text-white rounded" onClick={()=>{ setEditing(null); setOpen(true); }}>New Assessment</button>
      </div>
      <ul className="space-y-2">
        {sortedItems.map(a => (
          <li key={a.id} className="tf-card p-3">
            <div className="font-medium">Score: {a.score}</div>
            <div className="text-sm tf-muted">Job {a.jobId} · Candidate {a.candidateId} · {a.status}</div>
            <div className="mt-2 flex gap-2">
              <button className="tf-btn tf-btn--ghost" onClick={()=>{ setEditing(a); setOpen(true); }}>Edit</button>
              <button className="tf-btn tf-btn--danger" onClick={()=> del.mutate(a.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
      <CreateEditAssessmentModal open={open} onClose={()=>setOpen(false)} initial={editing} />
    </div>
  )
}


