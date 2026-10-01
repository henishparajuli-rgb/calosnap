import React, { useState, useEffect } from 'react';
import { X, Check, Activity, Target, User, Scale, Ruler, Sparkles } from 'lucide-react';
import { UserProfile, Sex, ActivityLevel, Goal } from '../types';
import {
  ACTIVITY_MULTIPLIERS,
  GOAL_CONFIG,
  convertFeetInchesToCm,
  calculateBMR,
  calculateTDEE,
  calculateDailyTarget,
  calculateBMI,
} from '../utils/nutritionMath';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: UserProfile) => void;
  currentProfile: UserProfile | null;
  isOnboarding?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  onSave,
  currentProfile,
  isOnboarding = false,
}) => {
  const [weightKg, setWeightKg] = useState<number>(currentProfile?.weightKg || 68);
  const [heightFeet, setHeightFeet] = useState<number>(currentProfile?.heightFeet || 5);
  const [heightInches, setHeightInches] = useState<number>(currentProfile?.heightInches || 9);
  const [age, setAge] = useState<number>(currentProfile?.age || 26);
  const [sex, setSex] = useState<Sex>(currentProfile?.sex || 'male');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(currentProfile?.activityLevel || 'moderate');
  const [goal, setGoal] = useState<Goal>(currentProfile?.goal || 'lose');

  useEffect(() => {
    if (currentProfile) {
      setWeightKg(currentProfile.weightKg);
      setHeightFeet(currentProfile.heightFeet);
      setHeightInches(currentProfile.heightInches);
      setAge(currentProfile.age);
      setSex(currentProfile.sex);
      setActivityLevel(currentProfile.activityLevel);
      setGoal(currentProfile.goal);
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  // Real-time calculations
  const heightCm = convertFeetInchesToCm(heightFeet, heightInches);
  const liveBMR = calculateBMR(weightKg, heightCm, age, sex);
  const liveTDEE = calculateTDEE(liveBMR, activityLevel);
  const liveTarget = calculateDailyTarget(liveBMR, liveTDEE, goal);
  const { bmi, category: bmiCategory, color: bmiColor } = calculateBMI(weightKg, heightCm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: UserProfile = {
      weightKg: Math.max(25, Math.min(300, Number(weightKg) || 68)),
      heightFeet: Math.max(3, Math.min(8, Number(heightFeet) || 5)),
      heightInches: Math.max(0, Math.min(11, Number(heightInches) || 9)),
      heightCm,
      age: Math.max(12, Math.min(120, Number(age) || 26)),
      sex,
      activityLevel,
      goal,
      updatedAt: new Date().toISOString(),
    };
    onSave(updatedProfile);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {isOnboarding ? 'Welcome to NutriSnap! Setup Profile' : 'Edit Physical Profile & Goals'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Calculated using the clinical Mifflin-St Jeor equation
              </p>
            </div>
          </div>
          {!isOnboarding && (
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Sex and Age */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Biological Sex (for MSJ Formula)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSex('male')}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                    sex === 'male'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  Male
                </button>
                <button
                  type="button"
                  onClick={() => setSex('female')}
                  className={`py-2.5 px-4 rounded-xl text-sm font-semibold border flex items-center justify-center gap-2 transition cursor-pointer ${
                    sex === 'female'
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-500/25'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  Female
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                Age (years)
              </label>
              <input
                type="number"
                min="12"
                max="120"
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                required
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Body Weight and Height */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-emerald-500" />
                  Body Weight (kg)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="25"
                  max="300"
                  value={weightKg}
                  onChange={(e) => setWeightKg(parseFloat(e.target.value) || 0)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <span className="absolute right-4 top-2.5 text-xs text-slate-400 font-semibold">
                  {Math.round(weightKg * 2.20462)} lbs
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                <span className="flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-emerald-500" />
                  Height (Feet + Inches)
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="relative">
                  <input
                    type="number"
                    min="3"
                    max="7"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(parseInt(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">ft</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="11"
                    value={heightInches}
                    onChange={(e) => setHeightInches(parseInt(e.target.value) || 0)}
                    required
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold">in</span>
                </div>
              </div>
              <div className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                Converted: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{heightCm} cm</span>
              </div>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-500" />
                Physical Activity Level
              </span>
            </label>
            <div className="space-y-2">
              {(Object.keys(ACTIVITY_MULTIPLIERS) as ActivityLevel[]).map((level) => {
                const item = ACTIVITY_MULTIPLIERS[level];
                const isSelected = activityLevel === level;
                return (
                  <div
                    key={level}
                    onClick={() => setActivityLevel(level)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 ring-1 ring-emerald-500'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900 dark:text-white">{item.label}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                          ×{item.multiplier}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500 text-white'
                          : 'border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Caloric Goal */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-emerald-500" />
                Primary Goal
              </span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(Object.keys(GOAL_CONFIG) as Goal[]).map((g) => {
                const cfg = GOAL_CONFIG[g];
                const isSelected = goal === g;
                return (
                  <div
                    key={g}
                    onClick={() => setGoal(g)}
                    className={`p-3.5 rounded-xl border text-center transition cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/25'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <div className="text-sm font-bold">{cfg.label}</div>
                    <div
                      className={`text-xs mt-1 font-mono ${
                        isSelected ? 'text-emerald-100' : 'text-emerald-600 dark:text-emerald-400'
                      }`}
                    >
                      {cfg.offset === 0 ? 'TDEE (0 kcal)' : `${cfg.offset > 0 ? '+' : ''}${cfg.offset} kcal/day`}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Calculated Stats Preview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-slate-800/90 dark:to-slate-800/40 border border-emerald-200 dark:border-emerald-900/50">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                Calculated Metabolic Profile Preview
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">BMR (Mifflin)</div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-100">{liveBMR}</div>
                <div className="text-[10px] text-slate-400">kcal at rest</div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">TDEE</div>
                <div className="text-base font-bold text-teal-600 dark:text-teal-400">{liveTDEE}</div>
                <div className="text-[10px] text-slate-400">maintenance</div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl ring-2 ring-emerald-500/30">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Daily Target</div>
                <div className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{liveTarget}</div>
                <div className="text-[10px] text-slate-400">kcal/day goal</div>
              </div>
              <div className="bg-white/80 dark:bg-slate-900/60 p-2.5 rounded-xl">
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">BMI</div>
                <div className="text-base font-bold text-slate-800 dark:text-slate-100">{bmi}</div>
                <div className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">{bmiCategory}</div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            {!isOnboarding && (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 active:scale-95 transition cursor-pointer"
            >
              {isOnboarding ? 'Save & Start Tracking' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
