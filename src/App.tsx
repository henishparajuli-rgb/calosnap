import React, { useState, useEffect, useMemo } from 'react';
import {
  Flame,
  Camera,
  Calendar,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Award,
  ChevronRight,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { UserProfile, FoodLogEntry, NutritionMetrics } from './types';
import { computeNutritionMetrics } from './utils/nutritionMath';
import {
  getStoredProfile,
  saveStoredProfile,
  getStoredMealLogs,
  saveStoredMealLogs,
  getTodayDateString,
  getLogsForDate,
  exportLogsToCSV,
  seedSampleData,
  DEFAULT_PROFILE,
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { CircularProgress } from './components/CircularProgress';
import { DashboardCards } from './components/DashboardCards';
import { MacroDonutChart } from './components/MacroDonutChart';
import { HistoryBarChart } from './components/HistoryBarChart';
import { MealLogSection } from './components/MealLogSection';
import { ProfileModal } from './components/ProfileModal';
import { PhotoCaptureModal } from './components/PhotoCaptureModal';
import { DisclaimerFooter } from './components/DisclaimerFooter';

export default function App() {
  // Theme state
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nutrisnap_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // User profile
  const [profile, setProfile] = useState<UserProfile | null>(() => getStoredProfile());

  // Meal logs
  const [logs, setLogs] = useState<FoodLogEntry[]>(() => {
    const stored = getStoredMealLogs();
    if (stored.length === 0) {
      // Seed with initial realistic data for instant testability
      const seeded = seedSampleData();
      return seeded.logs;
    }
    return stored;
  });

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);
  const [isOnboarding, setIsOnboarding] = useState<boolean>(false);
  const [isPhotoCaptureOpen, setIsPhotoCaptureOpen] = useState<boolean>(false);
  const [editingMeal, setEditingMeal] = useState<FoodLogEntry | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState<boolean>(false);

  // Sync theme
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('nutrisnap_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('nutrisnap_theme', 'light');
    }
  }, [darkMode]);

  // First time onboarding check
  useEffect(() => {
    if (!profile) {
      const stored = getStoredProfile();
      if (!stored) {
        setIsOnboarding(true);
        setIsProfileModalOpen(true);
      } else {
        setProfile(stored);
      }
    }
  }, [profile]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  // Today's meal logs
  const todayStr = getTodayDateString();
  const todayLogs = useMemo(() => {
    return getLogsForDate(logs, todayStr);
  }, [logs, todayStr]);

  // Compute total macros consumed today
  const consumedCalories = todayLogs.reduce((acc, curr) => acc + curr.totalCalories, 0);
  const consumedProtein = Math.round(todayLogs.reduce((acc, curr) => acc + curr.totalProtein, 0) * 10) / 10;
  const consumedCarbs = Math.round(todayLogs.reduce((acc, curr) => acc + curr.totalCarbs, 0) * 10) / 10;
  const consumedFat = Math.round(todayLogs.reduce((acc, curr) => acc + curr.totalFat, 0) * 10) / 10;

  // Active user profile (fallback to default if onboarding)
  const activeProfile = profile || DEFAULT_PROFILE;

  // Compute Mifflin-St Jeor nutrition metrics
  const metrics: NutritionMetrics = useMemo(() => {
    return computeNutritionMetrics(
      activeProfile,
      consumedCalories,
      consumedProtein,
      consumedCarbs,
      consumedFat
    );
  }, [activeProfile, consumedCalories, consumedProtein, consumedCarbs, consumedFat]);

  // Profile Save
  const handleSaveProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    saveStoredProfile(newProfile);
    setIsProfileModalOpen(false);
    setIsOnboarding(false);
  };

  // Meal Log save or edit
  const handleSaveMeal = (entry: FoodLogEntry) => {
    setLogs((prev) => {
      const exists = prev.some((l) => l.id === entry.id);
      let updated: FoodLogEntry[];
      if (exists) {
        updated = prev.map((l) => (l.id === entry.id ? entry : l));
      } else {
        updated = [entry, ...prev];
      }
      saveStoredMealLogs(updated);
      return updated;
    });
    setEditingMeal(null);
  };

  // Meal Log Delete
  const handleDeleteMeal = (id: string) => {
    setLogs((prev) => {
      const updated = prev.filter((l) => l.id !== id);
      saveStoredMealLogs(updated);
      return updated;
    });
  };

  // Reset Today's entries
  const handleConfirmResetToday = () => {
    setLogs((prev) => {
      const updated = prev.filter((l) => l.date !== todayStr);
      saveStoredMealLogs(updated);
      return updated;
    });
    setConfirmResetOpen(false);
  };

  // Export CSV
  const handleExportCSV = () => {
    exportLogsToCSV(logs);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Navigation */}
      <Navbar
        profile={profile}
        darkMode={darkMode}
        onToggleDarkMode={toggleDarkMode}
        onOpenProfile={() => {
          setIsOnboarding(false);
          setIsProfileModalOpen(true);
        }}
        onOpenPhotoCapture={() => {
          setEditingMeal(null);
          setIsPhotoCaptureOpen(true);
        }}
        onExportCSV={handleExportCSV}
        onResetDay={() => setConfirmResetOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Header Greeting & Today's Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Daily Nutrition Dashboard
              </h1>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {activeProfile.goal === 'lose'
                  ? 'Fat Loss Mode'
                  : activeProfile.goal === 'gain'
                  ? 'Muscle Gain'
                  : 'Maintenance'}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Today: {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              <span>·</span>
              <span>Mifflin-St Jeor TDEE: {metrics.tdee} kcal</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingMeal(null);
                setIsPhotoCaptureOpen(true);
              }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Analyze Food Photo</span>
            </button>
          </div>
        </div>

        {/* 6 Key Metabolic Cards */}
        <DashboardCards metrics={metrics} profile={activeProfile} />

        {/* Charts & Ring Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* 1. Animated Circular Progress Ring */}
          <CircularProgress
            consumed={metrics.consumedToday}
            target={metrics.dailyTarget}
            remaining={metrics.remainingToday}
            goal={activeProfile.goal}
          />

          {/* 2. Macro Breakdown Donut Chart */}
          <MacroDonutChart
            proteinG={consumedProtein}
            carbsG={consumedCarbs}
            fatG={consumedFat}
            targetProteinG={metrics.targetProteinG}
            targetCarbsG={metrics.targetCarbsG}
            targetFatG={metrics.targetFatG}
            darkMode={darkMode}
          />

          {/* 3. 7-Day History Bar Chart */}
          <div className="md:col-span-2 lg:col-span-1">
            <HistoryBarChart
              logs={logs}
              dailyTarget={metrics.dailyTarget}
              tdee={metrics.tdee}
              darkMode={darkMode}
            />
          </div>
        </div>

        {/* Today's Meals Section */}
        <MealLogSection
          logs={todayLogs}
          onDeleteLog={handleDeleteMeal}
          onEditLog={(entry) => {
            setEditingMeal(entry);
            setIsPhotoCaptureOpen(true);
          }}
          onOpenPhotoCapture={() => {
            setEditingMeal(null);
            setIsPhotoCaptureOpen(true);
          }}
        />
      </main>

      {/* Footer Disclaimer */}
      <DisclaimerFooter />

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onSave={handleSaveProfile}
        currentProfile={profile}
        isOnboarding={isOnboarding}
      />

      {/* Photo Capture & AI Analysis Modal */}
      <PhotoCaptureModal
        isOpen={isPhotoCaptureOpen}
        onClose={() => {
          setIsPhotoCaptureOpen(false);
          setEditingMeal(null);
        }}
        onSaveMeal={handleSaveMeal}
        editingMeal={editingMeal}
      />

      {/* Confirm Reset Day Dialog */}
      {confirmResetOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4">
              <RotateCcw className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Reset Today's Calorie Log?
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-6 leading-relaxed">
              This will remove all food items logged for today ({todayStr}). Your historical logs from prior days and user profile will be preserved.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmResetOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResetToday}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/25 transition cursor-pointer"
              >
                Reset Today's Meals
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
