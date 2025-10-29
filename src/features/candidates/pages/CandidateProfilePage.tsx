import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { addCandidateNote, fetchCandidateById, fetchCandidateTimeline } from '../../../api/candidates'
import { renderMentions } from '../../../utils/mentions'

export default function CandidateProfilePage() {
  const { id } = useParams()
  const candidateId = Number(id)
  const [candidate, setCandidate] = useState<any>(null)
  const [timeline, setTimeline] = useState<any[]>([])
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    try {
      setLoading(true)
      const [c, t] = await Promise.all([fetchCandidateById(candidateId), fetchCandidateTimeline(candidateId)])
      setCandidate(c)
      setTimeline(t.items)
    } catch (e: any) {
      setError(e?.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (Number.isFinite(candidateId)) load() }, [candidateId])

  async function addNote() {
    if (!note.trim()) return
    await addCandidateNote(candidateId, note.trim())
    
    // Check for @mentions and send notifications
    const mentionRegex = /@(\w+)/g
    const mentions = Array.from(note.matchAll(mentionRegex), m => m[1])
    if (mentions.length > 0) {
      const { notifyMention } = await import('../../../utils/notifications')
      for (const username of mentions) {
        await notifyMention(`${username}@talentflow.com`, 'System', note.trim())
      }
    }
    
    setNote('')
    load()
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (error) return <div className="p-6 text-red-600">{error}</div>
  if (!candidate) return <div className="p-6">Not found</div>

  return (
    <div className="p-6 space-y-4">
      <div className="tf-card p-4">
        <div className="text-lg font-semibold">{candidate.name}</div>
        <div className="tf-muted">{candidate.email} · {candidate.stage}</div>
      </div>

      <div className="tf-card p-4">
        <div className="font-semibold mb-2">Timeline</div>
        <ul className="space-y-2">
          {timeline.map((e) => (
            <li key={e.id} className="border-b border-gray-100 pb-2">
              <div className="text-sm">{renderMentions(e.message)}</div>
              <div className="text-xs tf-muted">{new Date(e.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
        <div className="mt-3 flex gap-2">
          <input className="border rounded px-2 py-1 flex-1" placeholder="Add a note with @mentions" value={note} onChange={e=>setNote(e.target.value)} />
          <button className="tf-btn tf-btn--accent" onClick={addNote}>Add</button>
        </div>
      </div>
    </div>
  )
}


