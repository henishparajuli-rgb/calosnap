import React, { useState } from 'react';
import {
  Utensils,
  Clock,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  Camera,
  Plus,
  Flame,
} from 'lucide-react';
import { FoodLogEntry } from '../types';

interface MealLogSectionProps {
  logs: FoodLogEntry[];
  onDeleteLog: (id: string) => void;
  onEditLog: (entry: FoodLogEntry) => void;
  onOpenPhotoCapture: () => void;
}

export const MealLogSection: React.FC<MealLogSectionProps> = ({
  logs,
  onDeleteLog,
  onEditLog,
  onOpenPhotoCapture,
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const categories = ['All', 'Breakfast', 'Lunch', 'Dinner', 'Snack'];

  const filteredLogs = selectedCategory === 'All'
    ? logs
    : logs.filter((l) => l.mealType === selectedCategory);

  const filteredCalories = filteredLogs.reduce((acc, curr) => acc + curr.totalCalories, 0);

  const getMealBadgeColor = (type: string) => {
    switch (type) {
      case 'Breakfast':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Lunch':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Dinner':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800';
    }
  };

  return (
    <div className="glass-card p-6 rounded-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <Utensils className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Today's Meals & Snacks
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {logs.length} logged {logs.length === 1 ? 'entry' : 'entries'} today
              {selectedCategory !== 'All' && ` (${filteredLogs.length} ${selectedCategory})`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenPhotoCapture}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Food</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-4 mb-4 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => {
            const count = cat === 'All' ? logs.length : logs.filter((l) => l.mealType === cat).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? 'bg-emerald-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isSelected
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {selectedCategory !== 'All' && (
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {selectedCategory} Total: <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">{filteredCalories} kcal</span>
          </div>
        )}
      </div>

      {filteredLogs.length === 0 ? (
        <div className="text-center py-12 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center">
            <Camera className="w-8 h-8" />
          </div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
            No meals logged today yet
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
            Snap a photo of your breakfast, lunch, or snack. NutriSnap will analyze the plate, estimate macros, and track your daily deficit.
          </p>
          <button
            onClick={onOpenPhotoCapture}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer"
          >
            Snap or Upload Food Photo
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div
                key={entry.id}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 overflow-hidden hover:border-emerald-300 dark:hover:border-emerald-800 transition"
              >
                {/* Header Row */}
                <div className="p-3.5 sm:p-4 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center">
                      {entry.imageUrl ? (
                        <img
                          src={entry.imageUrl}
                          alt={entry.summary || 'Meal'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Utensils className="w-6 h-6 text-slate-400" />
                      )}
                    </div>

                    {/* Meal details */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getMealBadgeColor(
                            entry.mealType
                          )}`}
                        >
                          {entry.mealType}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" />
                          {entry.time}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate mt-1">
                        {entry.summary || entry.items.map((i) => i.name).join(', ')}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {entry.totalWeight_g}g total ·{' '}
                        <span className="text-indigo-600 dark:text-indigo-400 font-medium">P: {entry.totalProtein}g</span> ·{' '}
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">C: {entry.totalCarbs}g</span> ·{' '}
                        <span className="text-amber-600 dark:text-amber-400 font-medium">F: {entry.totalFat}g</span>
                      </p>
                    </div>
                  </div>

                  {/* Calories & Actions */}
                  <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                    <div className="text-right">
                      <div className="flex items-center justify-end gap-1 text-base font-extrabold text-slate-900 dark:text-white font-mono">
                        <Flame className="w-4 h-4 text-emerald-500" />
                        <span>{entry.totalCalories}</span>
                      </div>
                      <span className="text-[10px] text-slate-400">kcal</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onEditLog(entry)}
                        title="Edit Food Details"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteLog(entry.id)}
                        title="Delete Entry"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => toggleExpand(entry.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Collapsible item-by-item breakdown */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Plate Breakdown
                    </div>
                    {entry.items.map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {item.name}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                            {item.weight_g}g · {item.calories_per_100g} kcal/100g
                          </div>
                        </div>
                        <div className="text-right font-mono">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.calculatedCalories} kcal
                          </div>
                          <div className="text-[10px] text-slate-400">
                            P:{item.calculatedProtein}g C:{item.calculatedCarbs}g F:{item.calculatedFat}g
                          </div>
                        </div>
                      </div>
                    ))}
                    {entry.notes && (
                      <p className="text-xs italic text-slate-500 dark:text-slate-400 pt-1">
                        Note: {entry.notes}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
