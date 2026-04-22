'use client';

import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { useVaultData } from '@/context/VaultDataContext';
import { CATEGORIES } from '@/lib/categories';
import { useTheme } from '@/context/ThemeContext';
import type { AppTheme } from '@/context/ThemeContext';

function chartAxisFill(theme: AppTheme): string {
  switch (theme) {
    case 'neon':
      return '#a0a0a0';
    case 'wellness':
      return '#6b7a8c';
    case 'pastel':
      return '#5c6370';
    case 'voyager':
      return '#a3a3a3';
    default:
      return '#d4cced';
  }
}

function chartCursorFill(theme: AppTheme): string {
  switch (theme) {
    case 'neon':
      return 'rgba(0, 255, 65, 0.12)';
    case 'wellness':
      return 'rgba(26, 26, 46, 0.06)';
    case 'pastel':
      return 'rgba(26, 31, 46, 0.08)';
    case 'voyager':
      return 'rgba(255, 255, 255, 0.07)';
    default:
      return 'rgba(212, 204, 237, 0.14)';
  }
}

interface ChartDataPoint {
  name: string;
  count: number;
  color: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="neo-card rounded-2xl px-3 py-2">
      <p className="text-xs font-600 text-vault-muted">{label}</p>
      <p className="text-sm font-700 text-vault-text">{payload[0].value} documents</p>
    </div>
  );
}

export default function VaultStatsPanel() {
  const { vaultData } = useVaultData();
  const { theme } = useTheme();
  const axisFill = chartAxisFill(theme);
  const cursorFill = chartCursorFill(theme);

  const totalDocs = vaultData.documents.length;
  const totalMembers = vaultData.members.length;

  const chartData = useMemo((): ChartDataPoint[] => {
    return CATEGORIES.map((cat) => ({
      name: cat.shortLabel,
      count: vaultData.documents.filter((d) => d.categoryId === cat.id).length,
      color: cat.color,
    }));
  }, [vaultData.documents]);

  return (
    <div className="neo-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-vault-elevated rounded-xl flex items-center justify-center border border-border">
          <TrendingUp size={20} className="text-vault-warm" />
        </div>
        <div>
          <h3 className="text-base font-700 text-vault-text">Vault Overview</h3>
          <p className="text-xs text-vault-muted">Documents stored per category</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-vault-elevated rounded-xl p-3 text-center border border-border">
          <p className="text-2xl font-800 text-vault-text tabular-nums">{totalDocs}</p>
          <p className="text-xs font-600 mt-0.5 text-vault-muted">Total Documents</p>
        </div>
        <div className="bg-vault-elevated rounded-xl p-3 text-center border border-border">
          <p className="text-2xl font-800 text-vault-text tabular-nums">{totalMembers}</p>
          <p className="text-xs font-600 mt-0.5 text-vault-muted">Family Members</p>
        </div>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barSize={22}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: axisFill, fontFamily: 'system-ui, sans-serif' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: axisFill, fontFamily: 'system-ui, sans-serif' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: cursorFill }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`bar-cell-${index}`} fill={entry.color} fillOpacity={0.9} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
