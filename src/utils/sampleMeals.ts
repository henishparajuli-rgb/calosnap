export interface SampleMealPreset {
  id: string;
  name: string;
  description: string;
  category: 'Lunch' | 'Dinner' | 'Breakfast' | 'Snack';
  imageUrl: string;
  items: {
    name: string;
    calories_per_100g: number;
    protein_g_per_100g: number;
    carbs_g_per_100g: number;
    fat_g_per_100g: number;
    confidence: 'high' | 'medium' | 'low';
    suggested_weight_g: number;
  }[];
}

export const SAMPLE_MEAL_PRESETS: SampleMealPreset[] = [
  {
    id: 'sample-momo',
    name: 'Steamed Chicken Momos',
    description: 'Fresh steamed dumplings with coriander tomato-sesame dip',
    category: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1625398407796-82650a8c135f?auto=format&fit=crop&w=800&q=80',
    items: [
      {
        name: 'Steamed Chicken Momo (8 pcs)',
        calories_per_100g: 185,
        protein_g_per_100g: 10.2,
        carbs_g_per_100g: 21.5,
        fat_g_per_100g: 6.4,
        confidence: 'high',
        suggested_weight_g: 200,
      },
      {
        name: 'Spiced Tomato Sesame Achar',
        calories_per_100g: 80,
        protein_g_per_100g: 2.2,
        carbs_g_per_100g: 8.5,
        fat_g_per_100g: 4.1,
        confidence: 'high',
        suggested_weight_g: 50,
      },
    ],
  },
  {
    id: 'sample-dal-bhat',
    name: 'Nepali Dal Bhat Tarkari',
    description: 'Steamed fragrant rice, yellow lentil soup, mixed vegetable curry & greens',
    category: 'Lunch',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=800&q=80',
    items: [
      {
        name: 'Steamed Rice (Bhat)',
        calories_per_100g: 130,
        protein_g_per_100g: 2.7,
        carbs_g_per_100g: 28.2,
        fat_g_per_100g: 0.3,
        confidence: 'high',
        suggested_weight_g: 180,
      },
      {
        name: 'Lentil Soup (Dal)',
        calories_per_100g: 95,
        protein_g_per_100g: 6.8,
        carbs_g_per_100g: 14.5,
        fat_g_per_100g: 1.6,
        confidence: 'high',
        suggested_weight_g: 130,
      },
      {
        name: 'Mixed Veg Curry (Tarkari)',
        calories_per_100g: 110,
        protein_g_per_100g: 3.4,
        carbs_g_per_100g: 12.0,
        fat_g_per_100g: 5.5,
        confidence: 'high',
        suggested_weight_g: 120,
      },
      {
        name: 'Saag (Stir-fried Mustard Greens)',
        calories_per_100g: 65,
        protein_g_per_100g: 2.9,
        carbs_g_per_100g: 4.2,
        fat_g_per_100g: 4.0,
        confidence: 'medium',
        suggested_weight_g: 70,
      },
    ],
  },
  {
    id: 'sample-salad',
    name: 'Grilled Chicken & Avocado Bowl',
    description: 'Tender grilled chicken breast, fresh ripe avocado, quinoa, and crisp greens',
    category: 'Dinner',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    items: [
      {
        name: 'Grilled Chicken Breast',
        calories_per_100g: 165,
        protein_g_per_100g: 31.0,
        carbs_g_per_100g: 0.0,
        fat_g_per_100g: 3.6,
        confidence: 'high',
        suggested_weight_g: 140,
      },
      {
        name: 'Fresh Avocado Slices',
        calories_per_100g: 160,
        protein_g_per_100g: 2.0,
        carbs_g_per_100g: 8.5,
        fat_g_per_100g: 14.7,
        confidence: 'high',
        suggested_weight_g: 60,
      },
      {
        name: 'Cooked Quinoa',
        calories_per_100g: 120,
        protein_g_per_100g: 4.4,
        carbs_g_per_100g: 21.3,
        fat_g_per_100g: 1.9,
        confidence: 'high',
        suggested_weight_g: 90,
      },
      {
        name: 'Olive Oil Lemon Dressing',
        calories_per_100g: 450,
        protein_g_per_100g: 0.2,
        carbs_g_per_100g: 3.0,
        fat_g_per_100g: 49.0,
        confidence: 'medium',
        suggested_weight_g: 20,
      },
    ],
  },
  {
    id: 'sample-sel-roti',
    name: 'Sel Roti & Masala Chai',
    description: 'Crisp festive Nepali rice flour donut served with hot spiced milk tea',
    category: 'Snack',
    imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80',
    items: [
      {
        name: 'Crispy Sel Roti (2 pcs)',
        calories_per_100g: 320,
        protein_g_per_100g: 4.5,
        carbs_g_per_100g: 54.0,
        fat_g_per_100g: 10.2,
        confidence: 'high',
        suggested_weight_g: 120,
      },
      {
        name: 'Nepali Spiced Milk Tea (Chiya)',
        calories_per_100g: 60,
        protein_g_per_100g: 2.5,
        carbs_g_per_100g: 8.0,
        fat_g_per_100g: 2.0,
        confidence: 'high',
        suggested_weight_g: 150,
      },
    ],
  },
];
