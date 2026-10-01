import React from 'react';
import {
  Flame,
  Activity,
  Zap,
  TrendingDown,
  TrendingUp,
  Scale,
  Sparkles,
  Info,
} from 'lucide-react';
import { NutritionMetrics, UserProfile } from '../types';

interface DashboardCardsProps {
  metrics: NutritionMetrics;
  profile: UserProfile;
}

export const DashboardCards: React.FC<DashboardCardsProps> = ({ metrics, profile }) => {
  const isLosing = profile.goal === 'lose';
  // Deficit vs TDEE maintenance
  const isDeficit = metrics.deficitSurplus > 0;
  const isTargetAchieved = metrics.remainingToday >= 0;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {/* 1. BMR Card */}
      <div className="glass-card p-4 rounded-2xl relative overflow-hidden group hover:border-emerald-400 dark:hover:border-emerald-600 transition-all">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">BMR (Mifflin)</span>
          <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
          {metrics.bmr}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
          <span>kcal basal rate</span>
        </div>
      </div>

      {/* 2. TDEE Card */}
      <div className="glass-card p-4 rounded-2xl relative overflow-hidden group hover:border-teal-400 dark:hover:border-teal-600 transition-all">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">TDEE</span>
          <div className="w-7 h-7 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 font-mono">
          {metrics.tdee}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          kcal maintenance
        </div>
      </div>

      {/* 3. Consumed Today Card */}
      <div className="glass-card p-4 rounded-2xl relative overflow-hidden group hover:border-amber-400 dark:hover:border-amber-600 transition-all">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Consumed</span>
          <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
          {metrics.consumedToday}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          of {metrics.dailyTarget} target
        </div>
      </div>

      {/* 4. Remaining Card */}
      <div className="glass-card p-4 rounded-2xl relative overflow-hidden group transition-all">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">Remaining</span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isTargetAchieved
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        </div>
        <div
          className={`text-2xl font-extrabold font-mono ${
            isTargetAchieved ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {metrics.remainingToday >= 0 ? metrics.remainingToday : `+${Math.abs(metrics.remainingToday)}`}
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
          {isTargetAchieved ? 'kcal to daily target' : 'kcal above target'}
        </div>
      </div>

      {/* 5. Deficit / Surplus vs TDEE */}
      <div
        className={`glass-card p-4 rounded-2xl relative overflow-hidden transition-all border ${
          isDeficit
            ? 'border-emerald-200 dark:border-emerald-800/80 bg-emerald-50/20 dark:bg-emerald-950/10'
            : 'border-rose-200 dark:border-rose-800/80 bg-rose-50/20 dark:bg-rose-950/10'
        }`}
      >
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">
            {isDeficit ? 'Deficit' : 'Surplus'}
          </span>
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center ${
              isDeficit
                ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400'
            }`}
          >
            {isDeficit ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
          </div>
        </div>
        <div
          className={`text-2xl font-extrabold font-mono ${
            isDeficit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {isDeficit ? `-${metrics.deficitSurplus}` : `+${Math.abs(metrics.deficitSurplus)}`}
          <span className="text-xs font-normal text-slate-500 ml-1">kcal</span>
        </div>
        <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
          {metrics.weeklyWeightChangeKg !== 0 ? (
            <span>
              {metrics.weeklyWeightChangeKg > 0
                ? `📉 ~${Math.abs(metrics.weeklyWeightChangeKg)} kg/wk loss`
                : `📈 ~${Math.abs(metrics.weeklyWeightChangeKg)} kg/wk gain`}
            </span>
          ) : (
            '⚖️ Neutral balance'
          )}
        </div>
      </div>

      {/* 6. BMI Card */}
      <div className="glass-card p-4 rounded-2xl relative overflow-hidden group transition-all">
        <div className="flex items-center justify-between text-slate-400 dark:text-slate-500 mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider">BMI</span>
          <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Scale className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono">
          {metrics.bmi}
        </div>
        <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-1 truncate">
          {metrics.bmiCategory}
        </div>
      </div>
    </div>
  );
};
