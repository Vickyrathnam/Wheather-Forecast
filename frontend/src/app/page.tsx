'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import { useWeatherData } from '@/hooks/useWeather';
import dynamic from 'next/dynamic';
import LoadingScreen from '@/components/loading/LoadingScreen';
import Navbar from '@/components/ui/Navbar';
import WeatherInfoPanel from '@/components/dashboard/WeatherInfoPanel';
import AIPredictionPanel from '@/components/dashboard/AIPredictionPanel';
import ForecastStrip from '@/components/dashboard/ForecastStrip';
import VoiceAssistant from '@/components/voice/VoiceAssistant';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, Moon, AlertTriangle } from 'lucide-react';

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
        </motion.div>
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

      {/* Temperature overlay */}
      {weatherData && (
        <div style={{
          position: 'absolute', bottom: '4rem', left: '1.5rem',
          zIndex: 10,
        }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              background: 'rgba(0,0,0,0.25)',
              backdropFilter: 'blur(20px)',
              borderRadius: 16, padding: '1rem 1.25rem',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div style={{
              fontSize: 'clamp(3rem, 8vw, 5rem)',
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
          </motion.div>
        </div>
      )}
    </div>
  );
}

// Right panel - AI Dashboard
function RightPanel() {
  const { activePanel } = useWeatherStore();
  const [activeTab, setActiveTab] = useState<'weather' | 'ai' | 'globe'>('weather');

  const tabs = [
    { id: 'weather', label: 'Weather' },
    { id: 'ai', label: 'AI Engine' },
    { id: 'globe', label: '3D Globe' },
  ] as const;

  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      background: 'rgba(2,6,15,0.7)',
      backdropFilter: 'blur(40px)',
      borderLeft: '1px solid rgba(255,255,255,0.05)',
    }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        padding: '0.75rem 1rem 0',
        gap: '0.25rem',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0,
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.4rem 0.75rem',
              borderRadius: '6px 6px 0 0',
              background: activeTab === tab.id ? 'rgba(0,212,255,0.1)' : 'transparent',
              border: 'none',
              borderBottom: activeTab === tab.id ? '2px solid #00d4ff' : '2px solid transparent',
              color: activeTab === tab.id ? '#00d4ff' : 'rgba(255,255,255,0.4)',
              fontSize: '0.75rem',
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.2s',
              letterSpacing: '0.03em',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
        <AnimatePresence mode="wait">
          {activeTab === 'weather' && (
            <motion.div
              key="weather"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
            >
              <WeatherInfoPanel />
              <ForecastStrip />
            </motion.div>
          )}
          {activeTab === 'ai' && (
            <motion.div
              key="ai"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <AIPredictionPanel />
            </motion.div>
          )}
          {activeTab === 'globe' && (
            <motion.div
              key="globe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ height: 'calc(100vh - 200px)', borderRadius: 12, overflow: 'hidden' }}
            >
              <GlobeMap />
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
            style={{ minHeight: '100vh', position: 'relative', overflow: 'hidden' }}
          >
            {/* Cursor glow */}
            <CursorGlow />

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

            {/* Voice AI Assistant */}
            <VoiceAssistant />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
