import React from 'react';
import { Camera, Sun, Moon, Download, RotateCcw, User, Flame, Activity } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  profile: UserProfile | null;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onOpenProfile: () => void;
  onOpenPhotoCapture: () => void;
  onExportCSV: () => void;
  onResetDay: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  profile,
  darkMode,
  onToggleDarkMode,
  onOpenProfile,
  onOpenPhotoCapture,
  onExportCSV,
  onResetDay,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/25 ring-2 ring-emerald-500/20 text-white">
            <Flame className="w-5 h-5 fill-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                NutriSnap
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                AI Vision
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
              Smart Calorie & Deficit Tracker
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Snap Food Primary CTA */}
          <button
            onClick={onOpenPhotoCapture}
            className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold shadow-md shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Camera className="w-4 h-4" />
            <span className="hidden xs:inline">Snap Food</span>
          </button>

          {/* User Profile trigger badge */}
          <button
            onClick={onOpenProfile}
            title="Edit User Profile & Goal"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 text-xs font-medium transition cursor-pointer"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <User className="w-3.5 h-3.5" />
            </div>
            {profile ? (
              <span className="hidden md:inline font-medium">
                {profile.weightKg} kg · {profile.goal.toUpperCase()}
              </span>
            ) : (
              <span className="text-emerald-600 font-semibold">Set Profile</span>
            )}
          </button>

          {/* Export CSV */}
          <button
            onClick={onExportCSV}
            title="Export meal history to CSV"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
          </button>

          {/* Reset Today */}
          <button
            onClick={onResetDay}
            title="Reset Today's Meals"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>
      </div>
    </header>
  );
};
