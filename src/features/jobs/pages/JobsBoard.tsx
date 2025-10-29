import { useMemo, useState, memo, useCallback } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useArchiveJob, useJobsList, useReorderJob, useUnarchiveJob, useDeleteJob, useArchivedJobsList } from '../hooks/useJobs'
import { useToast } from '../../../providers/ToastProvider'
import { ConfirmDialog } from '../components/ConfirmDialog'
import type { Job } from '../../../db/types'
import { CreateEditJobModal } from '../components/CreateEditJobModal'
import { ExportImportButtons } from '../../../components/ExportImportButtons'

const JobRow = memo(({ job, onEdit, onArchiveToggle, onDelete, selected, onSelectedChange }: { job: Job; onEdit: (j: Job) => void; onArchiveToggle: (j: Job) => void; onDelete: (j: Job) => void; selected: boolean; onSelectedChange: (checked: boolean) => void }) => {
  const [expanded, setExpanded] = useState(false)
  return (
    <li className="tf-card p-4 transition flex items-center justify-between" data-id={job.id}>
      <div className="flex items-start gap-3">
        <input aria-label="Select job" type="checkbox" className="mt-1" checked={selected} onChange={e=>onSelectedChange(e.target.checked)} />
        <div>
          <div className="font-semibold tf-title text-[18px]">{job.title}</div>
          <div className="text-sm tf-muted">{job.department} · {job.location} · {job.status} {job.archived && <span className="tf-badge tf-badge--archived ml-2">Archived</span>}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {(job.tags ?? []).map(t => <span key={t} className="tf-pill">{t}</span>)}
          </div>
          {expanded && job.description && (
            <div className="mt-3 text-sm text-gray-700 whitespace-pre-wrap">{job.description}</div>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setExpanded(e=>!e)} className="tf-btn tf-btn--ghost hover:bg-gray-50">{expanded ? 'Hide' : 'Details'}</button>
        <button onClick={() => onEdit(job)} className="tf-btn tf-btn--ghost hover:bg-gray-50">Edit</button>
        <button onClick={() => onArchiveToggle(job)} className="tf-btn tf-btn--ghost hover:bg-gray-50">{job.archived ? 'Unarchive' : 'Archive'}</button>
        <button onClick={() => onDelete(job)} className="tf-btn tf-btn--danger">Delete</button>
      </div>
    </li>
  )
})

export default function JobsBoard() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)
  const [tag, setTag] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Job | null>(null)
  const [showArchived, setShowArchived] = useState(false)

  const { data, isLoading, isError, error } = useJobsList({ page, pageSize, search, status, tag: tag || undefined })
  const archivedList = useArchivedJobsList({ page, pageSize, search, tag: tag || undefined })
  const reorder = useReorderJob()
  const archive = useArchiveJob()
  const unarchive = useUnarchiveJob()
  const del = useDeleteJob()
  const { notify } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingDelete, setPendingDelete] = useState<Job | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  const activeItems = useMemo(() => (data?.items ?? []).slice().sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)), [data])
  const archivedItems = useMemo(() => (archivedList.data?.items ?? []).slice().sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)), [archivedList.data])

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 2, // Ultra responsive
        delay: 50, // Minimal delay
        tolerance: 3,
      } 
    })
  )

  // Memoized handlers to prevent unnecessary re-renders
  const handleEdit = useCallback((job: Job) => {
    setEditing(job)
    setOpen(true)
  }, [])

  const handleDelete = useCallback((job: Job) => {
    setPendingDelete(job)
    setConfirmOpen(true)
  }, [])

  const handleArchiveToggle = useCallback((job: Job) => {
    if (job.archived) {
      unarchive.mutate(job.id as number, {
        onSuccess: () => notify({ type: 'success', message: 'Unarchived' }),
        onError: (e: any) => notify({ type: 'error', message: e.message || 'Failed' })
      })
    } else {
      archive.mutate(job.id as number, {
        onSuccess: () => notify({ type: 'success', message: 'Archived' }),
        onError: (e: any) => notify({ type: 'error', message: e.message || 'Failed' })
      })
    }
  }, [archive, unarchive, notify])

  const handleSelectedChange = useCallback((jobId: number, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (checked) next.add(jobId)
      else next.delete(jobId)
      return next
    })
  }, [])

  function getIndex(id: number) {
    return activeItems.findIndex(i => i.id === id)
  }

  const ids = activeItems.map(i => i.id as number)

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = getIndex(active.id as number)
    const newIndex = getIndex(over.id as number)
    const newOrderArray = arrayMove(activeItems, oldIndex, newIndex)
    // compute incremental order numbers (0..n)
    for (let i = 0; i < newOrderArray.length; i++) {
      const j = newOrderArray[i]
      if ((j.order ?? i) !== i) {
        reorder.mutate({ id: j.id as number, order: i })
      }
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-end gap-3">
        <div>
          <label htmlFor="job-search" className="block text-sm font-medium">Search</label>
          <input id="job-search" title="Search jobs" placeholder="Search by title" value={search} onChange={e => setSearch(e.target.value)} className="mt-1 border rounded px-2 py-1" />
        </div>
        <div>
          <label htmlFor="job-tag-filter" className="block text-sm font-medium">Tag</label>
          <input id="job-tag-filter" title="Filter by tag" placeholder="e.g., frontend" value={tag} onChange={e => { setTag(e.target.value); setPage(1); }} className="mt-1 border rounded px-2 py-1" />
        </div>
        <div>
          <label htmlFor="job-status-filter" className="block text-sm font-medium">Status</label>
          <select id="job-status-filter" title="Filter by status" value={status} onChange={e => setStatus(e.target.value)} className="mt-1 border rounded px-2 py-1">
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="paused">Paused</option>
            <option value="closed">Closed</option>
          </select>
        </div>
        <div>
          <label htmlFor="page-size" className="block text-sm font-medium">Page size</label>
          <select id="page-size" className="mt-1 border rounded px-2 py-1" value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
          </select>
        </div>
        <div className="ml-auto flex items-end gap-3">
          <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={showArchived} onChange={e => setShowArchived(e.target.checked)} /> Show archived</label>
          <ExportImportButtons type="jobs" />
          <button onClick={() => { setEditing(null); setOpen(true) }} className="px-3 py-1 bg-indigo-600 text-white rounded">New Job</button>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="flex items-center gap-3">
        <label className="text-sm flex items-center gap-2"><input type="checkbox" aria-label="Select all" checked={(!showArchived ? activeItems : archivedItems).length>0 && (!showArchived ? activeItems : archivedItems).every(j => selectedIds.has(j.id as number))} onChange={e => {
          const next = new Set<number>()
          if (e.target.checked) {
            for (const j of (!showArchived ? activeItems : archivedItems)) next.add(j.id as number)
          }
          setSelectedIds(next)
        }} /> Select all</label>
        <div className="ml-auto flex gap-2">
          <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={selectedIds.size===0 || showArchived} onClick={async ()=>{
            const ids = Array.from(selectedIds)
            await Promise.all(ids.map(id => archive.mutateAsync(id).catch(()=>null)))
            notify({ type:'success', message:'Archived selected' });
            setSelectedIds(new Set())
          }}>Archive</button>
          <button className="px-3 py-1 border rounded disabled:opacity-50" disabled={selectedIds.size===0 || !showArchived} onClick={async ()=>{
            const ids = Array.from(selectedIds)
            await Promise.all(ids.map(id => unarchive.mutateAsync(id).catch(()=>null)))
            notify({ type:'success', message:'Unarchived selected' });
            setSelectedIds(new Set())
          }}>Unarchive</button>
          <button className="px-3 py-1 bg-rose-600 text-white rounded disabled:opacity-50" disabled={selectedIds.size===0} onClick={()=>{ setPendingDelete({ id: -1, title: `${selectedIds.size} jobs`, department:'', location:'', status:'open', createdAt: 0, titleLowercase:'', slug:'', archived:false, order:0 } as any); setConfirmOpen(true); }}>Delete</button>
        </div>
      </div>

      {isLoading && !showArchived && <div>Loading…</div>}
      {archivedList.isLoading && showArchived && <div>Loading archived…</div>}
      {isError && <div className="text-red-600">Error: {(error as Error).message}</div>}

      {!showArchived ? (
        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ul className="space-y-2">
              {activeItems.map(j => (
                <JobRow 
                  key={j.id} 
                  job={j} 
                  selected={selectedIds.has(j.id as number)} 
                  onSelectedChange={(checked) => handleSelectedChange(j.id as number, checked)}
                  onEdit={handleEdit}
                  onArchiveToggle={handleArchiveToggle}
                  onDelete={handleDelete}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      ) : (
        <ul className="space-y-2">
          {archivedItems.map(j => (
            <JobRow 
              key={j.id} 
              job={j} 
              selected={selectedIds.has(j.id as number)} 
              onSelectedChange={(checked) => handleSelectedChange(j.id as number, checked)}
              onEdit={handleEdit}
              onArchiveToggle={handleArchiveToggle}
              onDelete={handleDelete}
            />
          ))}
        </ul>
      )}

      <div className="flex items-center justify-between pt-4">
        <div className="text-sm text-gray-600">Page {showArchived ? archivedList.data?.page : data?.page} / {showArchived ? archivedList.data?.totalPages : data?.totalPages} — {showArchived ? archivedList.data?.total : data?.total} total</div>
        <div className="flex gap-2">
          <button className="px-3 py-1 border rounded" disabled={(showArchived ? archivedList.data?.page : data?.page) === 1} onClick={() => setPage(p => Math.max(1, p-1))}>Prev</button>
          <button className="px-3 py-1 border rounded" disabled={(showArchived ? archivedList.data?.page : data?.page) === (showArchived ? archivedList.data?.totalPages : data?.totalPages)} onClick={() => setPage(p => p+1)}>Next</button>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Delete job"
        message={pendingDelete ? (pendingDelete.id === -1 ? `Are you sure you want to delete ${selectedIds.size} selected job(s)? This action cannot be undone.` : `Are you sure you want to delete “${pendingDelete.title}”? This action cannot be undone.`) : ''}
        confirmText="Delete"
        onCancel={() => { setConfirmOpen(false); setPendingDelete(null); }}
        onConfirm={() => {
          if (!pendingDelete) return;
          if (pendingDelete.id === -1) {
            const ids = Array.from(selectedIds)
            Promise.all(ids.map(id => del.mutateAsync(id).catch(()=>null))).then(()=>{
              notify({ type: 'success', message: 'Deleted selected' })
              setSelectedIds(new Set())
              setConfirmOpen(false); setPendingDelete(null)
            }).catch((e:any)=>{
              notify({ type: 'error', message: e?.message || 'Failed some deletions' })
              setConfirmOpen(false); setPendingDelete(null)
            })
          } else {
            del.mutate(pendingDelete.id as number, {
              onSuccess: () => notify({ type: 'success', message: 'Deleted' }),
              onError: (e: any) => notify({ type: 'error', message: e.message || 'Failed' }),
              onSettled: () => { setConfirmOpen(false); setPendingDelete(null); },
            })
          }
        }}
      />

      <CreateEditJobModal open={open} onClose={() => setOpen(false)} initial={editing} />
    </div>
  )
}


