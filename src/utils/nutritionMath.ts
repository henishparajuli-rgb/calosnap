import { UserProfile, NutritionMetrics, ActivityLevel, Goal } from '../types';

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, { multiplier: number; label: string; description: string }> = {
  sedentary: {
    multiplier: 1.2,
    label: 'Sedentary',
    description: 'Little or no exercise, desk job',
  },
  light: {
    multiplier: 1.375,
    label: 'Lightly Active',
    description: 'Light exercise or sports 1–3 days/week',
  },
  moderate: {
    multiplier: 1.55,
    label: 'Moderately Active',
    description: 'Moderate exercise or sports 3–5 days/week',
  },
  very_active: {
    multiplier: 1.725,
    label: 'Very Active',
    description: 'Hard exercise or sports 6–7 days/week',
  },
  athlete: {
    multiplier: 1.9,
    label: 'Athlete / Physical Labor',
    description: 'Very hard daily exercise, 2x day training or physical job',
  },
};

export const GOAL_CONFIG: Record<Goal, { label: string; offset: number; description: string }> = {
  lose: {
    label: 'Lose Fat & Weight',
    offset: -500,
    description: 'Moderate 500 kcal daily deficit for steady fat loss (~0.5 kg/week)',
  },
  maintain: {
    label: 'Maintain Weight',
    offset: 0,
    description: 'Caloric balance to sustain current body mass and vitality',
  },
  gain: {
    label: 'Gain Lean Muscle',
    offset: +300,
    description: 'Controlled 300 kcal lean surplus to support muscle hypertrophy',
  },
};

/**
 * Convert feet and inches to centimeters: cm = (ft * 12 + in) * 2.54
 */
export function convertFeetInchesToCm(feet: number, inches: number): number {
  const totalInches = (Number(feet) || 0) * 12 + (Number(inches) || 0);
  return Math.round(totalInches * 2.54 * 10) / 10;
}

/**
 * Convert cm back to feet & inches
 */
export function convertCmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

/**
 * Mifflin-St Jeor BMR Equation:
 * Male: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) + 5
 * Female: (10 × weight_kg) + (6.25 × height_cm) - (5 × age) - 161
 */
export function calculateBMR(weightKg: number, heightCm: number, age: number, sex: 'male' | 'female'): number {
  if (!weightKg || !heightCm || !age) return 1600;
  
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? Math.round(base + 5) : Math.round(base - 161);
}

/**
 * Calculate TDEE (Total Daily Energy Expenditure) = BMR * activity multiplier
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const mult = ACTIVITY_MULTIPLIERS[activityLevel]?.multiplier || 1.2;
  return Math.round(bmr * mult);
}

/**
 * Calculate daily target calorie intake:
 * Lose = TDEE - 500 (never below BMR or 1200 kcal)
 * Maintain = TDEE
 * Gain = TDEE + 300
 */
export function calculateDailyTarget(bmr: number, tdee: number, goal: Goal): number {
  if (goal === 'maintain') {
    return tdee;
  }
  if (goal === 'gain') {
    return tdee + 300;
  }
  // Lose weight: TDEE - 500, with minimum floor of max(BMR, 1200)
  const floor = Math.max(bmr, 1200);
  return Math.max(tdee - 500, floor);
}

/**
 * Calculate BMI = weight (kg) / [height (m)]^2
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese';
  color: string;
} {
  if (!weightKg || !heightCm) {
    return { bmi: 22.0, category: 'Normal weight', color: 'emerald' };
  }
  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  if (bmi < 18.5) {
    return { bmi, category: 'Underweight', color: 'amber' };
  } else if (bmi <= 24.9) {
    return { bmi, category: 'Normal weight', color: 'emerald' };
  } else if (bmi <= 29.9) {
    return { bmi, category: 'Overweight', color: 'orange' };
  } else {
    return { bmi, category: 'Obese', color: 'rose' };
  }
}

/**
 * Compute full nutritional metrics for the dashboard
 */
export function computeNutritionMetrics(
  profile: UserProfile,
  consumedToday: number,
  consumedProteinG = 0,
  consumedCarbsG = 0,
  consumedFatG = 0
): NutritionMetrics {
  const bmr = calculateBMR(profile.weightKg, profile.heightCm, profile.age, profile.sex);
  const tdee = calculateTDEE(bmr, profile.activityLevel);
  const dailyTarget = calculateDailyTarget(bmr, tdee, profile.goal);
  const remainingToday = dailyTarget - consumedToday;

  // Calorie deficit/surplus vs maintenance TDEE (positive = deficit, negative = surplus)
  const deficitSurplus = tdee - consumedToday;
  const deficitSurplusVsTarget = dailyTarget - consumedToday;

  // Estimated weekly weight change: 7700 kcal ≈ 1 kg fat
  // Based on current daily deficit/surplus relative to maintenance:
  // e.g. deficit = +500 kcal/day => 3500 kcal/week => -0.45 kg loss
  const weeklyWeightChangeKg = Math.round(((deficitSurplus * 7) / 7700) * 100) / 100;

  const { bmi, category } = calculateBMI(profile.weightKg, profile.heightCm);

  // Target macro distributions (grams)
  // Lose: 30% Protein, 40% Carbs, 30% Fat
  // Maintain: 25% Protein, 50% Carbs, 25% Fat
  // Gain: 30% Protein, 50% Carbs, 20% Fat
  let proteinRatio = 0.25;
  let carbsRatio = 0.5;
  let fatRatio = 0.25;

  if (profile.goal === 'lose') {
    proteinRatio = 0.3;
    carbsRatio = 0.4;
    fatRatio = 0.3;
  } else if (profile.goal === 'gain') {
    proteinRatio = 0.3;
    carbsRatio = 0.5;
    fatRatio = 0.2;
  }

  const targetProteinG = Math.round((dailyTarget * proteinRatio) / 4);
  const targetCarbsG = Math.round((dailyTarget * carbsRatio) / 4);
  const targetFatG = Math.round((dailyTarget * fatRatio) / 9);

  return {
    bmr,
    tdee,
    dailyTarget,
    consumedToday,
    remainingToday,
    deficitSurplus,
    deficitSurplusVsTarget,
    bmi,
    bmiCategory: category,
    weeklyWeightChangeKg,
    targetProteinG,
    targetCarbsG,
    targetFatG,
  };
}
