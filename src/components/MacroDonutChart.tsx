import React, { useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { PieChart, Sparkles } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface MacroDonutChartProps {
  proteinG: number;
  carbsG: number;
  fatG: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
  darkMode: boolean;
}

export const MacroDonutChart: React.FC<MacroDonutChartProps> = ({
  proteinG,
  carbsG,
  fatG,
  targetProteinG,
  targetCarbsG,
  targetFatG,
  darkMode,
}) => {
  const totalGrams = proteinG + carbsG + fatG;
  const hasData = totalGrams > 0;

  // Calorie calculations: 4 kcal per gram for protein and carbs, 9 kcal for fat
  const proteinKcal = proteinG * 4;
  const carbsKcal = carbsG * 4;
  const fatKcal = fatG * 9;
  const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;

  const proteinPct = totalMacroKcal > 0 ? Math.round((proteinKcal / totalMacroKcal) * 100) : 0;
  const carbsPct = totalMacroKcal > 0 ? Math.round((carbsKcal / totalMacroKcal) * 100) : 0;
  const fatPct = totalMacroKcal > 0 ? Math.round((fatKcal / totalMacroKcal) * 100) : 0;

  const chartData = {
    labels: ['Protein (g)', 'Carbs (g)', 'Fat (g)'],
    datasets: [
      {
        data: hasData ? [proteinG, carbsG, fatG] : [1, 1, 1],
        backgroundColor: hasData
          ? ['#6366F1', '#10B981', '#F59E0B'] // Indigo, Emerald, Amber
          : ['#CBD5E1', '#E2E8F0', '#F1F5F9'],
        borderWidth: 2,
        borderColor: darkMode ? '#0F172A' : '#FFFFFF',
        hoverOffset: 6,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '72%',
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: hasData,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const val = context.raw || 0;
            return ` ${label}: ${val}g`;
          },
        },
      },
    },
  };

  return (
    <div className="glass-card p-6 rounded-3xl flex flex-col justify-between h-full">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Macronutrient Ratio
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Protein · Carbohydrates · Healthy Fats
              </p>
            </div>
          </div>
          {hasData && (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
              {Math.round(totalGrams)}g total
            </span>
          )}
        </div>

        {/* Donut Chart Container */}
        <div className="relative h-44 my-2 flex items-center justify-center">
          <Doughnut data={chartData} options={chartOptions} />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Energy
            </span>
            <span className="text-xl font-extrabold text-slate-900 dark:text-white font-mono">
              {totalMacroKcal}
            </span>
            <span className="text-[10px] text-slate-400">kcal macros</span>
          </div>
        </div>
      </div>

      {/* Macro Breakdown cards */}
      <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800/80">
        {/* Protein */}
        <div className="p-2.5 rounded-xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-300 text-xs font-semibold">
            <span>Protein</span>
            <span className="font-mono text-[10px]">{proteinPct}%</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-1">
            {proteinG}g
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Target: {targetProteinG}g
          </div>
          <div className="w-full bg-indigo-200 dark:bg-indigo-950 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (proteinG / (targetProteinG || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Carbs */}
        <div className="p-2.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs font-semibold">
            <span>Carbs</span>
            <span className="font-mono text-[10px]">{carbsPct}%</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-1">
            {carbsG}g
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Target: {targetCarbsG}g
          </div>
          <div className="w-full bg-emerald-200 dark:bg-emerald-950 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (carbsG / (targetCarbsG || 1)) * 100)}%` }}
            />
          </div>
        </div>

        {/* Fat */}
        <div className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 text-xs font-semibold">
            <span>Fat</span>
            <span className="font-mono text-[10px]">{fatPct}%</span>
          </div>
          <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-1">
            {fatG}g
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400">
            Target: {targetFatG}g
          </div>
          <div className="w-full bg-amber-200 dark:bg-amber-950 rounded-full h-1.5 mt-1.5 overflow-hidden">
            <div
              className="bg-amber-500 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (fatG / (targetFatG || 1)) * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
