import React from 'react';
import { Flame, ArrowUp, ArrowDown, CheckCircle2, AlertTriangle } from 'lucide-react';

interface CircularProgressProps {
  consumed: number;
  target: number;
  remaining: number;
  goal: 'lose' | 'maintain' | 'gain';
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  consumed,
  target,
  remaining,
  goal,
}) => {
  const size = 240;
  const strokeWidth = 18;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const percentage = target > 0 ? Math.min(Math.round((consumed / target) * 100), 200) : 0;
  // Calculate progress stroke, capped at 100% for the main circle
  const progressRatio = target > 0 ? Math.min(consumed / target, 1) : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const isOver = remaining < 0;
  const isNear = remaining >= 0 && remaining <= 200;

  // Ring colors
  let strokeColor = '#10B981'; // emerald-500
  let glowColor = 'rgba(16, 185, 129, 0.25)';

  if (isOver) {
    strokeColor = '#F43F5E'; // rose-500
    glowColor = 'rgba(244, 63, 94, 0.25)';
  } else if (isNear) {
    strokeColor = '#F59E0B'; // amber-500
    glowColor = 'rgba(245, 158, 11, 0.25)';
  }

  return (
    <div className="relative flex flex-col items-center justify-center p-6 glass-card rounded-3xl transition-all">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow effect */}
        <div
          className="absolute inset-4 rounded-full blur-xl pointer-events-none transition-all duration-700"
          style={{ background: glowColor }}
        />

        <svg width={size} height={size} className="transform -rotate-90">
          {/* Background track circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-100 dark:text-slate-800"
            fill="transparent"
          />

          {/* Animated Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />

          {/* Over-target indicator ring if consumed > target */}
          {isOver && (
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius - strokeWidth - 2}
              stroke="#F43F5E"
              strokeWidth={4}
              strokeDasharray="4 4"
              fill="transparent"
              className="animate-spin"
              style={{ animationDuration: '20s' }}
            />
          )}
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
          <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1">
            <Flame className="w-3.5 h-3.5 text-emerald-500" />
            <span>Calories</span>
          </div>

          <div className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white font-mono">
            {consumed.toLocaleString()}
          </div>

          <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
            of <span className="font-semibold text-slate-700 dark:text-slate-300">{target.toLocaleString()}</span> kcal
          </div>

          {/* Status Badge */}
          <div className="mt-3">
            {isOver ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                <AlertTriangle className="w-3 h-3" />
                {Math.abs(remaining)} kcal over
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                <CheckCircle2 className="w-3 h-3" />
                {remaining} kcal left
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Footer stats below ring */}
      <div className="w-full mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-4 text-center">
        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Target Progress</span>
          <div className="text-lg font-bold text-slate-800 dark:text-slate-100 font-mono mt-0.5">
            {percentage}%
          </div>
        </div>
        <div>
          <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">Goal Mode</span>
          <div className="text-sm font-semibold capitalize text-emerald-600 dark:text-emerald-400 mt-1 flex items-center justify-center gap-1">
            {goal === 'lose' && <ArrowDown className="w-3.5 h-3.5" />}
            {goal === 'gain' && <ArrowUp className="w-3.5 h-3.5" />}
            {goal === 'maintain' && <span>⚖️</span>}
            {goal === 'lose' ? 'Deficit' : goal === 'gain' ? 'Surplus' : 'Balance'}
          </div>
        </div>
      </div>
    </div>
  );
};
