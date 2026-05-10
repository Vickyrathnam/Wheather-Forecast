'use client';

import { useWeatherStore } from '@/store/weatherStore';
import { motion } from 'framer-motion';
import { Radar, RefreshCcw, MapPin } from 'lucide-react';
import { useState } from 'react';

export default function RadarView() {
  const { weatherData, currentCity } = useWeatherStore();
  const [loading, setLoading] = useState(true);

  if (!weatherData) return null;

  const lat = weatherData.lat;
  const lon = weatherData.lon;
  
  // Using Windy's beautiful embed for the radar. It looks extremely premium and fits the Tesla/Apple Vision Pro aesthetic.
  const iframeUrl = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=%C2%B0C&metricWind=km%2Fh&zoom=6&overlay=radar&product=radar&level=surface&lat=${lat}&lon=${lon}&detailLat=${lat}&detailLon=${lon}&marker=true&message=true`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.75rem' }}>
      <div className="glass-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Radar size={16} color="#00d4ff" />
          <span style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
            Live Doppler Radar
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MapPin size={12} color="rgba(255,255,255,0.4)" />
          <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem' }}>{currentCity}</span>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
        style={{ flex: 1, position: 'relative', borderRadius: 12, overflow: 'hidden' }}
      >
        {loading && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              style={{ width: 30, height: 30, border: '2px solid transparent', borderTopColor: '#00d4ff', borderRadius: '50%', marginBottom: '1rem' }} />
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', fontFamily: 'Space Grotesk, monospace' }}>Calibrating Satellite Feed...</span>
          </div>
        )}
        
        <iframe 
          src={iframeUrl}
          width="100%" 
          height="100%" 
          frameBorder="0"
          onLoad={() => setLoading(false)}
          style={{ 
            position: 'absolute', inset: 0, width: '100%', height: '100%', 
            opacity: loading ? 0 : 1, transition: 'opacity 0.5s',
            filter: 'contrast(1.1) saturate(1.2)' // Enhance colors to fit our dark neon theme
          }}
        />
      </motion.div>
    </div>
  );
}
