# NutriSnap - AI Calorie & Deficit Tracker

NutriSnap is a full-stack web application designed for mobile and desktop that uses AI vision models to recognize food on your plate, calculate nutritional macros per 100 grams, and track daily caloric deficit/surplus using the clinical Mifflin-St Jeor equation.

---

## 📁 Full Folder Structure

```
├── .env.example                     # Environment variable declarations (API keys & App URL)
├── .gitignore
├── index.html                       # HTML entry point with Google Fonts (Inter & Poppins)
├── metadata.json                    # Application metadata and camera permissions
├── package.json                     # NPM dependencies and scripts
├── tsconfig.json                    # TypeScript compiler configuration
├── vite.config.ts                   # Vite configuration
├── server.ts                        # Express backend proxy for food vision analysis & static file serving
└── src/
    ├── main.tsx                     # React 19 root entry
    ├── App.tsx                      # Primary dashboard layout and application state
    ├── index.css                    # Tailwind CSS v4 styling, scanner laser animations, glassmorphism
    ├── types.ts                     # TypeScript data interfaces (UserProfile, FoodLogEntry, etc.)
    ├── components/
    │   ├── Navbar.tsx               # Header with profile status, camera CTA, CSV export, theme toggle
    │   ├── CircularProgress.tsx     # Animated SVG calorie intake ring with target & deficit status
    │   ├── DashboardCards.tsx       # 6 cards: BMR, TDEE, Consumed, Remaining, Deficit/Surplus, BMI
    │   ├── MacroDonutChart.tsx      # Chart.js donut chart showing Protein, Carbs, Fat breakdown
    │   ├── HistoryBarChart.tsx      # Chart.js 7-day intake vs daily target bar chart
    │   ├── MealLogSection.tsx       # Collapsible today's meal list with thumbnails, macros, edit/delete
    │   ├── PhotoCaptureModal.tsx    # Live camera stream / upload with animated scanner & editable review
    │   ├── ProfileModal.tsx         # Setup wizard with height conversion (ft+in to cm) & live BMR preview
    │   └── DisclaimerFooter.tsx     # Evidence-based formulas citation and medical disclaimer
    └── utils/
        ├── nutritionMath.ts         # Mifflin-St Jeor equation, TDEE, BMI, and macro targets
        ├── storage.ts               # LocalStorage persistence, CSV export, and sample data seeding
        └── sampleMeals.ts           # Curated Nepali and global dishes for instant 1-click test analysis
```

---

## 🧮 Evidence-Based Caloric Formulas

### 1. Basal Metabolic Rate (BMR) - Mifflin-St Jeor Equation
- **Male**: $(10 \times \text{kg}) + (6.25 \times \text{cm}) - (5 \times \text{age}) + 5$
- **Female**: $(10 \times \text{kg}) + (6.25 \times \text{cm}) - (5 \times \text{age}) - 161$
- **Height conversion**: $\text{cm} = ((\text{feet} \times 12) + \text{inches}) \times 2.54$

### 2. Total Daily Energy Expenditure (TDEE)
$$\text{TDEE} = \text{BMR} \times \text{Activity Multiplier}$$
- Sedentary: $\times 1.2$ (desk job, little to no exercise)
- Light: $\times 1.375$ (light exercise 1–3 days/week)
- Moderate: $\times 1.55$ (moderate workouts 3–5 days/week)
- Very Active: $\times 1.725$ (hard training 6–7 days/week)
- Athlete: $\times 1.9$ (physical labor or twice-a-day training)

### 3. Daily Caloric Target & Deficit
- **Fat Loss**: $\text{TDEE} - 500\text{ kcal}$ (with safety floor: never below BMR or 1200 kcal)
- **Maintain**: $\text{TDEE}$
- **Muscle Gain**: $\text{TDEE} + 300\text{ kcal}$
- **Deficit / Surplus**: $\text{TDEE} - \text{Total Calories Consumed Today}$
- **Weekly Weight Change Estimate**: $(\text{Daily Deficit} \times 7) / 7700\text{ kg}$ (since $7700\text{ kcal} \approx 1\text{ kg}$ fat)

---

## 🚀 Setup & Run Instructions

### Step 1: Install Dependencies
Open your terminal in the project root directory and run:
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
Inside `.env`, ensure your API key is provided:
- `GEMINI_API_KEY`: Injected automatically in Google AI Studio or insert your Gemini API Key from Google AI Studio.
- `ANTHROPIC_API_KEY`: *(Optional)* If you prefer Claude Sonnet vision analysis, provide your Anthropic key.

### Step 3: Run the Development Server
```bash
npm run dev
```
The server will start at `http://localhost:3000` with the Express backend proxy and Vite frontend running together.

### Step 4: Build for Production
```bash
npm run build
npm run start
```

---

## ⚕️ Medical Disclaimer
NutriSnap calorie and nutrient estimates are AI-assisted approximations and should not be used as clinical or medical advice. Consult a healthcare professional or registered dietitian for personal medical decisions.
