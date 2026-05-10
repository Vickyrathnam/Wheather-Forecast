// Weather Store - Zustand Global State
import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export type WeatherMode = 'sunny' | 'rain' | 'storm' | 'snow' | 'night' | 'clouds';

export interface WeatherData {
  city: string;
  country: string;
  lat: number;
  lon: number;
  temperature: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  humidity: number;
  pressure: number;
  visibility: number;
  windSpeed: number;
  windDeg: number;
  windGust: number | null;
  cloudiness: number;
  condition: string;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
  timezone: number;
  aqi: number;
  aqiCategory: string;
  pm25: number;
  pm10: number;
  uvIndex: number | null;
  timestamp: string;
}

export interface ForecastDay {
  date: number;
  tempMax: number;
  tempMin: number;
  tempAvg: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  description: string;
  icon: string;
  rainProbability: number;
}

export interface HourlyForecast {
  time: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
  pop: number;
  precipitation: number;
}

export interface AIPrediction {
  city: string;
  rainProbability: number;
  stormRisk: number;
  heatwaveRisk: number;
  floodRisk: number;
  confidence: {
    overall: number;
    lstm: number;
    prophet: number;
    xgboost: number;
  };
  anomalies: Array<{ type: string; severity: string; value: number }>;
  aiInsights: string[];
  modelMetrics: {
    lstm: { accuracy: number; r2: number; mae: number };
    prophet: { accuracy: number; r2: number; mae: number };
    xgboost: { accuracy: number; r2: number; mae: number };
    ensemble: { accuracy: number; r2: number; mae: number };
  };
  predictions: {
    hourly: Array<{ hour: number; temp: number; humidity: number; pop: number }>;
    daily: ForecastDay[];
    temperature: {
      lstm: number[];
      prophet: number[];
      xgboost: number[];
      ensemble: number[];
    };
  };
  windEvolution: Array<{ hour: number; speed: number; direction: number }>;
  aqiForecast: Array<{ day: number; aqi: number; pm25: number }>;
  timestamp: string;
}

export interface GlobalWeatherCity {
  city: string;
  country: string;
  lat: number;
  lon: number;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  aqi: number;
}

interface WeatherStore {
  // Location
  currentCity: string;
  currentLat: number;
  currentLon: number;
  setLocation: (city: string, lat: number, lon: number) => void;

  // Weather Data
  weatherData: WeatherData | null;
  forecastData: { daily: ForecastDay[]; hourly: HourlyForecast[] } | null;
  aiPrediction: AIPrediction | null;
  globalWeather: GlobalWeatherCity[];
  isLoading: boolean;
  error: string | null;

  setWeatherData: (data: WeatherData) => void;
  setForecastData: (data: { daily: ForecastDay[]; hourly: HourlyForecast[] }) => void;
  setAIPrediction: (data: AIPrediction) => void;
  setGlobalWeather: (data: GlobalWeatherCity[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // UI State
  weatherMode: WeatherMode;
  setWeatherMode: (mode: WeatherMode) => void;

  // App State
  isInitialized: boolean;
  setInitialized: (val: boolean) => void;

  activePanel: 'dashboard' | 'map' | 'analytics' | 'radar' | 'admin';
  setActivePanel: (panel: 'dashboard' | 'map' | 'analytics' | 'radar' | 'admin') => void;

  // Voice Assistant
  voiceActive: boolean;
  setVoiceActive: (active: boolean) => void;
  voiceTranscript: string;
  setVoiceTranscript: (text: string) => void;

  // Theme
  units: 'metric' | 'imperial';
  toggleUnits: () => void;

  // Alerts
  alerts: Array<{ id: string; type: string; severity: string; title: string; message: string; timestamp: string }>;
  addAlert: (alert: { id: string; type: string; severity: string; title: string; message: string; timestamp: string }) => void;
  dismissAlert: (id: string) => void;
}

export const useWeatherStore = create<WeatherStore>()(
  subscribeWithSelector((set, get) => ({
    // Location
    currentCity: 'London',
    currentLat: 51.5074,
    currentLon: -0.1278,
    setLocation: (city, lat, lon) => set({ currentCity: city, currentLat: lat, currentLon: lon }),

    // Data
    weatherData: null,
    forecastData: null,
    aiPrediction: null,
    globalWeather: [],
    isLoading: false,
    error: null,

    setWeatherData: (data) => {
      set({ weatherData: data, error: null });
      // Auto-set weather mode based on condition
      const mode = getWeatherMode(data.condition, data.sunrise, data.sunset);
      set({ weatherMode: mode });
    },
    setForecastData: (data) => set({ forecastData: data }),
    setAIPrediction: (data) => set({ aiPrediction: data }),
    setGlobalWeather: (data) => set({ globalWeather: data }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error }),

    // UI
    weatherMode: 'sunny',
    setWeatherMode: (mode) => set({ weatherMode: mode }),

    isInitialized: false,
    setInitialized: (val) => set({ isInitialized: val }),

    activePanel: 'dashboard',
    setActivePanel: (panel) => set({ activePanel: panel }),

    voiceActive: false,
    setVoiceActive: (active) => set({ voiceActive: active }),
    voiceTranscript: '',
    setVoiceTranscript: (text) => set({ voiceTranscript: text }),

    units: 'metric',
    toggleUnits: () => set(s => ({ units: s.units === 'metric' ? 'imperial' : 'metric' })),

    alerts: [],
    addAlert: (alert) => set(s => ({ alerts: [alert, ...s.alerts].slice(0, 10) })),
    dismissAlert: (id) => set(s => ({ alerts: s.alerts.filter(a => a.id !== id) })),
  }))
);

// Helper: derive weather mode from condition string
function getWeatherMode(condition: string, sunrise: number, sunset: number): WeatherMode {
  const now = Date.now();
  const isNight = now < sunrise || now > sunset;
  if (isNight) return 'night';

  const c = condition.toLowerCase();
  if (c.includes('thunder')) return 'storm';
  if (c.includes('rain') || c.includes('drizzle')) return 'rain';
  if (c.includes('snow') || c.includes('sleet') || c.includes('ice')) return 'snow';
  if (c.includes('cloud') || c.includes('fog') || c.includes('mist') || c.includes('haze')) return 'clouds';
  return 'sunny';
}
