'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import { useWeatherData, useGeolocation } from '@/hooks/useWeather';
import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/loading/LoadingScreen';
import Navbar from '@/components/ui/Navbar';
import WeatherInfoPanel from '@/components/dashboard/WeatherInfoPanel';
import AIPredictionPanel from '@/components/dashboard/AIPredictionPanel';
import ForecastStrip from '@/components/dashboard/ForecastStrip';
import RadarView from '@/components/dashboard/RadarView';
import AdminDashboard from '@/components/dashboard/AdminDashboard';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import FeaturesSection from '@/components/landing/FeaturesSection';
import WorldMapCTA from '@/components/landing/WorldMapCTA';
import CustomCursor from '@/components/ui/CustomCursor';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Moon, AlertTriangle, Search, MapPin } from 'lucide-react';
import { searchCities } from '@/services/weatherApi';

// Dynamic imports for heavy 3D components
const WeatherEngine = dynamic(() => import('@/components/weather/WeatherEngine'), {
  ssr: false,
  loading: () => <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, #02060f, #0d1424)' }} />,
});

const GlobeMap = dynamic(() => import('@/components/maps/GlobeMap'), {
  ssr: false,
  loading: () => (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'rgba(0,212,255,0.5)', fontSize: '0.8rem', fontFamily: 'Space Grotesk, monospace' }}>Loading Globe...</div>
    </div>
  ),
});

// Weather mode toggle buttons
const weatherModes = [
  { id: 'sunny', icon: Sun, color: '#f59e0b', label: 'Sunny' },
  { id: 'clouds', icon: Cloud, color: '#64748b', label: 'Cloudy' },
  { id: 'rain', icon: CloudRain, color: '#3b82f6', label: 'Rain' },
  { id: 'storm', icon: CloudLightning, color: '#7c3aed', label: 'Storm' },
  { id: 'snow', icon: Snowflake, color: '#e0f2fe', label: 'Snow' },
  { id: 'night', icon: Moon, color: '#a855f7', label: 'Night' },
] as const;

// Cursor glow effect component
function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (glowRef.current) {
        glowRef.current.style.left = `${e.clientX}px`;
        glowRef.current.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);
  return <div ref={glowRef} className="cursor-glow" />;
}

// Alert bar
function AlertBar() {
  const { alerts, dismissAlert } = useWeatherStore();
  if (!alerts.length) return null;
  const alert = alerts[0];
  const colors: Record<string, string> = { storm: '#7c3aed', heat: '#f59e0b', rain: '#3b82f6', cold: '#60a5fa' };
  const color = colors[alert.type] || '#f43f5e';

  return (
    <motion.div
      initial={{ y: -50 }}
      animate={{ y: 0 }}
      style={{
        position: 'fixed', top: 64, left: 0, right: 0, zIndex: 45,
        background: `linear-gradient(90deg, ${color}25, rgba(2,6,15,0.9), ${color}25)`,
        backdropFilter: 'blur(20px)',
        borderBottom: `1px solid ${color}40`,
        padding: '0.5rem 1.5rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
      }}
    >
      <AlertTriangle size={14} color={color} />
      <span style={{ color: 'rgba(255,255,255,0.9)', fontSize: '0.8rem', flex: 1 }}>
        <strong style={{ color }}>{alert.title}:</strong> {alert.message}
      </span>
      <button onClick={() => dismissAlert(alert.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '1rem', lineHeight: 1 }}>
        ×
      </button>
    </motion.div>
  );
}

// Left panel - Weather Engine with controls
function LeftPanel() {
  const { weatherMode, setWeatherMode, weatherData, currentCity } = useWeatherStore();
  const [time, setTime] = useState(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <WeatherEngine />

      {/* City name overlay */}
      <div style={{
        position: 'absolute', top: '1.5rem', left: '1.5rem',
        zIndex: 10,
      }}>
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'rgba(0,0,0,0.3)',
            backdropFilter: 'blur(20px)',
            borderRadius: 12, padding: '0.6rem 1rem',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        >
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', letterSpacing: '0.15em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, monospace', marginBottom: '0.1rem' }}>
            Live Weather
          </div>
          <div style={{ color: '#e2e8f0', fontSize: '1rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
            {currentCity}
          </div>
          <div style={{ color: '#00d4ff', fontSize: '0.85rem', fontWeight: 600, marginTop: '0.2rem', fontFamily: 'Space Grotesk, monospace' }}>
            {time}
          </div>
          
          {/* Temperature Section Moved Here */}
          {weatherData && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '0.75rem' }}>
              <div style={{
                fontSize: '3rem',
                fontWeight: 800,
                fontFamily: 'Outfit, sans-serif',
                background: 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.6))',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                lineHeight: 1,
              }}>
                {weatherData.temperature}°
              </div>
              <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', textTransform: 'capitalize', marginTop: '0.25rem' }}>
                {weatherData.description}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Hero Search Bar */}
      <div style={{
        position: 'absolute', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, width: '40%', minWidth: '300px'
      }}>
        <HeroSearch />
      </div>

      {/* Weather mode controls */}
      <div style={{
        position: 'absolute', top: '1.5rem', right: '1.5rem',
        zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: '0.35rem',
      }}>
        {weatherModes.map(({ id, icon: Icon, color, label }) => (
          <motion.button
            key={id}
            onClick={() => setWeatherMode(id)}
            whileHover={{ scale: 1.1, x: -3 }}
            whileTap={{ scale: 0.95 }}
            title={label}
            style={{
              width: 36, height: 36, borderRadius: 8,
              background: weatherMode === id ? `${color}25` : 'rgba(0,0,0,0.4)',
              border: `1px solid ${weatherMode === id ? `${color}60` : 'rgba(255,255,255,0.1)'}`,
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              boxShadow: weatherMode === id ? `0 0 12px ${color}40` : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Icon size={15} color={weatherMode === id ? color : 'rgba(255,255,255,0.5)'} />
          </motion.button>
        ))}
      </div>

      {/* Temperature overlay was moved to top-left overlay */}

      {/* 7-Day Forecast Overlay at the bottom */}
      <div style={{
        position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)',
        zIndex: 10, width: '90%', maxWidth: '800px',
      }}>
        <div style={{
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)',
          borderRadius: 16, padding: '1rem', border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          <ForecastStrip />
        </div>
      </div>
    </div>
  );
}

// Hero Search Bar Component
function HeroSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{name:string; country:string; lat:number; lon:number}[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { setLocation } = useWeatherStore();
  const timeoutRef = useRef<any>(null);

  const handleSearch = (val: string) => {
    setQuery(val);
    if (val.length < 2) { setResults([]); return; }
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await searchCities(val);
        setResults(res);
        setIsOpen(true);
      } catch {}
    }, 300);
  };

  const handleSelect = (r: any) => {
    setLocation(`${r.name}, ${r.country}`, r.lat, r.lon);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 12,
        padding: '0.6rem 1rem',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        <Search size={16} color="rgba(255,255,255,0.5)" />
        <input
          value={query}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Search any location..."
          style={{
            background: 'transparent', border: 'none', outline: 'none',
            color: 'white', width: '100%', fontSize: '0.9rem',
            fontFamily: 'Inter, sans-serif'
          }}
        />
      </div>
      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            style={{
              position: 'absolute', top: '110%', left: 0, right: 0,
              background: 'rgba(2,6,15,0.95)', backdropFilter: 'blur(20px)',
              border: '1px solid rgba(0,212,255,0.3)', borderRadius: 12,
              overflow: 'hidden', zIndex: 50,
            }}
          >
            {results.map((r, i) => (
              <div
                key={i}
                onClick={() => handleSelect(r)}
                style={{
                  padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                  borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer',
                  color: 'white', transition: 'background 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(0,212,255,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <MapPin size={14} color="#00d4ff" />
                <span style={{ fontSize: '0.85rem' }}>{r.name}, <span style={{ color: 'rgba(255,255,255,0.5)' }}>{r.country}</span></span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Right panel - AI Dashboard
function RightPanel() {
  const { activePanel } = useWeatherStore();

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'rgba(2,6,15,0.7)',
      backdropFilter: 'blur(40px)',
      borderLeft: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{
        padding: '1rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        background: 'linear-gradient(90deg, rgba(0,212,255,0.05), transparent)',
        flexShrink: 0,
      }}>
        <h2 style={{ 
          fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif',
          background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          textTransform: 'capitalize'
        }}>
          {activePanel} View
        </h2>
      </div>

      {/* Content area based on active panel from Navbar */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        <AnimatePresence mode="wait">
          {activePanel === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <WeatherInfoPanel />
            </motion.div>
          )}
          {activePanel === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AIPredictionPanel />
            </motion.div>
          )}
          {activePanel === 'map' && (
            <motion.div
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ height: 'calc(100vh - 140px)', borderRadius: 12, overflow: 'hidden', position: 'relative' }}
            >
              <GlobeMap />
            </motion.div>
          )}
          {activePanel === 'radar' && (
            <motion.div
              key="radar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ height: 'calc(100vh - 140px)' }}
            >
              <RadarView />
            </motion.div>
          )}
          {activePanel === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AdminDashboard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function HomePage() {
  const [showLoading, setShowLoading] = useState(true);
  const [appReady, setAppReady] = useState(false);

  // Fetch weather data
  useWeatherData();

  const { requestLocation } = useGeolocation();

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const handleLoadingComplete = useCallback(() => {
    setShowLoading(false);
    setAppReady(true);
  }, []);

  return (
    <>
      {/* Loading screen */}
      {showLoading && <LoadingScreen onComplete={handleLoadingComplete} />}

      {/* Main app */}
      <AnimatePresence>
        {appReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
            style={{ minHeight: '100vh', position: 'relative', overflowY: 'auto' }}
          >
            {/* Cursor glow */}
            <CursorGlow />

            {/* Custom Cursor */}
            <CustomCursor />

            {/* Navbar */}
            <Navbar />

            {/* Alert bar */}
            <AlertBar />

            {/* Main hero layout - split screen */}
            <div style={{
              display: 'flex',
              height: '100vh',
              paddingTop: 64,
            }}>
              {/* LEFT - 60% Weather Engine */}
              <div style={{ flex: '0 0 60%', position: 'relative', overflow: 'hidden' }}>
                <LeftPanel />
              </div>

              {/* RIGHT - 40% AI Dashboard */}
              <div style={{ flex: '0 0 40%', overflowY: 'auto', position: 'relative' }}>
                <RightPanel />
              </div>
            </div>

            {/* World Map CTA */}
            <WorldMapCTA />

            {/* Features Section */}
            <FeaturesSection />

            {/* Voice AI Assistant */}
            <VoiceAssistant />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
