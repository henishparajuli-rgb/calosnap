export type Sex = 'male' | 'female';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_active' | 'athlete';

export type Goal = 'lose' | 'maintain' | 'gain';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface UserProfile {
  weightKg: number;
  heightFeet: number;
  heightInches: number;
  heightCm: number;
  age: number;
  sex: Sex;
  activityLevel: ActivityLevel;
  goal: Goal;
  updatedAt: string;
}

export interface DetectedFoodItem {
  id: string;
  name: string;
  calories_per_100g: number;
  protein_g_per_100g: number;
  carbs_g_per_100g: number;
  fat_g_per_100g: number;
  confidence: 'low' | 'medium' | 'high';
  weight_g: number;
  calculatedCalories: number;
  calculatedProtein: number;
  calculatedCarbs: number;
  calculatedFat: number;
}

export interface FoodLogEntry {
  id: string;
  timestamp: string; // ISO format
  date: string; // YYYY-MM-DD
  time: string; // e.g. 1:15 PM
  mealType: MealType;
  imageUrl?: string;
  items: DetectedFoodItem[];
  totalWeight_g: number;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  summary?: string;
  notes?: string;
}

export interface NutritionMetrics {
  bmr: number;
  tdee: number;
  dailyTarget: number;
  consumedToday: number;
  remainingToday: number;
  deficitSurplus: number; // TDEE - consumedToday (positive = deficit, negative = surplus)
  deficitSurplusVsTarget: number; // dailyTarget - consumedToday
  bmi: number;
  bmiCategory: 'Underweight' | 'Normal weight' | 'Overweight' | 'Obese';
  weeklyWeightChangeKg: number;
  targetProteinG: number;
  targetCarbsG: number;
  targetFatG: number;
}
