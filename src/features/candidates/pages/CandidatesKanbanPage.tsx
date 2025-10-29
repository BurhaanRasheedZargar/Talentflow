import { useEffect, useMemo, useState, useCallback, memo } from 'react'
import { 
  DndContext, 
  closestCenter, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects,
  useDroppable
} from '@dnd-kit/core'
import type { DragEndEvent, DragStartEvent, DropAnimation } from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useCandidatesList, useUpdateCandidate } from '../hooks/useCandidates'

const STAGES: Array<{ id: string; label: string }> = [
  { id: 'applied', label: 'Applied' },
  { id: 'screen', label: 'Screen' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
]

const dropAnimationConfig: DropAnimation = {
  duration: 120, // Slightly faster drop animation
  easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)', // Smooth with slight bounce
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.4',
      },
    },
  }),
}

// Memoized sortable card component for better performance
const SortableCard = memo(({ c, columnColor, isDragging }: { c: any; columnColor: { header: string; badge: string; glow: string }; isDragging?: boolean }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ 
    id: `${c.stage}:${c.id}`,
    transition: {
      duration: 120, // Even faster transitions
      easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)', // Smooth with micro-bounce
    },
  })
  
  const _t = CSS.Transform.toString(transform)
  const style = {
    transform: _t ? `${_t} translateZ(0)` : undefined,
    transition,
    willChange: 'transform',
    transformOrigin: '50% 50% 0',
    WebkitTransform: CSS.Transform.toString(transform),
  } as React.CSSProperties

  return (
    <li 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      data-dnd-draggable
      className={`p-3 rounded-xl bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-slate-600/40 hover:border-indigo-400/60 hover:shadow-xl hover:shadow-indigo-500/20 transition-all duration-120 cursor-grab active:cursor-grabbing group backdrop-blur-sm ${isDragging ? 'opacity-40' : 'opacity-100'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors duration-200 truncate pr-2">{c.name}</div>
        <span className={`${columnColor.badge} w-2.5 h-2.5 rounded-full shadow-lg ${columnColor.glow} flex-shrink-0`}></span>
      </div>
      <div className="text-xs tf-muted truncate">{c.email}</div>
    </li>
  )
})

// Card for drag overlay
const DragOverlayCard = memo(({ c, columnColor }: { c: any; columnColor: { header: string; badge: string; glow: string } }) => {
  return (
    <div data-dnd-overlay className="p-3 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-indigo-400 shadow-2xl shadow-indigo-500/50 backdrop-blur-sm rotate-3 scale-105">
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm font-semibold text-indigo-300 truncate pr-2">{c.name}</div>
        <span className={`${columnColor.badge} w-2.5 h-2.5 rounded-full shadow-lg ${columnColor.glow} flex-shrink-0`}></span>
      </div>
      <div className="text-xs text-slate-300 truncate">{c.email}</div>
    </div>
  )
})

// Droppable column wrapper
const DroppableColumn = memo(({ id, children }: { id: string; children: React.ReactNode }) => {
  const { setNodeRef, isOver } = useDroppable({ id: `col:${id}` })
  
  return (
    <div 
      ref={setNodeRef}
      className={`h-[calc(100vh-280px)] overflow-y-auto p-3 custom-scrollbar transition-colors duration-150 ${isOver ? 'bg-indigo-900/10' : ''}`}
      style={{ contain: 'content' as any, WebkitOverflowScrolling: 'touch' as any }}
    >
      {children}
    </div>
  )
})

export default function CandidatesKanbanPage() {
  const { data, isLoading } = useCandidatesList({ page: 1, pageSize: 1000 })
  const update = useUpdateCandidate()
  const [activeId, setActiveId] = useState<string | null>(null)
  
  // Memoize columns computation for performance
  const { columns, itemIdsMap } = useMemo(() => {
    const col: Record<string, any[]> = {}
    STAGES.forEach(s => col[s.id] = [])
    ;(data?.items ?? []).forEach(c => { (col[c.stage] ||= []).push(c) })
    // Newest first per stage; ensures newly created appear at the top
    Object.keys(col).forEach(stageId => {
      col[stageId] = col[stageId].slice().sort((a, b) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0))
    })
    const itemIdsMap: Record<string, string[]> = {}
    Object.keys(col).forEach(stageId => {
      itemIdsMap[stageId] = col[stageId].map(c => `${stageId}:${c.id}`)
    })
    return { columns: col, itemIdsMap }
  }, [data])

  // Get active candidate being dragged
  const activeCandidate = useMemo(() => {
    if (!activeId) return null
    const [stage, id] = activeId.split(':')
    return columns[stage]?.find(c => c.id === Number(id)) || null
  }, [activeId, columns])

  // Use sensors for ultra-responsive drag performance
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 2, // Ultra responsive - minimal movement needed
        delay: 50, // Very short delay
        tolerance: 3,
      },
    })
  )

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(e.active.id as string)
  }, [])

  // Optimized drag handler with useCallback
  const handleDragEnd = useCallback((e: DragEndEvent) => {
    const draggedId = e.active?.id as any
    const overId = (e.over?.id as string) || ''
    
    setActiveId(null)
    
    if (!draggedId || !overId) return
    
    const [fromStage, cid] = String(draggedId).split(':')
    
    // Determine target stage - can be dropped on column or another card
    let toStage = fromStage
    if (overId.startsWith('col:')) {
      toStage = overId.slice(4)
    } else if (overId.includes(':')) {
      toStage = String(overId).split(':')[0]
    }
    
    if (!cid || fromStage === toStage) return
    
    const candId = Number(cid)
    
    // Optimistic update - update happens immediately for smooth UX
    update.mutate({ id: candId, input: { stage: toStage } })
  }, [update])

  const handleDragCancel = useCallback(() => {
    setActiveId(null)
  }, [])

  const columnColors: Record<string, { header: string; badge: string; glow: string }> = {
    applied: { header: 'bg-gradient-to-br from-slate-600 to-slate-700', badge: 'bg-slate-500', glow: 'shadow-slate-500/20' },
    screen: { header: 'bg-gradient-to-br from-orange-500 to-orange-600', badge: 'bg-orange-400', glow: 'shadow-orange-500/30' },
    interview: { header: 'bg-gradient-to-br from-blue-500 to-blue-600', badge: 'bg-blue-400', glow: 'shadow-blue-500/30' },
    offer: { header: 'bg-gradient-to-br from-pink-500 to-pink-600', badge: 'bg-pink-400', glow: 'shadow-pink-500/30' },
    hired: { header: 'bg-gradient-to-br from-green-500 to-green-600', badge: 'bg-green-400', glow: 'shadow-green-500/30' },
    rejected: { header: 'bg-gradient-to-br from-red-500 to-red-600', badge: 'bg-red-400', glow: 'shadow-red-500/30' },
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4"></div>
          <p className="tf-muted">Loading candidates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tf-title">Candidate Pipeline</h1>
          <p className="text-sm tf-muted mt-1">Drag and drop candidates to move them between stages</p>
        </div>
        <div className="text-sm tf-muted">
          {data?.total || 0} total candidates
        </div>
      </div>
      
      <div className="overflow-x-auto pb-4 -mx-6 px-6">
        <DndContext 
          sensors={sensors} 
          collisionDetection={closestCenter} 
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
        >
          <div className="grid grid-cols-6 gap-3 min-w-max">
            {STAGES.map(s => {
              const stageItems = columns[s.id] || []
              const itemIds = stageItems.map(c => `${s.id}:${c.id}`)
              
              return (
                <div key={s.id} className="flex flex-col w-64 flex-shrink-0">
                  <div className={`${columnColors[s.id]?.header || 'bg-gray-700'} text-white px-4 py-3 rounded-t-2xl font-semibold text-sm shadow-xl ${columnColors[s.id]?.glow} flex items-center justify-between`}>
                    <span>{s.label}</span>
                    <span className="bg-white/20 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs font-bold border border-white/10">
                      {stageItems.length}
                    </span>
                  </div>
                  <div className="tf-card rounded-t-none flex-1 border-t-0 overflow-hidden">
                    <DroppableColumn id={s.id}>
                      <SortableContext items={itemIdsMap[s.id] || []} strategy={verticalListSortingStrategy}>
                        <div className="space-y-2.5 min-h-full">
                          {stageItems.map(c => (
                            <SortableCard 
                              key={c.id} 
                              c={c} 
                              columnColor={columnColors[s.id]}
                              isDragging={activeId === `${s.id}:${c.id}`}
                            />
                          ))}
                          {stageItems.length === 0 && (
                            <div className="text-center py-12 tf-muted text-xs">
                              Drop candidates here
                            </div>
                          )}
                        </div>
                      </SortableContext>
                    </DroppableColumn>
                  </div>
                </div>
              )
            })}
          </div>
          <DragOverlay dropAnimation={dropAnimationConfig}>
            {activeCandidate && activeId ? (
              <DragOverlayCard 
                c={activeCandidate} 
                columnColor={columnColors[activeId.split(':')[0]] || columnColors.applied} 
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}


