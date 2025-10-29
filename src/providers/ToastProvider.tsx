import { createContext, ReactNode, useCallback, useContext, useState } from 'react'

type Toast = { id: number; message: string; type?: 'success'|'error'|'info' }

const ToastCtx = createContext<{ notify: (t: Omit<Toast,'id'>) => void } | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const notify = useCallback((t: Omit<Toast,'id'>) => {
    const id = Date.now() + Math.random()
    setToasts(prev => [...prev, { id, ...t }])
    setTimeout(() => setToasts(prev => prev.filter(x => x.id !== id)), 3000)
  }, [])
  return (
    <ToastCtx.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {toasts.map(t => (
          <div key={t.id} className={`px-3 py-2 rounded shadow text-white ${t.type==='error'?'bg-rose-600':t.type==='success'?'bg-emerald-600':'bg-gray-800'}`}>{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('ToastProvider missing')
  return ctx
}


