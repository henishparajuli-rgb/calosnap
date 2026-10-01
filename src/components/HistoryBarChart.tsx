import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { BarChart3, TrendingDown, Calendar } from 'lucide-react';
import { FoodLogEntry } from '../types';
import { getPast7DaysDates } from '../utils/storage';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface HistoryBarChartProps {
  logs: FoodLogEntry[];
  dailyTarget: number;
  tdee: number;
  darkMode: boolean;
}

export const HistoryBarChart: React.FC<HistoryBarChartProps> = ({
  logs,
  dailyTarget,
  tdee,
  darkMode,
}) => {
  const past7Days = getPast7DaysDates();

  const labels = past7Days.map((dateStr, idx) => {
    if (idx === 6) return 'Today';
    const d = new Date(dateStr + 'T00:00:00');
    return d.toLocaleDateString([], { weekday: 'short', month: 'numeric', day: 'numeric' });
  });

  // Calculate total calories consumed for each day
  const dailyCalories = past7Days.map((dateStr) => {
    const dayLogs = logs.filter((l) => l.date === dateStr);
    return dayLogs.reduce((acc, curr) => acc + curr.totalCalories, 0);
  });

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Consumed (kcal)',
        data: dailyCalories,
        backgroundColor: dailyCalories.map((val) => {
          if (val === 0) return darkMode ? '#334155' : '#E2E8F0';
          if (val > dailyTarget + 100) return '#F43F5E'; // over target (rose)
          return '#10B981'; // on track (emerald)
        }),
        borderRadius: 8,
        borderSkipped: false,
      },
      {
        label: 'Daily Target (kcal)',
        data: past7Days.map(() => dailyTarget),
        type: 'bar' as const,
        backgroundColor: darkMode ? 'rgba(148, 163, 184, 0.15)' : 'rgba(148, 163, 184, 0.25)',
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          boxWidth: 12,
          color: darkMode ? '#94A3B8' : '#64748B',
          font: { size: 11, family: 'Inter' },
        },
      },
      tooltip: {
        backgroundColor: darkMode ? '#0F172A' : '#1E293B',
        titleColor: '#FFFFFF',
        bodyColor: '#E2E8F0',
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => {
            const val = context.raw || 0;
            return ` ${context.dataset.label}: ${val} kcal`;
          },
          afterBody: (context: any) => {
            const consumed = context[0]?.raw || 0;
            const diff = dailyTarget - consumed;
            if (consumed === 0) return '';
            return diff >= 0
              ? `Deficit to Target: ${diff} kcal`
              : `Over Target: +${Math.abs(diff)} kcal`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: {
          color: darkMode ? '#94A3B8' : '#64748B',
          font: { size: 11 },
        },
      },
      y: {
        grid: {
          color: darkMode ? 'rgba(51, 65, 85, 0.4)' : 'rgba(226, 232, 240, 0.8)',
        },
        ticks: {
          color: darkMode ? '#94A3B8' : '#64748B',
          font: { size: 11 },
        },
        suggestedMax: Math.max(...dailyCalories, dailyTarget) + 300,
      },
    },
  };

  return (
    <div className="glass-card p-6 rounded-3xl h-full flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              7-Day Caloric Intake History
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Daily intake vs {dailyTarget} kcal target
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <Calendar className="w-3.5 h-3.5" />
          <span>Past 7 Days</span>
        </div>
      </div>

      <div className="h-56 w-full">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
          <span>On track / Deficit</span>
          <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ml-2" />
          <span>Over target</span>
        </div>
        <div className="font-mono text-[11px]">
          Target: <span className="font-bold text-slate-700 dark:text-slate-200">{dailyTarget}</span> kcal
        </div>
      </div>
    </div>
  );
};
