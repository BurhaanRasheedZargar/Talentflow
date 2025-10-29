import { useRef } from 'react';
import { exportAllData, exportJobs, exportCandidates, exportAssessments, downloadJSON, handleFileImport } from '../utils/exportImport';
import { useToast } from '../providers/ToastProvider';
import { hasPermission } from '../utils/auth';

interface ExportImportButtonsProps {
  type?: 'all' | 'jobs' | 'candidates' | 'assessments';
}

export function ExportImportButtons({ type = 'all' }: ExportImportButtonsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { notify } = useToast();

  const canExport = hasPermission('export') || hasPermission('*');
  const canImport = hasPermission('import') || hasPermission('*');

  async function handleExport() {
    try {
      let data: string;
      let filename: string;

      switch (type) {
        case 'jobs':
          data = await exportJobs();
          filename = `talentflow-jobs-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'candidates':
          data = await exportCandidates();
          filename = `talentflow-candidates-${new Date().toISOString().split('T')[0]}.json`;
          break;
        case 'assessments':
          data = await exportAssessments();
          filename = `talentflow-assessments-${new Date().toISOString().split('T')[0]}.json`;
          break;
        default:
          data = await exportAllData();
          filename = `talentflow-export-${new Date().toISOString().split('T')[0]}.json`;
      }

      downloadJSON(data, filename);
      notify({ type: 'success', message: 'Data exported successfully' });
    } catch (error: any) {
      notify({ type: 'error', message: error?.message || 'Export failed' });
    }
  }

  async function handleImport(overwrite: boolean) {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    try {
      const result = await handleFileImport(file, overwrite);
      notify({
        type: 'success',
        message: `Imported ${result.imported} items${result.errors.length ? ` (${result.errors.length} errors)` : ''}`,
      });
      // Refresh the page to show new data
      window.location.reload();
    } catch (error: any) {
      notify({ type: 'error', message: error?.message || 'Import failed' });
    }
  }

  return (
    <div className="flex gap-2">
      {canExport && (
        <button className="tf-btn tf-btn--ghost" onClick={handleExport}>
          📥 Export {type !== 'all' ? type : 'All'}
        </button>
      )}
      {canImport && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => {
              if (e.target.files?.[0]) {
                const overwrite = confirm('Overwrite existing data?');
                handleImport(overwrite);
                e.target.value = ''; // Reset input
              }
            }}
          />
          <button
            className="tf-btn tf-btn--ghost"
            onClick={() => fileInputRef.current?.click()}
          >
            📤 Import
          </button>
        </>
      )}
    </div>
  );
}


