import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/index.css'
import App from './App.tsx'
import { QueryProvider } from './providers/QueryProvider'
import { ToastProvider } from './providers/ToastProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import { ensureDbReady } from './db'
import { startMSW } from './msw/browser'

async function bootstrap() {
  console.log('🚀 Starting TALENTFLOW...')
  
  try {
    console.log('📦 Initializing database...')
    await ensureDbReady()
    console.log('✅ Database ready')
  } catch (err) {
    console.error('❌ Database failed to initialize:', err)
    throw new Error(`Database initialization failed: ${err instanceof Error ? err.message : String(err)}`)
  }

  if (import.meta.env.DEV) {
    try {
      console.log('🔧 Starting Mock Service Worker...')
      await startMSW()
      console.log('✅ MSW started successfully - API mocking enabled')
    } catch (err) {
      console.error('❌ MSW failed to start:', err)
      throw new Error(`MSW initialization failed: ${err instanceof Error ? err.message : String(err)}`)
    }
  }
  
  console.log('🎨 Rendering application...')
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </QueryProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
  console.log('✅ Application rendered successfully')
}

bootstrap().catch(err => {
  console.error('❌ Bootstrap failed:', err)
  document.body.innerHTML = `
    <div style="padding: 40px; font-family: system-ui; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #ef4444;">Application Failed to Start</h1>
      <p>Please check the console for details.</p>
      <pre style="background: #1e293b; color: #f1f5f9; padding: 16px; border-radius: 8px; overflow-x: auto;">${err instanceof Error ? err.message : String(err)}</pre>
    </div>
  `
})
