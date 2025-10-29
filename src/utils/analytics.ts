/**
 * Analytics and statistics utilities
 */

import { db } from '../db';

export interface DashboardStats {
  totalJobs: number;
  activeJobs: number;
  totalCandidates: number;
  candidatesByStage: Record<string, number>;
  recentActivity: Array<{
    type: 'job' | 'candidate' | 'assessment';
    action: string;
    timestamp: number;
  }>;
  topDepartments: Array<{ department: string; count: number }>;
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const [jobs, candidates, assessments] = await Promise.all([
    db.jobs.toArray(),
    db.candidates.toArray(),
    db.assessments.toArray(),
  ]);

  const candidatesByStage: Record<string, number> = {};
  candidates.forEach(c => {
    candidatesByStage[c.stage] = (candidatesByStage[c.stage] || 0) + 1;
  });

  const departments: Record<string, number> = {};
  jobs.forEach(j => {
    departments[j.department] = (departments[j.department] || 0) + 1;
  });

  const topDepartments = Object.entries(departments)
    .map(([department, count]) => ({ department, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Recent activity (last 10 items)
  const recentActivity = [
    ...jobs.slice(-5).map(j => ({
      type: 'job' as const,
      action: `Job "${j.title}" ${j.archived ? 'archived' : 'created'}`,
      timestamp: j.createdAt,
    })),
    ...candidates.slice(-5).map(c => ({
      type: 'candidate' as const,
      action: `Candidate "${c.name}" added`,
      timestamp: c.createdAt,
    })),
  ]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, 10);

  return {
    totalJobs: jobs.length,
    activeJobs: jobs.filter(j => !j.archived && j.status === 'open').length,
    totalCandidates: candidates.length,
    candidatesByStage,
    recentActivity,
    topDepartments,
  };
}

