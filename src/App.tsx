import JobsBoard from './features/jobs/pages/JobsBoard'
import CandidatesPage from './features/candidates/pages/CandidatesPage'
import AssessmentsPage from './features/assessments/pages/AssessmentsPage'
import { useEffect, useState } from 'react'
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom'
import CandidateProfilePage from './features/candidates/pages/CandidateProfilePage'
import CandidatesKanbanPage from './features/candidates/pages/CandidatesKanbanPage'
import AssessmentBuilderPage from './features/assessments/pages/AssessmentBuilderPage'
import LoginPage from './features/auth/pages/LoginPage'
import AnalyticsDashboard from './features/analytics/pages/AnalyticsDashboard'

function AppContent() {
  const location = useLocation()
  const [tab, setTab] = useState<'jobs'|'candidates'|'assessments'|'analytics'>('jobs')

  // Update tab based on current route
  useEffect(() => {
    if (location.pathname.startsWith('/candidates')) setTab('candidates')
    else if (location.pathname.startsWith('/assessments')) setTab('assessments')
    else if (location.pathname.startsWith('/analytics')) setTab('analytics')
    else setTab('jobs')
  }, [location.pathname])

  return (
      <div className="min-h-screen">
        <header className="header-gradient sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-6 h-16 flex items-center gap-4">
            <div className="text-2xl font-bold text-slate-50 tracking-tight flex items-center gap-3">
              <div className="relative">
                <span className="inline-block w-3 h-3 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400 animate-pulse"></span>
                <span className="absolute inset-0 inline-block w-3 h-3 rounded-full bg-gradient-to-r from-indigo-400 to-pink-400 animate-ping opacity-75"></span>
              </div>
              <span className="bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 bg-clip-text text-transparent">TALENTFLOW</span>
            </div>
            <nav className="ml-auto flex gap-2">
              <Link to="/" className={`px-5 py-2 rounded-xl font-semibold transition-all duration-150 ${tab==='jobs'?'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30':'text-slate-300 hover:text-white hover:bg-white/10'}`}>Jobs</Link>
              <Link to="/candidates" className={`px-5 py-2 rounded-xl font-semibold transition-all duration-150 ${tab==='candidates'?'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30':'text-slate-300 hover:text-white hover:bg-white/10'}`}>Candidates</Link>
              <Link to="/assessments" className={`px-5 py-2 rounded-xl font-semibold transition-all duration-150 ${tab==='assessments'?'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30':'text-slate-300 hover:text-white hover:bg-white/10'}`}>Assessments</Link>
              <Link to="/analytics" className={`px-5 py-2 rounded-xl font-semibold transition-all duration-150 ${tab==='analytics'?'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/30':'text-slate-300 hover:text-white hover:bg-white/10'}`}>Analytics</Link>
            </nav>
          </div>
        </header>
        <main className="max-w-6xl mx-auto px-4 py-6">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<JobsBoard />} />
            <Route path="/jobs/:jobId" element={<JobsBoard />} />
            <Route path="/candidates" element={<CandidatesPage />} />
            <Route path="/candidates/:id" element={<CandidateProfilePage />} />
            <Route path="/candidates/kanban" element={<CandidatesKanbanPage />} />
            <Route path="/assessments" element={<AssessmentsPage />} />
            <Route path="/assessments/builder/:jobId" element={<AssessmentBuilderPage />} />
            <Route path="/analytics" element={<AnalyticsDashboard />} />
          </Routes>
        </main>
      </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}
