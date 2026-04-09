'use client';

import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { loadVaultDataAsync } from '@/lib/storage';
import { CATEGORIES } from '@/lib/categories';

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
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg px-3 py-2">
      <p className="text-xs font-600 text-slate-700">{label}</p>
      <p className="text-sm font-700 text-slate-900">{payload[0].value} documents</p>
    </div>
  );
}

export default function VaultStatsPanel() {
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [totalDocs, setTotalDocs] = useState(0);
  const [totalMembers, setTotalMembers] = useState(0);

  useEffect(() => {
    loadVaultDataAsync().then((data) => {
      setTotalDocs(data.documents.length);
      setTotalMembers(data.members.length);
      const points: ChartDataPoint[] = CATEGORIES.map((cat) => ({
        name: cat.shortLabel,
        count: data.documents.filter((d) => d.categoryId === cat.id).length,
        color: cat.color,
      }));
      setChartData(points);
    });
  }, []);

  return (
    <div className="bg-white rounded-[1.35rem] border border-slate-200/80 shadow-[0_2px_12px_rgba(0,0,0,0.04)] p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-black/5 rounded-xl flex items-center justify-center">
          <TrendingUp size={20} className="text-slate-700" />
        </div>
        <div>
          <h3 className="text-base font-700 text-slate-900">Vault Overview</h3>
          <p className="text-xs text-slate-400">Documents stored per category</p>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-black/5 rounded-xl p-3 text-center border border-black/5">
          <p className="text-2xl font-800 text-slate-900 tabular-nums">{totalDocs}</p>
          <p className="text-xs text-slate-500 font-500 mt-0.5">Total Documents</p>
        </div>
        <div className="bg-black/5 rounded-xl p-3 text-center border border-black/5">
          <p className="text-2xl font-800 text-slate-900 tabular-nums">{totalMembers}</p>
          <p className="text-xs text-slate-500 font-500 mt-0.5">Family Members</p>
        </div>
      </div>

      {/* Bar chart */}
      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            barSize={22}
            margin={{ top: 4, right: 4, left: -24, bottom: 0 }}
          >
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Plus Jakarta Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#94a3b8', fontFamily: 'Plus Jakarta Sans' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`bar-cell-${index}`} fill={entry.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
