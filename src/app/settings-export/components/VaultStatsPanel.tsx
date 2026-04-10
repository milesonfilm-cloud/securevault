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
    <div className="neo-card rounded-2xl px-3 py-2">
      <p className="text-xs font-600 text-white/80">{label}</p>
      <p className="text-sm font-700 text-white">{payload[0].value} documents</p>
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
    <div className="neo-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-vault-elevated rounded-xl flex items-center justify-center border border-[rgba(255,255,255,0.07)]">
          <TrendingUp size={20} className="text-vault-warm" />
        </div>
        <div>
          <h3 className="text-base font-700 text-white">Vault Overview</h3>
          <p className="text-xs text-white/75">Documents stored per category</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-vault-elevated rounded-xl p-3 text-center border border-[rgba(255,255,255,0.07)]">
          <p className="text-2xl font-800 text-white tabular-nums">{totalDocs}</p>
          <p className="text-xs text-white/82 font-600 mt-0.5">Total Documents</p>
        </div>
        <div className="bg-vault-elevated rounded-xl p-3 text-center border border-[rgba(255,255,255,0.07)]">
          <p className="text-2xl font-800 text-white tabular-nums">{totalMembers}</p>
          <p className="text-xs text-white/82 font-600 mt-0.5">Family Members</p>
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
              tick={{ fontSize: 10, fill: '#E4DCF5', fontFamily: 'Plus Jakarta Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#E4DCF5', fontFamily: 'Plus Jakarta Sans' }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(61,54,102,0.35)' }} />
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
