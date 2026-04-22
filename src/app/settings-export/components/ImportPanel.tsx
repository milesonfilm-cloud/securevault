'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileJson, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { toast } from 'sonner';
import { VaultData, type Document, migrateDocumentStackField } from '@/lib/storage';
import { useVaultData } from '@/context/VaultDataContext';

type ImportState = 'idle' | 'dragging' | 'parsing' | 'preview' | 'error';

interface ParsedImport {
  members: number;
  documents: number;
  exportedAt: string;
  data: VaultData;
}

export default function ImportPanel() {
  const { vaultData: existingVault, persistVaultData } = useVaultData();
  const [importState, setImportState] = useState<ImportState>('idle');
  const [parsedData, setParsedData] = useState<ParsedImport | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [mergeMode, setMergeMode] = useState<'merge' | 'replace'>('merge');
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseFile = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setErrorMsg('Only JSON files exported from SecureVault are supported');
      setImportState('error');
      return;
    }
    setImportState('parsing');
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        if (!raw.members || !raw.documents) {
          throw new Error('Invalid SecureVault backup format');
        }
        setParsedData({
          members: raw.members.length,
          documents: raw.documents.length,
          exportedAt: raw.exportedAt || 'Unknown',
          data: {
            members: raw.members,
            documents: (raw.documents as (Document & { stackIds?: string[] })[]).map((d) =>
              migrateDocumentStackField(d)
            ),
            exportHistory: raw.exportHistory || [],
            documentStacks: Array.isArray(raw.documentStacks) ? raw.documentStacks : [],
          },
        });
        setImportState('preview');
      } catch (_err) {
        setErrorMsg('Could not parse this file — make sure it is a valid SecureVault JSON backup');
        setImportState('error');
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setImportState('idle');
    const file = e.dataTransfer.files[0];
    if (file) parseFile(file);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) parseFile(file);
  };

  const handleImport = async () => {
    if (!parsedData) return;
    setIsImporting(true);
    try {
      if (mergeMode === 'merge') {
        const existing = existingVault;
        const existingMemberIds = new Set(existing.members.map((m) => m.id));
        const existingDocIds = new Set(existing.documents.map((d) => d.id));
        const newMembers = parsedData.data.members.filter((m) => !existingMemberIds.has(m.id));
        const newDocs = parsedData.data.documents
          .filter((d) => !existingDocIds.has(d.id))
          .map((d) => migrateDocumentStackField(d as Document & { stackIds?: string[] }));
        const existingStackIds = new Set(existing.documentStacks.map((s) => s.id));
        const importedStacks = parsedData.data.documentStacks ?? [];
        const newStacks = importedStacks.filter((s) => !existingStackIds.has(s.id));
        const merged: VaultData = {
          ...existing,
          members: [...existing.members, ...newMembers],
          documents: [...existing.documents, ...newDocs],
          documentStacks: [...existing.documentStacks, ...newStacks],
        };
        await persistVaultData(merged);
        toast.success(
          `Merged — ${newMembers.length} new members, ${newDocs.length} new documents added`
        );
      } else {
        const replaced: VaultData = {
          ...parsedData.data,
          documentStacks: parsedData.data.documentStacks ?? [],
          documents: parsedData.data.documents.map((d) =>
            migrateDocumentStackField(d as Document & { stackIds?: string[] })
          ),
        };
        await persistVaultData(replaced);
        toast.success(`Replaced vault with ${parsedData.documents} documents from backup`);
      }
      setImportState('idle');
      setParsedData(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      toast.error('Import failed — the backup file may be corrupted');
    } finally {
      setIsImporting(false);
    }
  };

  const reset = () => {
    setImportState('idle');
    setParsedData(null);
    setErrorMsg('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="neo-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-vault-elevated rounded-xl flex items-center justify-center border border-border">
          <Upload size={20} className="text-vault-warm" />
        </div>
        <div>
          <h3 className="text-base font-700 text-vault-text">Import Backup</h3>
          <p className="text-xs text-vault-faint">Restore from a SecureVault JSON backup file</p>
        </div>
      </div>

      {importState === 'idle' || importState === 'dragging' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setImportState('dragging');
          }}
          onDragLeave={() => setImportState('idle')}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 ${
            importState === 'dragging'
              ? 'border-vault-warm/50 bg-vault-elevated'
              : 'border-border hover:border-vault-warm/25 hover:bg-vault-elevated/50'
          }`}
        >
          <FileJson
            size={32}
            className={`mx-auto mb-3 ${importState === 'dragging' ? 'text-vault-warm' : 'text-vault-faint'}`}
          />
          <p className="text-sm font-600 text-vault-muted mb-1">
            {importState === 'dragging' ? 'Drop to import' : 'Drop JSON backup here'}
          </p>
          <p className="text-xs text-vault-faint">or click to browse files</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileInput}
            className="hidden"
          />
        </div>
      ) : importState === 'parsing' ? (
        <div className="flex items-center justify-center py-10 gap-3">
          <svg className="animate-spin h-5 w-5 text-vault-warm" viewBox="0 0 24 24" fill="none">
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
          <span className="text-sm text-vault-muted">Parsing backup file...</span>
        </div>
      ) : importState === 'error' ? (
        <div className="bg-red-500/10 border border-red-500/25 rounded-2xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-600 text-red-300 mb-1">Import failed</p>
              <p className="text-xs text-red-400/90">{errorMsg}</p>
            </div>
            <button onClick={reset} className="text-red-400 hover:text-red-300">
              <X size={16} />
            </button>
          </div>
        </div>
      ) : importState === 'preview' && parsedData ? (
        <div className="space-y-4">
          <div className="bg-vault-elevated border border-vault-warm/30 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={18} className="text-vault-warm mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-700 text-vault-text mb-1">
                  Valid SecureVault backup detected
                </p>
                <div className="flex flex-wrap gap-3 mt-2">
                  <span className="text-xs bg-vault-warm/20 text-vault-warm px-2 py-1 rounded-full font-600">
                    {parsedData.members} members
                  </span>
                  <span className="text-xs bg-vault-warm/20 text-vault-warm px-2 py-1 rounded-full font-600">
                    {parsedData.documents} documents
                  </span>
                  <span className="text-xs text-vault-muted">
                    Exported{' '}
                    {new Date(parsedData.exportedAt).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Merge mode */}
          <div>
            <label className="label-text">Import Mode</label>
            <div className="grid grid-cols-2 gap-2 mt-1.5">
              {[
                {
                  id: 'merge' as const,
                  label: 'Merge',
                  desc: 'Add new records, keep existing data',
                },
                { id: 'replace' as const, label: 'Replace', desc: 'Overwrite all current data' },
              ].map((mode) => (
                <button
                  key={`mode-${mode.id}`}
                  onClick={() => setMergeMode(mode.id)}
                  className={`p-3 rounded-xl border-2 text-left transition-all duration-150 ${
                    mergeMode === mode.id
                      ? mode.id === 'replace'
                        ? 'border-red-400/80 bg-red-500/10'
                        : 'border-vault-warm/50 bg-vault-elevated'
                      : 'border-border hover:border-vault-warm/25 bg-vault-elevated/50'
                  }`}
                >
                  <div className="text-sm font-600 text-vault-text">{mode.label}</div>
                  <div className="text-xs text-vault-faint mt-0.5">{mode.desc}</div>
                </button>
              ))}
            </div>
            {mergeMode === 'replace' && (
              <p className="text-xs text-red-500 mt-2 font-500">
                Warning: This will permanently overwrite all current vault data
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={isImporting}
              className={`flex-1 justify-center ${mergeMode === 'replace' ? 'btn-danger' : 'btn-primary'}`}
            >
              {isImporting ? (
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
                  Importing...
                </span>
              ) : mergeMode === 'replace' ? (
                'Replace Vault'
              ) : (
                'Merge into Vault'
              )}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
