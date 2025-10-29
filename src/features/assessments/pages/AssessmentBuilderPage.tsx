import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getAssessmentBuilder, putAssessmentBuilder, submitAssessment } from '../../../api/assessments'

type Question = {
  id: string
  type: 'single'|'multi'|'short'|'long'|'number'|'file'
  label: string
  required?: boolean
  options?: string[]
  min?: number
  max?: number
  showIf?: { questionId: string; equals: string }
}

export default function AssessmentBuilderPage() {
  const { jobId } = useParams()
  const jid = Number(jobId)
  const [builder, setBuilder] = useState<{ sections: Array<{ title: string; questions: Question[] }> }>({ sections: [] })
  const [loading, setLoading] = useState(true)
  const [err, setErr] = useState<string|undefined>()

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        setLoading(true)
        const data = await getAssessmentBuilder(jid)
        if (mounted) setBuilder({ sections: data?.sections ?? [] })
      } catch (e:any) { setErr(e?.message || 'Failed to load') } finally { setLoading(false) }
    })()
    return () => { mounted = false }
  }, [jid])

  function addSection() {
    setBuilder(b => ({ sections: [...b.sections, { title: `Section ${b.sections.length+1}`, questions: [] }] }))
  }
  function addQuestion(si: number) {
    setBuilder(b => {
      const sections = [...b.sections]
      const qs = [...sections[si].questions]
      qs.push({ id: crypto.randomUUID(), type: 'short', label: 'New question' })
      sections[si] = { ...sections[si], questions: qs }
      return { sections }
    })
  }
  function updateQuestion(si: number, qi: number, patch: Partial<Question>) {
    setBuilder(b => {
      const sections = [...b.sections]
      const qs = [...sections[si].questions]
      qs[qi] = { ...qs[qi], ...patch }
      sections[si] = { ...sections[si], questions: qs }
      return { sections }
    })
  }

  async function save() {
    await putAssessmentBuilder(jid, builder)
  }

  // Runtime preview state
  const allQuestions: Question[] = useMemo(() => builder.sections.flatMap(s => s.questions), [builder])
  const [candidateId, setCandidateId] = useState<number>(1)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [validation, setValidation] = useState<string|undefined>()

  function visible(q: Question): boolean {
    if (!q.showIf) return true
    return String(answers[q.showIf.questionId] ?? '') === q.showIf.equals
  }

  function validate(): string|undefined {
    for (const q of allQuestions) {
      if (!visible(q)) continue
      const v = answers[q.id]
      if (q.required && (v == null || (typeof v === 'string' && !v.trim()) || (Array.isArray(v) && v.length===0))) return `"${q.label}" is required`
      if (q.type==='number' && v != null) {
        const n = Number(v)
        if (!Number.isFinite(n)) return `"${q.label}" must be a number`
        if (q.min != null && n < q.min) return `"${q.label}" must be ≥ ${q.min}`
        if (q.max != null && n > q.max) return `"${q.label}" must be ≤ ${q.max}`
      }
    }
    return undefined
  }

  async function submit() {
    const v = validate()
    if (v) { setValidation(v); return }
    await submitAssessment(jid, candidateId, answers)
    setValidation('Submitted!')
  }

  if (loading) return <div className="p-6">Loading…</div>
  if (err) return <div className="p-6 text-red-600">{err}</div>

  return (
    <div className="grid grid-cols-2 gap-4 p-6">
      <div className="tf-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="font-semibold">Builder</div>
          <button className="tf-btn tf-btn--accent" onClick={save}>Save</button>
        </div>
        <button className="tf-btn tf-btn--ghost mb-3" onClick={addSection}>Add Section</button>
        <div className="space-y-4">
          {builder.sections.map((s, si) => (
            <div key={si} className="border rounded p-3">
              <input className="border rounded px-2 py-1 mb-2 w-full" placeholder="Section title" value={s.title} onChange={e => setBuilder(b => { const sections=[...b.sections]; sections[si]={...sections[si], title:e.target.value}; return {sections} })} />
              <button className="tf-btn tf-btn--ghost mb-2" onClick={()=>addQuestion(si)}>Add Question</button>
              <div className="space-y-2">
                {s.questions.map((q, qi) => (
                  <div key={q.id} className="p-2 rounded border">
                    <div className="grid grid-cols-2 gap-2">
                      <input className="border rounded px-2 py-1" placeholder="Question text" value={q.label} onChange={e=>updateQuestion(si, qi, { label: e.target.value })} />
                      <select className="border rounded px-2 py-1" title="Question type" value={q.type} onChange={e=>updateQuestion(si, qi, { type: e.target.value as any })}>
                        <option value="single">Single choice</option>
                        <option value="multi">Multi choice</option>
                        <option value="short">Short text</option>
                        <option value="long">Long text</option>
                        <option value="number">Number</option>
                        <option value="file">File (stub)</option>
                      </select>
                      <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={!!q.required} onChange={e=>updateQuestion(si, qi, { required: e.target.checked })} /> Required</label>
                      {(q.type==='single' || q.type==='multi') && (
                        <input className="border rounded px-2 py-1 col-span-2" placeholder="Options comma-separated" value={(q.options||[]).join(', ')} onChange={e=>updateQuestion(si, qi, { options: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })} />
                      )}
                      {q.type==='number' && (
                        <div className="col-span-2 grid grid-cols-2 gap-2">
                          <input className="border rounded px-2 py-1" type="number" placeholder="Min" value={q.min ?? ''} onChange={e=>updateQuestion(si, qi, { min: e.target.value===''?undefined:Number(e.target.value) })} />
                          <input className="border rounded px-2 py-1" type="number" placeholder="Max" value={q.max ?? ''} onChange={e=>updateQuestion(si, qi, { max: e.target.value===''?undefined:Number(e.target.value) })} />
                        </div>
                      )}
                      <div className="col-span-2 grid grid-cols-3 gap-2">
                        <select className="border rounded px-2 py-1" title="Conditional visibility" value={q.showIf?.questionId ?? ''} onChange={e=>updateQuestion(si, qi, { showIf: e.target.value? { questionId: e.target.value, equals: q.showIf?.equals ?? '' } : undefined })}>
                          <option value="">No condition</option>
                          {allQuestions.filter(qq=>qq.id!==q.id).map(qq=> <option key={qq.id} value={qq.id}>{qq.label}</option>)}
                        </select>
                        <input className="border rounded px-2 py-1 col-span-2" placeholder="Equals value" value={q.showIf?.equals ?? ''} onChange={e=>updateQuestion(si, qi, { showIf: q.showIf? { ...q.showIf, equals: e.target.value } : undefined })} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="tf-card p-4">
        <div className="font-semibold mb-3">Live Preview</div>
        <div className="mb-3 flex items-center gap-2">
          <label className="text-sm">Candidate ID</label>
          <input className="border rounded px-2 py-1 w-24" type="number" title="Candidate ID for preview" value={candidateId} onChange={e=>setCandidateId(Number(e.target.value))} />
        </div>
        {builder.sections.map((s, si) => (
          <div key={si} className="mb-4">
            <div className="font-medium mb-2">{s.title}</div>
            <div className="space-y-3">
              {s.questions.map(q => visible(q) && (
                <div key={q.id}>
                  <label className="block text-sm font-medium mb-1">{q.label}{q.required && ' *'}</label>
                  {q.type==='short' && (
                    <input className="border rounded px-2 py-1 w-full" placeholder="Your answer" value={answers[q.id] ?? ''} onChange={e=>setAnswers(a=>({ ...a, [q.id]: e.target.value }))} />
                  )}
                  {q.type==='long' && (
                    <textarea className="border rounded px-2 py-1 w-full h-24" placeholder="Your answer" value={answers[q.id] ?? ''} onChange={e=>setAnswers(a=>({ ...a, [q.id]: e.target.value }))} />
                  )}
                  {q.type==='number' && (
                    <input type="number" className="border rounded px-2 py-1 w-full" placeholder="Enter number" value={answers[q.id] ?? ''} onChange={e=>setAnswers(a=>({ ...a, [q.id]: e.target.value }))} />
                  )}
                  {q.type==='single' && (
                    <select className="border rounded px-2 py-1 w-full" title="Select an option" value={answers[q.id] ?? ''} onChange={e=>setAnswers(a=>({ ...a, [q.id]: e.target.value }))}>
                      <option value=""></option>
                      {(q.options||[]).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  )}
                  {q.type==='multi' && (
                    <div className="flex flex-wrap gap-2">
                      {(q.options||[]).map(opt => {
                        const arr: string[] = answers[q.id] ?? []
                        const checked = arr.includes(opt)
                        return (
                          <label key={opt} className="text-sm flex items-center gap-1 border rounded px-2 py-1">
                            <input type="checkbox" checked={checked} onChange={e=>{
                              setAnswers(a=>{
                                const prev: string[] = a[q.id] ?? []
                                return { ...a, [q.id]: e.target.checked ? [...prev, opt] : prev.filter(x=>x!==opt) }
                              })
                            }} /> {opt}
                          </label>
                        )
                      })}
                    </div>
                  )}
                  {q.type==='file' && (
                    <div>
                      <input
                        type="file"
                        className="border rounded px-2 py-1 w-full text-sm"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const { uploadFile } = await import('../../../utils/fileUpload');
                            try {
                              const result = await uploadFile(file, 1); // TODO: Get actual userId
                              setAnswers(a => ({ ...a, [q.id]: result.fileId }));
                            } catch (err: any) {
                              alert(err?.message || 'Upload failed');
                            }
                          }
                        }}
                      />
                      {answers[q.id] && (
                        <div className="text-xs tf-muted mt-1">File uploaded (ID: {answers[q.id]})</div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
        {validation && <div className="text-sm mt-2 {validation==='Submitted!'?'text-emerald-600':'text-red-600'}">{validation}</div>}
        <div className="mt-3 flex gap-2">
          <button className="tf-btn tf-btn--primary" onClick={submit}>Submit</button>
        </div>
      </div>
    </div>
  )
}


