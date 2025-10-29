/**
 * Export/Import functionality for jobs, candidates, and assessments
 */

import type { Job, Candidate, Assessment } from '../db/types';
import { db } from '../db';

export interface ExportData {
  version: '1.0';
  exportDate: string;
  jobs: Job[];
  candidates: Candidate[];
  assessments: Assessment[];
}

export async function exportAllData(): Promise<string> {
  const [jobs, candidates, assessments] = await Promise.all([
    db.jobs.toArray(),
    db.candidates.toArray(),
    db.assessments.toArray(),
  ]);

  const data: ExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    jobs,
    candidates,
    assessments,
  };

  return JSON.stringify(data, null, 2);
}

export async function exportJobs(): Promise<string> {
  const jobs = await db.jobs.toArray();
  return JSON.stringify({ jobs, exportDate: new Date().toISOString() }, null, 2);
}

export async function exportCandidates(): Promise<string> {
  const candidates = await db.candidates.toArray();
  return JSON.stringify({ candidates, exportDate: new Date().toISOString() }, null, 2);
}

export async function exportAssessments(): Promise<string> {
  const assessments = await db.assessments.toArray();
  return JSON.stringify({ assessments, exportDate: new Date().toISOString() }, null, 2);
}

export function downloadJSON(data: string, filename: string): void {
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function importData(jsonData: string, overwrite = false): Promise<{ imported: number; errors: string[] }> {
  const data = JSON.parse(jsonData) as ExportData;
  const errors: string[] = [];
  let imported = 0;

  try {
    if (data.jobs) {
      if (overwrite) {
        await db.jobs.clear();
      }
      await db.jobs.bulkAdd(data.jobs, { allKeys: true });
      imported += data.jobs.length;
    }

    if (data.candidates) {
      if (overwrite) {
        await db.candidates.clear();
      }
      await db.candidates.bulkAdd(data.candidates, { allKeys: true });
      imported += data.candidates.length;
    }

    if (data.assessments) {
      if (overwrite) {
        await db.assessments.clear();
      }
      await db.assessments.bulkAdd(data.assessments, { allKeys: true });
      imported += data.assessments.length;
    }
  } catch (error: any) {
    errors.push(error?.message || 'Import failed');
  }

  return { imported, errors };
}

export function handleFileImport(file: File, overwrite: boolean): Promise<{ imported: number; errors: string[] }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const result = await importData(e.target?.result as string, overwrite);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

