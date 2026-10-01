import React from 'react';
import { Heart, ShieldCheck, Info } from 'lucide-react';

export const DisclaimerFooter: React.FC = () => {
  return (
    <footer className="w-full mt-16 py-8 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Brand & info */}
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              NutriSnap
            </span>
            <span className="text-slate-400">·</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Evidence-based metabolic calculation & AI food recognition
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              Mifflin-St Jeor Equation
            </span>
            <span>·</span>
            <span>7700 kcal ≈ 1 kg fat</span>
          </div>
        </div>

        {/* User requested medical disclaimer */}
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/60 text-center">
          <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-2xl mx-auto leading-relaxed">
            <span className="font-semibold text-slate-500 dark:text-slate-400">Medical Disclaimer:</span>{' '}
            NutriSnap calorie, macronutrient, and deficit estimates are AI-assisted approximations and should not be used as clinical or medical advice. Actual metabolic burn rates vary. Always consult a licensed healthcare professional or registered dietitian for personal nutrition and medical guidance.
          </p>
        </div>
      </div>
    </footer>
  );
};
