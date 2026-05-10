'use client';

import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import {
  Thermometer, Wind, Droplets, Eye, Gauge, Sun,
  Sunrise, Sunset, AlertTriangle, Leaf
} from 'lucide-react';

const getWindDirection = (deg: number) => {
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  return dirs[Math.round(deg / 22.5) % 16];
};

const formatTime = (ts: number) => {
  return new Date(ts).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit', hour12: true });
};

function StatItem({
  icon: Icon, label, value, unit, color, delay = 0
}: {
  icon: React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>;
  label: string;
  value: string | number;
  unit?: string;
  color?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card"
      style={{ minWidth: 0 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
        <Icon size={14} color={color || 'rgba(0,212,255,0.7)'} strokeWidth={1.5} />
        <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, monospace' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
        <span style={{
          fontSize: '1.4rem', fontWeight: 700,
          color: color || '#e2e8f0',
          fontFamily: 'Outfit, sans-serif',
        }}>
          {value}
        </span>
        {unit && <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>{unit}</span>}
      </div>
    </motion.div>
  );
}

function AQIMeter({ aqi, category }: { aqi: number; category: string }) {
  const colors = ['#00ff88', '#a3e635', '#fbbf24', '#fb923c', '#f43f5e'];
  const color = colors[Math.min(aqi - 1, 4)];
  const pct = (aqi / 5) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className="glass-card"
      style={{ padding: '1rem', marginBottom: '0.75rem' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Leaf size={14} color={color} />
          <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, monospace' }}>Air Quality</span>
        </div>
        <span style={{ color, fontSize: '0.75rem', fontWeight: 600 }}>{category}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: `2px solid ${color}`,
          boxShadow: `0 0 15px ${color}50`,
          color,
          fontWeight: 700,
          fontSize: '1rem',
          fontFamily: 'Outfit, sans-serif',
        }}>
          {aqi}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} style={{
                flex: 1, height: 4, borderRadius: 2,
                background: i <= aqi ? color : 'rgba(255,255,255,0.1)',
                transition: 'background 0.3s',
                boxShadow: i <= aqi ? `0 0 6px ${color}` : 'none',
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(255,255,255,0.3)', fontSize: '0.6rem' }}>
            <span>Good</span><span>Very Poor</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function WeatherInfoPanel() {
  const { weatherData } = useWeatherStore();

  if (!weatherData) {
    return (
      <div style={{ padding: '1rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="stat-card shimmer-effect" style={{ marginBottom: '0.5rem', height: 60 }} />
        ))}
      </div>
    );
  }

  const w = weatherData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Main temperature */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ padding: '1rem', textAlign: 'center' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <img
            src={`https://openweathermap.org/img/wn/${w.icon}@2x.png`}
            alt={w.description}
            style={{ width: 50, height: 50, filter: 'brightness(1.2) saturate(1.5)' }}
          />
          <div>
            <div style={{
              fontSize: '3rem', fontWeight: 800,
              fontFamily: 'Outfit, sans-serif',
              background: 'linear-gradient(135deg, #00d4ff, #a855f7)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1,
            }}>
              {w.temperature}°
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', textTransform: 'capitalize' }}>
              {w.description}
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <span style={{ color: '#f43f5e', fontSize: '0.8rem', fontWeight: 600 }}>↑ {w.tempMax}°</span>
          <span style={{ color: '#3b82f6', fontSize: '0.8rem', fontWeight: 600 }}>↓ {w.tempMin}°</span>
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>Feels {w.feelsLike}°</span>
        </div>
      </motion.div>

      {/* AQI */}
      <AQIMeter aqi={w.aqi} category={w.aqiCategory} />

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <StatItem icon={Droplets} label="Humidity" value={w.humidity} unit="%" color="#3b82f6" delay={0.05} />
        <StatItem icon={Wind} label="Wind" value={w.windSpeed} unit="km/h" color="#00d4ff" delay={0.1} />
        <StatItem icon={Gauge} label="Pressure" value={w.pressure} unit="hPa" color="#a855f7" delay={0.15} />
        <StatItem icon={Eye} label="Visibility" value={w.visibility.toFixed(1)} unit="km" color="#00ff88" delay={0.2} />
        <StatItem icon={Wind} label="Direction" value={getWindDirection(w.windDeg)} color="#fb923c" delay={0.25} />
        <StatItem icon={Thermometer} label="Feels Like" value={w.feelsLike} unit="°C" color="#f43f5e" delay={0.3} />
      </div>

      {/* Sunrise / Sunset */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
        style={{ padding: '0.75rem', display: 'flex', justifyContent: 'space-around' }}
      >
        <div style={{ textAlign: 'center' }}>
          <Sunrise size={18} color="#fbbf24" style={{ marginBottom: '0.25rem', display: 'block', margin: '0 auto 4px' }} />
          <div style={{ color: '#fbbf24', fontSize: '0.9rem', fontWeight: 600 }}>{formatTime(w.sunrise)}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>Sunrise</div>
        </div>
        <div style={{ width: 1, background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ textAlign: 'center' }}>
          <Sunset size={18} color="#fb923c" style={{ marginBottom: '0.25rem', display: 'block', margin: '0 auto 4px' }} />
          <div style={{ color: '#fb923c', fontSize: '0.9rem', fontWeight: 600 }}>{formatTime(w.sunset)}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem' }}>Sunset</div>
        </div>
      </motion.div>
    </div>
  );
}
