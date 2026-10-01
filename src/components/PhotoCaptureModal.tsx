import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  AlertCircle,
  Check,
  Scale,
  Plus,
  Trash2,
  Sliders,
  ChevronRight,
  Info,
  Clock,
  Layers,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DetectedFoodItem, FoodLogEntry, MealType } from '../types';
import { SAMPLE_MEAL_PRESETS, SampleMealPreset } from '../utils/sampleMeals';
import { formatTime, getTodayDateString } from '../utils/storage';

interface PhotoCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveMeal: (meal: FoodLogEntry) => void;
  editingMeal?: FoodLogEntry | null;
}

export const PhotoCaptureModal: React.FC<PhotoCaptureModalProps> = ({
  isOpen,
  onClose,
  onSaveMeal,
  editingMeal,
}) => {
  // Step state: 'select' | 'analyzing' | 'review'
  const [step, setStep] = useState<'select' | 'analyzing' | 'review'>('select');

  // Input modes
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Image data
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [mealSummary, setMealSummary] = useState<string>('');
  const [mealType, setMealType] = useState<MealType>('Lunch');
  const [mealNotes, setMealNotes] = useState<string>('');

  // Default portion weight selection
  const [defaultWeightG, setDefaultWeightG] = useState<number>(200);

  // Detected food items list (editable)
  const [detectedItems, setDetectedItems] = useState<DetectedFoodItem[]>([]);

  // AI status & errors
  const [analyzingStatus, setAnalyzingStatus] = useState<string>('Initializing vision model...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [aiProvider, setAiProvider] = useState<string>('');

  // DOM Refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Handle edit mode
  useEffect(() => {
    if (editingMeal) {
      setPreviewImage(editingMeal.imageUrl || null);
      setMealSummary(editingMeal.summary || '');
      setMealType(editingMeal.mealType);
      setMealNotes(editingMeal.notes || '');
      setDetectedItems(editingMeal.items || []);
      setStep('review');
    } else {
      resetState();
    }
  }, [editingMeal, isOpen]);

  // Clean up media stream when closed
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const resetState = () => {
    stopCamera();
    setStep('select');
    setPreviewImage(null);
    setMealSummary('');
    setMealType(determineMealTypeByTime());
    setMealNotes('');
    setDefaultWeightG(200);
    setDetectedItems([]);
    setErrorMessage(null);
  };

  const determineMealTypeByTime = (): MealType => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Breakfast';
    if (hour < 16) return 'Lunch';
    if (hour < 20) return 'Dinner';
    return 'Snack';
  };

  // Start live webcam / mobile camera
  const startCamera = async () => {
    setCameraError(null);
    stopCamera();
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: cameraFacing,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError('Could not access camera. Please check permissions or upload a photo.');
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const toggleCameraFacing = () => {
    const next = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(next);
    setTimeout(() => {
      startCamera();
    }, 100);
  };

  // Capture frame from video canvas
  const takeSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    setPreviewImage(dataUrl);
    analyzeImage(dataUrl);
  };

  // Handle file upload
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    processImageFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setErrorMessage('Please select a valid image file (JPEG, PNG, WEBP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreviewImage(dataUrl);
      analyzeImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  // Pick a pre-made sample meal for 1-click testing
  const selectSamplePreset = (preset: SampleMealPreset) => {
    setPreviewImage(preset.imageUrl);
    setMealSummary(preset.name);
    setMealType(preset.category);

    const items: DetectedFoodItem[] = preset.items.map((item, idx) => {
      const weight = item.suggested_weight_g;
      return {
        id: `preset-${idx}-${Date.now()}`,
        name: item.name,
        calories_per_100g: item.calories_per_100g,
        protein_g_per_100g: item.protein_g_per_100g,
        carbs_g_per_100g: item.carbs_g_per_100g,
        fat_g_per_100g: item.fat_g_per_100g,
        confidence: item.confidence,
        weight_g: weight,
        calculatedCalories: Math.round((item.calories_per_100g / 100) * weight),
        calculatedProtein: Math.round(((item.protein_g_per_100g / 100) * weight) * 10) / 10,
        calculatedCarbs: Math.round(((item.carbs_g_per_100g / 100) * weight) * 10) / 10,
        calculatedFat: Math.round(((item.fat_g_per_100g / 100) * weight) * 10) / 10,
      };
    });

    setDetectedItems(items);
    setAiProvider('NutriSnap Verified Preset');
    setStep('review');
  };

  // Call server proxy /api/analyze-food
  const analyzeImage = async (imageDataUrl: string) => {
    setStep('analyzing');
    setErrorMessage(null);
    setAnalyzingStatus('Analyzing image with vision model...');

    const statuses = [
      'Scanning plate contours and ingredients...',
      'Recognizing South Asian & global food items...',
      'Consulting Mifflin-St Jeor nutritional database...',
      'Calculating caloric density per 100 grams...',
    ];

    let statusIdx = 0;
    const interval = setInterval(() => {
      statusIdx = (statusIdx + 1) % statuses.length;
      setAnalyzingStatus(statuses[statusIdx]);
    }, 900);

    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageDataUrl,
          defaultWeightG,
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to analyze food.');
      }

      // Check if rejected as non-food
      if (result.is_food === false) {
        setErrorMessage(
          result.reason ||
            'No food detected in this photo. Please take a clear picture of your meal and try again.'
        );
        setStep('select');
        return;
      }

      setMealSummary(result.summary || 'Detected Meal');
      setMealType(result.meal_category || determineMealTypeByTime());
      setAiProvider(result.provider || 'AI Vision');

      // Set items
      const items: DetectedFoodItem[] = result.items || [];
      if (items.length === 0) {
        // Fallback item if array was empty
        items.push({
          id: `item-${Date.now()}`,
          name: 'Balanced Meal Plate',
          calories_per_100g: 150,
          protein_g_per_100g: 8,
          carbs_g_per_100g: 20,
          fat_g_per_100g: 5,
          confidence: 'medium',
          weight_g: defaultWeightG,
          calculatedCalories: Math.round((150 / 100) * defaultWeightG),
          calculatedProtein: Math.round(((8 / 100) * defaultWeightG) * 10) / 10,
          calculatedCarbs: Math.round(((20 / 100) * defaultWeightG) * 10) / 10,
          calculatedFat: Math.round(((5 / 100) * defaultWeightG) * 10) / 10,
        });
      }

      setDetectedItems(items);
      setStep('review');
    } catch (err: any) {
      clearInterval(interval);
      console.error('Vision analysis error:', err);
      setErrorMessage(
        err.message || 'Error communicating with vision server. Please try again or check connection.'
      );
      setStep('select');
    }
  };

  // Re-calculate macro and calorie values when user edits item weight or values
  const updateItem = (id: string, updates: Partial<DetectedFoodItem>) => {
    setDetectedItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };

        // Recalculate derived calories & macros
        const weight = Number(updated.weight_g) || 0;
        const calPer100 = Number(updated.calories_per_100g) || 0;
        const pPer100 = Number(updated.protein_g_per_100g) || 0;
        const cPer100 = Number(updated.carbs_g_per_100g) || 0;
        const fPer100 = Number(updated.fat_g_per_100g) || 0;

        return {
          ...updated,
          weight_g: weight,
          calculatedCalories: Math.round((calPer100 / 100) * weight),
          calculatedProtein: Math.round(((pPer100 / 100) * weight) * 10) / 10,
          calculatedCarbs: Math.round(((cPer100 / 100) * weight) * 10) / 10,
          calculatedFat: Math.round(((fPer100 / 100) * weight) * 10) / 10,
        };
      })
    );
  };

  // Adjust all items proportionally with quick presets (e.g. 100g, 200g, 300g)
  const applyPresetWeightToAll = (newTotalWeight: number) => {
    setDefaultWeightG(newTotalWeight);
    if (detectedItems.length === 0) return;

    if (detectedItems.length === 1) {
      updateItem(detectedItems[0].id, { weight_g: newTotalWeight });
      return;
    }

    const currentTotal = detectedItems.reduce((acc, curr) => acc + curr.weight_g, 0) || 1;
    const ratio = newTotalWeight / currentTotal;

    setDetectedItems((prev) =>
      prev.map((item) => {
        const adjustedWeight = Math.max(10, Math.round(item.weight_g * ratio));
        const calPer100 = item.calories_per_100g;
        return {
          ...item,
          weight_g: adjustedWeight,
          calculatedCalories: Math.round((calPer100 / 100) * adjustedWeight),
          calculatedProtein: Math.round(((item.protein_g_per_100g / 100) * adjustedWeight) * 10) / 10,
          calculatedCarbs: Math.round(((item.carbs_g_per_100g / 100) * adjustedWeight) * 10) / 10,
          calculatedFat: Math.round(((item.fat_g_per_100g / 100) * adjustedWeight) * 10) / 10,
        };
      })
    );
  };

  // Add custom manual item to the plate
  const addNewItem = () => {
    const newItem: DetectedFoodItem = {
      id: `item-${Date.now()}`,
      name: 'Custom Food Item',
      calories_per_100g: 120,
      protein_g_per_100g: 5,
      carbs_g_per_100g: 15,
      fat_g_per_100g: 3,
      confidence: 'medium',
      weight_g: 100,
      calculatedCalories: 120,
      calculatedProtein: 5,
      calculatedCarbs: 15,
      calculatedFat: 3,
    };
    setDetectedItems((prev) => [...prev, newItem]);
  };

  // Delete an item from detected list
  const removeItem = (id: string) => {
    setDetectedItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Calculate grand totals for review step
  const totalCalories = detectedItems.reduce((acc, curr) => acc + curr.calculatedCalories, 0);
  const totalProtein = Math.round(detectedItems.reduce((acc, curr) => acc + curr.calculatedProtein, 0) * 10) / 10;
  const totalCarbs = Math.round(detectedItems.reduce((acc, curr) => acc + curr.calculatedCarbs, 0) * 10) / 10;
  const totalFat = Math.round(detectedItems.reduce((acc, curr) => acc + curr.calculatedFat, 0) * 10) / 10;
  const totalWeight = detectedItems.reduce((acc, curr) => acc + curr.weight_g, 0);

  // Confirm and save meal entry
  const handleConfirmMeal = () => {
    if (detectedItems.length === 0) {
      alert('Please add at least one food item before logging.');
      return;
    }

    const entry: FoodLogEntry = {
      id: editingMeal ? editingMeal.id : `meal-${Date.now()}`,
      timestamp: editingMeal ? editingMeal.timestamp : new Date().toISOString(),
      date: editingMeal ? editingMeal.date : getTodayDateString(),
      time: editingMeal ? editingMeal.time : formatTime(),
      mealType,
      imageUrl: previewImage || undefined,
      items: detectedItems,
      totalWeight_g: totalWeight,
      totalCalories,
      totalProtein,
      totalCarbs,
      totalFat,
      summary: mealSummary || detectedItems.map((i) => i.name).join(', '),
      notes: mealNotes,
    };

    onSaveMeal(entry);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#10B981', '#34D399', '#6EE7B7'],
      });
    } catch (e) {
      // ignore
    }

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                {step === 'review'
                  ? 'Confirm Nutritional Log'
                  : step === 'analyzing'
                  ? 'AI Analyzing Photo'
                  : 'Log Food via Photo'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {step === 'review'
                  ? 'Review detected food, edit weights, and confirm calories'
                  : 'Snap a live photo or upload from your camera roll'}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: SELECT / CAPTURE */}
        {step === 'select' && (
          <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold">Image Recognition Alert</div>
                  <div>{errorMessage}</div>
                </div>
              </div>
            )}

            {/* Quick Weight Preset Picker before snapping */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-emerald-500" />
                  Estimated Food Portion Weight
                </label>
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {defaultWeightG} grams
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[100, 150, 200, 300].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDefaultWeightG(preset)}
                    className={`py-1.5 px-2 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                      defaultWeightG === preset
                        ? 'border-emerald-500 bg-emerald-500 text-white shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {preset}g
                  </button>
                ))}
              </div>
            </div>

            {/* Live Camera View vs Upload Area */}
            {isCameraActive ? (
              <div className="space-y-4">
                <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex items-center justify-center border-2 border-emerald-500 shadow-xl">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Viewfinder crosshairs */}
                  <div className="absolute inset-8 border border-white/40 rounded-2xl pointer-events-none flex items-center justify-center">
                    <span className="text-xs text-white/80 font-medium bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                      Align food in frame
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={takeSnapshot}
                    className="flex-1 py-3 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition cursor-pointer"
                  >
                    <Camera className="w-5 h-5" />
                    <span>Capture Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    title="Flip camera"
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </button>
                  <button
                    type="button"
                    onClick={stopCamera}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-700 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 hover:text-rose-600 transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Drag and drop upload zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 bg-slate-50/70 dark:bg-slate-850/50 transition flex flex-col items-center justify-center text-center cursor-pointer group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-105 transition">
                    <Upload className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">
                    Upload Food Photo
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                    Drag and drop your photo here, or click to browse from gallery
                  </p>
                  <span className="mt-3 px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                    Supports JPG, PNG, WEBP
                  </span>
                </div>

                {/* Camera Trigger */}
                <div className="text-center">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="flex-shrink mx-4 text-xs font-semibold text-slate-400 uppercase">
                      or use live camera
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  </div>

                  <button
                    type="button"
                    onClick={startCamera}
                    className="w-full py-3 px-4 rounded-2xl border-2 border-emerald-500/80 text-emerald-600 dark:text-emerald-400 font-bold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Open Camera to Take Photo</span>
                  </button>
                  {cameraError && (
                    <p className="text-xs text-rose-500 mt-2">{cameraError}</p>
                  )}
                </div>
              </div>
            )}

            {/* Quick 1-Click Sample Meal Tester */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Instant Test with Popular Dishes (Nepali & Global)
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {SAMPLE_MEAL_PRESETS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => selectSamplePreset(sample)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 text-left transition group overflow-hidden bg-white/50 dark:bg-slate-800/40 cursor-pointer"
                  >
                    <div className="w-full h-18 rounded-lg overflow-hidden mb-1.5 bg-slate-200 dark:bg-slate-700">
                      <img
                        src={sample.imageUrl}
                        alt={sample.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {sample.name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate">{sample.category}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: ANALYZING SKELETON / SCANNER */}
        {step === 'analyzing' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-2xl bg-black">
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Analyzing Meal"
                  className="w-full h-full object-cover opacity-80"
                />
              )}

              {/* Animated laser scan line */}
              <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_15px_#10B981] animate-scan" />

              {/* Grid overlay */}
              <div
                className="absolute inset-0 pointer-events-none opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(circle, #10B981 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              />

              {/* Scanning status banner */}
              <div className="absolute bottom-4 inset-x-4 bg-slate-900/85 backdrop-blur-md p-2.5 rounded-xl border border-emerald-500/40 text-white text-xs font-medium flex items-center justify-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                <span className="truncate">{analyzingStatus}</span>
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                NutriSnap AI Vision Engine
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Detecting individual plate components, calculating macronutrient distributions, and scaling portions.
              </p>
            </div>
          </div>
        )}

        {/* STEP 3: EDITABLE REVIEW TABLE & CONFIRMATION */}
        {step === 'review' && (
          <div className="p-6 space-y-6 max-h-[82vh] overflow-y-auto">
            {/* Top summary card */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/50">
              {previewImage && (
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-emerald-300 dark:border-emerald-800">
                  <img
                    src={previewImage}
                    alt="Meal preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                    {aiProvider || 'AI Detected'}
                  </span>
                  <div className="flex items-center gap-1">
                    {(['Breakfast', 'Lunch', 'Dinner', 'Snack'] as MealType[]).map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setMealType(t)}
                        className={`text-[11px] px-2 py-0.5 rounded-md font-semibold transition cursor-pointer ${
                          mealType === t
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <input
                  type="text"
                  value={mealSummary}
                  onChange={(e) => setMealSummary(e.target.value)}
                  placeholder="e.g. Steamed Chicken Momo with Achar"
                  className="mt-1 w-full text-sm font-bold text-slate-900 dark:text-white bg-transparent border-b border-dashed border-slate-300 dark:border-slate-700 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Total Calorie big badge */}
              <div className="text-right shrink-0">
                <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                  {totalCalories}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  kcal total ({totalWeight}g)
                </div>
              </div>
            </div>

            {/* Quick Proportional Weight Adjuster */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-800">
              <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Scale className="w-4 h-4 text-emerald-500" />
                <span>Adjust Plate Total Weight:</span>
              </div>
              <div className="flex items-center gap-1.5">
                {[150, 200, 300, 400].map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => applyPresetWeightToAll(w)}
                    className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-300 transition cursor-pointer"
                  >
                    {w}g
                  </button>
                ))}
              </div>
            </div>

            {/* Editable Detected Items Table */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Detected Food Components ({detectedItems.length})
                </span>
                <button
                  type="button"
                  onClick={addNewItem}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Item</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {detectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 shadow-sm space-y-3"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(item.id, { name: e.target.value })}
                        className="font-bold text-sm text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-500 focus:outline-none flex-1"
                      />
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Weight and Cal/100g Controls */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Portion (g)</span>
                        <div className="relative">
                          <input
                            type="number"
                            min="5"
                            max="2000"
                            value={item.weight_g}
                            onChange={(e) =>
                              updateItem(item.id, { weight_g: Number(e.target.value) })
                            }
                            className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                          />
                          <span className="absolute right-2 top-1.5 text-[10px] text-slate-400">g</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">kcal / 100g</span>
                        <input
                          type="number"
                          min="0"
                          max="900"
                          value={item.calories_per_100g}
                          onChange={(e) =>
                            updateItem(item.id, { calories_per_100g: Number(e.target.value) })
                          }
                          className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 font-mono font-bold text-slate-900 dark:text-white"
                        />
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Macros (P / C / F)</span>
                        <div className="px-2.5 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 font-mono text-[11px] truncate">
                          {item.calculatedProtein}p · {item.calculatedCarbs}c · {item.calculatedFat}f
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] text-slate-400 block mb-0.5">Calculated</span>
                        <div className="px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-mono font-extrabold text-xs">
                          {item.calculatedCalories} kcal
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Optional Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Meal Notes (optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Cooked with less oil, shared half with friend"
                value={mealNotes}
                onChange={(e) => setMealNotes(e.target.value)}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Grand Macros summary row */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Grand Total</span>
                <span className="font-extrabold text-base text-slate-900 dark:text-white font-mono">
                  {totalCalories} kcal
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono">
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                  {totalProtein}g Protein
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                  {totalCarbs}g Carbs
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  {totalFat}g Fat
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setStep('select')}
                className="px-4 py-2 rounded-xl text-slate-500 dark:text-slate-400 text-xs font-semibold hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
              >
                ← Back to Upload
              </button>
              <button
                type="button"
                onClick={handleConfirmMeal}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-bold shadow-lg shadow-emerald-500/25 active:scale-95 transition cursor-pointer"
              >
                Log Meal to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
