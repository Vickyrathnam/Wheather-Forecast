'use client';

import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import { CloudRain } from 'lucide-react';

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const conditionGradients: Record<string, string> = {
  Clear: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,146,60,0.1))',
  Clouds: 'linear-gradient(135deg, rgba(100,116,139,0.15), rgba(71,85,105,0.1))',
  Rain: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(37,99,235,0.1))',
  Thunderstorm: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(79,70,229,0.1))',
  Snow: 'linear-gradient(135deg, rgba(224,242,254,0.15), rgba(125,211,252,0.1))',
  Drizzle: 'linear-gradient(135deg, rgba(96,165,250,0.15), rgba(59,130,246,0.1))',
};

export default function ForecastStrip() {
  const { forecastData, aiPrediction } = useWeatherStore();

  const days = forecastData?.daily || aiPrediction?.predictions?.daily;

  if (!days || !days.length) {
    return (
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="shimmer-effect" style={{
            minWidth: 60, height: 90, borderRadius: 10,
            background: 'rgba(255,255,255,0.03)',
            flexShrink: 0,
          }} />
        ))}
      </div>
    );
  }

  return (
    <div>
      <div style={{
        color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem',
        letterSpacing: '0.15em', textTransform: 'uppercase',
        fontFamily: 'Space Grotesk, monospace',
        marginBottom: '0.5rem',
      }}>
        7-Day AI Forecast
      </div>
      <div style={{ display: 'flex', gap: '0.4rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        {days.slice(0, 7).map((day, i) => {
          const date = new Date(day.date);
          const dayName = i === 0 ? 'Today' : dayNames[date.getDay()];
          const bg = conditionGradients[day.condition] || conditionGradients.Clouds;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.05, y: -2 }}
              style={{
                minWidth: 62, flexShrink: 0,
                background: bg,
                backdropFilter: 'blur(12px)',
                border: `1px solid rgba(255,255,255,${i === 0 ? '0.2' : '0.07'})`,
                borderRadius: 10,
                padding: '0.6rem 0.4rem',
                textAlign: 'center',
                cursor: 'pointer',
                boxShadow: i === 0 ? '0 0 15px rgba(0,212,255,0.1)' : 'none',
              }}
            >
              <div style={{
                color: i === 0 ? '#00d4ff' : 'rgba(255,255,255,0.5)',
                fontSize: '0.65rem', fontWeight: i === 0 ? 700 : 400,
                marginBottom: '0.3rem',
                fontFamily: 'Space Grotesk, monospace',
              }}>
                {dayName}
              </div>
              <img
                src={`https://openweathermap.org/img/wn/${day.icon || '01d'}.png`}
                alt={day.condition}
                style={{ width: 30, height: 30, margin: '0 auto 0.2rem', display: 'block', filter: 'brightness(1.2)' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div style={{ color: '#f43f5e', fontSize: '0.75rem', fontWeight: 700, lineHeight: 1 }}>
                {Math.round(day.tempMax || day.tempAvg + 3)}°
              </div>
              <div style={{ color: '#60a5fa', fontSize: '0.65rem', lineHeight: 1, marginBottom: '0.2rem' }}>
                {Math.round(day.tempMin || day.tempAvg - 3)}°
              </div>
              {day.rainProbability !== undefined && day.rainProbability > 10 && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.15rem' }}>
                  <CloudRain size={8} color="#60a5fa" />
                  <span style={{ color: '#60a5fa', fontSize: '0.55rem' }}>{day.rainProbability}%</span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
