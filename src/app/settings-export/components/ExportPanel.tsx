'use client';

import React, { useState, useEffect } from 'react';
import { Download, FileJson, Sheet, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { loadVaultDataAsync, saveVaultDataAsync, VaultData, ExportRecord } from '@/lib/storage';
import { CATEGORIES } from '@/lib/categories';

type ExportFormat = 'json' | 'csv';

export default function ExportPanel() {
  const [format, setFormat] = useState<ExportFormat>('json');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedMember, setSelectedMember] = useState<string>('all');
  const [isExporting, setIsExporting] = useState(false);
  const [vaultData, setVaultData] = useState<VaultData>({
    members: [],
    documents: [],
    exportHistory: [],
  });

  useEffect(() => {
    loadVaultDataAsync().then(setVaultData);
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let docs = vaultData.documents;
      if (selectedCategory !== 'all') docs = docs.filter((d) => d.categoryId === selectedCategory);
      if (selectedMember !== 'all') docs = docs.filter((d) => d.memberId === selectedMember);

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

      if (format === 'json') {
        const exportData = {
          exportedAt: new Date().toISOString(),
          app: 'SecureVault',
          version: '1.0',
          members: vaultData.members,
          documents: docs,
        };
        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `securevault-backup-${timestamp}.json`;
        a.click();
        URL.revokeObjectURL(url);
      } else if (format === 'csv') {
        const rows: string[] = [];
        rows.push(
          ['Title', 'Category', 'Member', 'Fields', 'Notes', 'Tags', 'Created', 'Updated'].join(',')
        );
        docs.forEach((doc) => {
          const member = vaultData.members.find((m) => m.id === doc.memberId);
          const fieldsStr = Object.entries(doc.fields)
            .map(([k, v]) => {
              const isSensitive = CATEGORIES.find((c) => c.id === doc.categoryId)?.fields.find(
                (f) => f.key === k
              )?.sensitive;
              return `${k}: ${isSensitive ? '[REDACTED]' : v}`;
            })
            .join(' | ')
            .replace(/"/g, '""');
          rows.push(
            [
              `"${doc.title}"`,
              `"${doc.categoryId}"`,
              `"${member?.name || 'Unknown'}"`,
              `"${fieldsStr}"`,
              `"${doc.notes}"`,
              `"${doc.tags.join(', ')}"`,
              `"${doc.createdAt}"`,
              `"${doc.updatedAt}"`,
            ].join(',')
          );
        });
        const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `securevault-export-${timestamp}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      }

      // Record export
      const record: ExportRecord = {
        id: `export-${Date.now()}`,
        format: format.toUpperCase(),
        exportedAt: new Date().toISOString(),
        documentCount: docs.length,
      };
      const updated: VaultData = {
        ...vaultData,
        exportHistory: [record, ...vaultData.exportHistory].slice(0, 10),
      };
      await saveVaultDataAsync(updated);
      setVaultData(updated);

      toast.success(`Exported ${docs.length} documents as ${format.toUpperCase()}`);
    } catch (_err) {
      toast.error('Export failed — check browser permissions and try again');
    } finally {
      setIsExporting(false);
    }
  };

  const FORMAT_OPTIONS: { id: ExportFormat; label: string; desc: string; icon: React.ReactNode }[] =
    [
      {
        id: 'json',
        label: 'JSON Backup',
        desc: 'Full backup — importable back into SecureVault',
        icon: <FileJson size={18} className="text-indigo-500" />,
      },
      {
        id: 'csv',
        label: 'CSV Spreadsheet',
        desc: 'Open in Excel or Google Sheets',
        icon: <Sheet size={18} className="text-emerald-500" />,
      },
    ];

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
          <Download size={20} className="text-indigo-500" />
        </div>
        <div>
          <h3 className="text-base font-700 text-slate-900">Export Documents</h3>
          <p className="text-xs text-slate-400">
            Create a local backup — files download to your device
          </p>
        </div>
      </div>

      {/* Format selection */}
      <div className="mb-4">
        <label className="label-text">Export Format</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
          {FORMAT_OPTIONS.map((opt) => (
            <button
              key={`fmt-${opt.id}`}
              onClick={() => setFormat(opt.id)}
              className={`flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                format === opt.id
                  ? 'border-indigo-400 bg-indigo-50/50'
                  : 'border-slate-100 hover:border-slate-200 bg-slate-50'
              }`}
            >
              <div className="mt-0.5">{opt.icon}</div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-600 text-slate-800">{opt.label}</span>
                  {format === opt.id && <CheckCircle2 size={14} className="text-indigo-500" />}
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{opt.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="label-text">Filter by Category</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field mt-1"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((cat) => (
              <option key={`export-cat-${cat.id}`} value={cat.id}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label-text">Filter by Member</label>
          <select
            value={selectedMember}
            onChange={(e) => setSelectedMember(e.target.value)}
            className="input-field mt-1"
          >
            <option value="all">All Members</option>
            {vaultData.members.map((m) => (
              <option key={`export-member-${m.id}`} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Export count preview */}
      <div className="bg-slate-50 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
        <span className="text-sm text-slate-600">Documents to export</span>
        <span className="text-sm font-700 text-slate-900 tabular-nums">
          {
            vaultData.documents.filter((d) => {
              const catOk = selectedCategory === 'all' || d.categoryId === selectedCategory;
              const memOk = selectedMember === 'all' || d.memberId === selectedMember;
              return catOk && memOk;
            }).length
          }
        </span>
      </div>

      <button
        onClick={handleExport}
        disabled={isExporting}
        className="btn-primary w-full justify-center"
      >
        {isExporting ? (
          <span className="flex items-center gap-2">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
            Exporting...
          </span>
        ) : (
          <>
            <Download size={16} />
            Export as {format.toUpperCase()}
          </>
        )}
      </button>
    </div>
  );
}
