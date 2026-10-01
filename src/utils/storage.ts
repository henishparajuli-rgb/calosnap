import { UserProfile, FoodLogEntry } from '../types';
import { convertFeetInchesToCm } from './nutritionMath';

const PROFILE_KEY = 'nutrisnap_user_profile';
const MEALS_KEY = 'nutrisnap_food_logs';
const THEME_KEY = 'nutrisnap_theme';

export const DEFAULT_PROFILE: UserProfile = {
  weightKg: 68,
  heightFeet: 5,
  heightInches: 9,
  heightCm: convertFeetInchesToCm(5, 9),
  age: 26,
  sex: 'male',
  activityLevel: 'moderate',
  goal: 'lose',
  updatedAt: new Date().toISOString(),
};

export function getStoredProfile(): UserProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading user profile from storage', e);
    return null;
  }
}

export function saveStoredProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed saving user profile to storage', e);
  }
}

export function getStoredMealLogs(): FoodLogEntry[] {
  try {
    const raw = localStorage.getItem(MEALS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading meal logs from storage', e);
    return [];
  }
}

export function saveStoredMealLogs(logs: FoodLogEntry[]): void {
  try {
    localStorage.setItem(MEALS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed saving meal logs to storage', e);
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatTime(date: Date = new Date()): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function getLogsForDate(logs: FoodLogEntry[], dateStr: string): FoodLogEntry[] {
  return logs.filter((l) => l.date === dateStr);
}

export function getPast7DaysDates(): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    dates.push(`${year}-${month}-${day}`);
  }
  return dates;
}

/**
 * Generate CSV and trigger browser download
 */
export function exportLogsToCSV(logs: FoodLogEntry[]): void {
  if (logs.length === 0) {
    alert('No meal records to export.');
    return;
  }

  const headers = [
    'Date',
    'Time',
    'Meal Type',
    'Food Item',
    'Weight (g)',
    'Calories (kcal)',
    'Protein (g)',
    'Carbs (g)',
    'Fat (g)',
    'Notes',
  ];

  const rows: string[][] = [];

  logs.forEach((log) => {
    log.items.forEach((item) => {
      rows.push([
        log.date,
        log.time,
        log.mealType,
        `"${item.name.replace(/"/g, '""')}"`,
        String(item.weight_g),
        String(item.calculatedCalories),
        String(item.calculatedProtein),
        String(item.calculatedCarbs),
        String(item.calculatedFat),
        `"${(log.notes || '').replace(/"/g, '""')}"`,
      ]);
    });
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `nutrisnap_logs_${getTodayDateString()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Seed high quality demo meals so first-time users can see full charts right away
 */
export function seedSampleData(): { profile: UserProfile; logs: FoodLogEntry[] } {
  const profile = DEFAULT_PROFILE;
  saveStoredProfile(profile);

  const pastDays = getPast7DaysDates();
  const sampleLogs: FoodLogEntry[] = [
    // 6 days ago
    {
      id: 'demo-1',
      timestamp: new Date(Date.now() - 6 * 86400000).toISOString(),
      date: pastDays[0],
      time: '08:30 AM',
      mealType: 'Breakfast',
      totalWeight_g: 220,
      totalCalories: 380,
      totalProtein: 18,
      totalCarbs: 52,
      totalFat: 11,
      summary: 'Rolled Oats with Honey and Almonds',
      items: [
        {
          id: 'item-d1',
          name: 'Rolled Oats & Milk',
          calories_per_100g: 150,
          protein_g_per_100g: 6.5,
          carbs_g_per_100g: 22,
          fat_g_per_100g: 3.8,
          confidence: 'high',
          weight_g: 200,
          calculatedCalories: 300,
          calculatedProtein: 13,
          calculatedCarbs: 44,
          calculatedFat: 7.6,
        },
        {
          id: 'item-d2',
          name: 'Almonds & Honey',
          calories_per_100g: 400,
          protein_g_per_100g: 12.5,
          carbs_g_per_100g: 40,
          fat_g_per_100g: 17,
          confidence: 'high',
          weight_g: 20,
          calculatedCalories: 80,
          calculatedProtein: 2.5,
          calculatedCarbs: 8,
          calculatedFat: 3.4,
        },
      ],
    },
    // Today's lunch sample
    {
      id: 'demo-today-lunch',
      timestamp: new Date().toISOString(),
      date: pastDays[6],
      time: '01:15 PM',
      mealType: 'Lunch',
      totalWeight_g: 350,
      totalCalories: 585,
      totalProtein: 28,
      totalCarbs: 84,
      totalFat: 14.5,
      summary: 'Nepali Dal Bhat Tarkari with Saag',
      items: [
        {
          id: 'item-dt1',
          name: 'Steamed Rice (Bhat)',
          calories_per_100g: 130,
          protein_g_per_100g: 2.7,
          carbs_g_per_100g: 28,
          fat_g_per_100g: 0.3,
          confidence: 'high',
          weight_g: 180,
          calculatedCalories: 234,
          calculatedProtein: 4.9,
          calculatedCarbs: 50.4,
          calculatedFat: 0.5,
        },
        {
          id: 'item-dt2',
          name: 'Yellow Lentil Dal',
          calories_per_100g: 95,
          protein_g_per_100g: 6.8,
          carbs_g_per_100g: 14.2,
          fat_g_per_100g: 1.5,
          confidence: 'high',
          weight_g: 120,
          calculatedCalories: 114,
          calculatedProtein: 8.2,
          calculatedCarbs: 17.0,
          calculatedFat: 1.8,
        },
        {
          id: 'item-dt3',
          name: 'Chicken Tarkari (Curry)',
          calories_per_100g: 165,
          protein_g_per_100g: 14.5,
          carbs_g_per_100g: 5.2,
          fat_g_per_100g: 10.2,
          confidence: 'high',
          weight_g: 140,
          calculatedCalories: 231,
          calculatedProtein: 20.3,
          calculatedCarbs: 7.3,
          calculatedFat: 14.3,
        },
      ],
    },
  ];

  saveStoredMealLogs(sampleLogs);
  return { profile, logs: sampleLogs };
}
