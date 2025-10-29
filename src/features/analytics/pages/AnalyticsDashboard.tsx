import { useEffect, useState } from 'react';
import { getDashboardStats, type DashboardStats } from '../../../utils/analytics';

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    setLoading(true);
    const data = await getDashboardStats();
    setStats(data);
    setLoading(false);
  }

  if (loading) return <div className="p-6">Loading analytics...</div>;
  if (!stats) return <div className="p-6">Failed to load analytics</div>;

  const stageColors: Record<string, string> = {
    applied: 'bg-slate-500',
    screen: 'bg-orange-500',
    interview: 'bg-blue-500',
    offer: 'bg-yellow-500',
    hired: 'bg-green-500',
    rejected: 'bg-red-500',
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tf-title">Analytics Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="tf-card p-4">
          <div className="text-sm tf-muted">Total Jobs</div>
          <div className="text-3xl font-bold tf-title mt-1">{stats.totalJobs}</div>
        </div>
        <div className="tf-card p-4">
          <div className="text-sm tf-muted">Active Jobs</div>
          <div className="text-3xl font-bold tf-title mt-1">{stats.activeJobs}</div>
        </div>
        <div className="tf-card p-4">
          <div className="text-sm tf-muted">Total Candidates</div>
          <div className="text-3xl font-bold tf-title mt-1">{stats.totalCandidates}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="tf-card p-4">
          <h2 className="font-semibold mb-3">Candidates by Stage</h2>
          <div className="space-y-2">
            {Object.entries(stats.candidatesByStage).map(([stage, count]) => (
              <div key={stage} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stageColors[stage] || 'bg-gray-500'}`}></div>
                  <span className="capitalize">{stage}</span>
                </div>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="tf-card p-4">
          <h2 className="font-semibold mb-3">Top Departments</h2>
          <div className="space-y-2">
            {stats.topDepartments.map(({ department, count }) => (
              <div key={department} className="flex items-center justify-between">
                <span>{department || 'Unspecified'}</span>
                <span className="font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="tf-card p-4">
        <h2 className="font-semibold mb-3">Recent Activity</h2>
        <div className="space-y-2">
          {stats.recentActivity.map((activity, idx) => (
            <div key={idx} className="flex items-center justify-between border-b border-gray-700 pb-2">
              <div>
                <span className="text-sm">{activity.action}</span>
                <div className="text-xs tf-muted">{new Date(activity.timestamp).toLocaleString()}</div>
              </div>
              <span className="text-xs tf-badge">{activity.type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


