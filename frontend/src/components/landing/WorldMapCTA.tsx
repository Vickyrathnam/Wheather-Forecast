'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';

const CITIES = [
  { name: 'New York', lat: 40.71, lng: -74.0, temp: 22, condition: 'Cloudy', color: '#60a5fa' },
  { name: 'London', lat: 51.51, lng: -0.13, temp: 13, condition: 'Rain', color: '#94a3b8' },
  { name: 'Tokyo', lat: 35.68, lng: 139.69, temp: 28, condition: 'Sunny', color: '#fbbf24' },
  { name: 'Sydney', lat: -33.87, lng: 151.21, temp: 18, condition: 'Clear', color: '#34d399' },
  { name: 'Dubai', lat: 25.2, lng: 55.27, temp: 38, condition: 'Hot', color: '#f97316' },
  { name: 'Mumbai', lat: 19.08, lng: 72.88, temp: 31, condition: 'Humid', color: '#f59e0b' },
  { name: 'Paris', lat: 48.85, lng: 2.35, temp: 16, condition: 'Cloudy', color: '#a78bfa' },
  { name: 'São Paulo', lat: -23.55, lng: -46.63, temp: 25, condition: 'Storms', color: '#ef4444' },
  { name: 'Chicago', lat: 41.88, lng: -87.63, temp: 19, condition: 'Windy', color: '#38bdf8' },
  { name: 'Singapore', lat: 1.35, lng: 103.82, temp: 30, condition: 'Tropical', color: '#4ade80' },
];

export default function WorldMapCTA() {
  const globeRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);
  const [activeCity, setActiveCity] = useState(CITIES[1]);
  const { globalWeather } = useWeatherStore();

  useEffect(() => {
    let mounted = true;
    async function initGlobe() {
      if (!globeRef.current) return;
      const Globe = (await import('globe.gl')).default;

      // Build city points - use live global weather if available
      const points = CITIES.map(city => ({
        ...city,
        size: 0.5,
        color: city.color,
      }));

      const globe = Globe()(globeRef.current)
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
        .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .pointsData(points)
        .pointLat('lat')
        .pointLng('lng')
        .pointColor('color')
        .pointRadius('size')
        .pointAltitude(0.05)
        .pointLabel((d: any) => `
          <div style="background:rgba(2,4,20,0.92);border:1px solid rgba(0,212,255,0.3);
          padding:8px 12px;border-radius:10px;color:white;font-family:Inter,sans-serif;font-size:12px;min-width:120px;">
            <div style="font-weight:700;color:#00d4ff">${d.name}</div>
            <div style="color:#fff;font-size:1.1em;margin-top:2px">${d.temp}°C</div>
            <div style="color:rgba(255,255,255,0.6);font-size:0.9em">${d.condition}</div>
          </div>
        `)
        .onPointClick((d: any) => setActiveCity(d))
        .atmosphereColor('rgba(0,212,255,0.15)')
        .atmosphereAltitude(0.15)
        .width(globeRef.current.clientWidth)
        .height(globeRef.current.clientHeight);

      // Arcs between cities for visual flair
      const arcs = CITIES.slice(0, 6).map((city, i) => ({
        startLat: city.lat, startLng: city.lng,
        endLat: CITIES[(i + 3) % CITIES.length].lat,
        endLng: CITIES[(i + 3) % CITIES.length].lng,
        color: [city.color, CITIES[(i + 3) % CITIES.length].color],
      }));

      globe
        .arcsData(arcs)
        .arcColor('color')
        .arcDashLength(0.4)
        .arcDashGap(0.2)
        .arcDashAnimateTime(2500)
        .arcStroke(0.3)
        .arcAltitude(0.2);

      // Auto-rotate
      globe.controls().autoRotate = true;
      globe.controls().autoRotateSpeed = 0.6;
      globe.controls().enableZoom = false;

      if (mounted) {
        globeInstanceRef.current = globe;
        setLoaded(true);
      }
    }

    initGlobe();
    return () => { mounted = false; };
  }, []);

  return (
    <div style={{
      background: 'linear-gradient(to bottom, #090514, #020408)',
      position: 'relative',
      overflow: 'hidden',
      padding: '5rem 0 3rem',
    }}>
      {/* Background glows */}
      <div style={{ position: 'absolute', top: '20%', left: '10%', width: 600, height: 600, background: 'radial-gradient(circle, rgba(0,212,255,0.04), transparent 70%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(124,58,237,0.05), transparent 70%)', zIndex: 0 }} />

      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        style={{ textAlign: 'center', marginBottom: '3rem', position: 'relative', zIndex: 1 }}
      >
        <span style={{ color: '#00d4ff', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', fontFamily: 'monospace' }}>
          Live Global Intelligence
        </span>
        <h2 style={{
          fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, color: '#fff',
          fontFamily: 'Outfit, sans-serif', marginTop: '0.5rem',
          background: 'linear-gradient(135deg, #fff 40%, #00d4ff)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          Earth Weather Intelligence
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: 600, margin: '0.75rem auto', fontSize: '1rem' }}>
          Realtime atmospheric data from cities across the globe, powered by AI climate analytics.
        </p>
      </motion.div>

      {/* Globe + Info panel layout */}
      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '2rem', padding: '0 2rem',
        maxWidth: 1280, margin: '0 auto',
        flexWrap: 'wrap', position: 'relative', zIndex: 1,
      }}>

        {/* Left info panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          style={{ flex: '0 0 280px', display: 'flex', flexDirection: 'column', gap: '1rem' }}
        >
          {/* Active City Card */}
          <div style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${activeCity.color}33`,
            borderRadius: 18,
            padding: '1.5rem',
            boxShadow: `0 0 30px ${activeCity.color}15`,
          }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
              SELECTED CITY
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', fontFamily: 'Outfit, sans-serif' }}>
              {activeCity.name}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span style={{ fontSize: '3rem', fontWeight: 900, color: activeCity.color, lineHeight: 1, fontFamily: 'Outfit, sans-serif' }}>
                {activeCity.temp}°
              </span>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', paddingBottom: '0.5rem' }}>{activeCity.condition}</span>
            </div>
          </div>

          {/* City list */}
          <div style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: 18, padding: '1rem',
            display: 'flex', flexDirection: 'column', gap: '0.5rem',
          }}>
            <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em', marginBottom: '0.25rem', fontFamily: 'monospace' }}>
              GLOBAL CITIES
            </div>
            {CITIES.map((city, i) => (
              <motion.div
                key={i}
                onClick={() => setActiveCity(city)}
                whileHover={{ x: 4, background: 'rgba(255,255,255,0.04)' }}
                style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '0.35rem 0.5rem', borderRadius: 8,
                  cursor: 'pointer',
                  background: activeCity.name === city.name ? 'rgba(255,255,255,0.06)' : 'transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: city.color, flexShrink: 0 }} />
                  <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem' }}>{city.name}</span>
                </div>
                <span style={{ color: city.color, fontWeight: 700, fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  {city.temp}°C
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* 3D Globe */}
        <div style={{ flex: 1, position: 'relative', minWidth: 300, minHeight: 500 }}>
          {!loaded && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              color: 'rgba(255,255,255,0.4)', gap: '1rem',
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                style={{ width: 40, height: 40, border: '2px solid rgba(0,212,255,0.3)', borderTopColor: '#00d4ff', borderRadius: '50%' }}
              />
              <span style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>Loading Earth...</span>
            </div>
          )}
          <div
            ref={globeRef}
            style={{ width: '100%', height: 540, borderRadius: 24, overflow: 'hidden', opacity: loaded ? 1 : 0, transition: 'opacity 0.5s' }}
          />
          {/* Instruction hint */}
          {loaded && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
              style={{
                position: 'absolute', bottom: 16, left: '50%', transform: 'translateX(-50%)',
                background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.1)',
                padding: '0.35rem 1rem', borderRadius: 20,
                color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontFamily: 'monospace',
                whiteSpace: 'nowrap',
              }}
            >
              🌍 Click a city point to explore · Drag to rotate
            </motion.div>
          )}
        </div>
      </div>

      {/* Bottom stats bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.3 }}
        style={{
          display: 'flex', justifyContent: 'center', gap: '3rem', flexWrap: 'wrap',
          marginTop: '3rem', padding: '1.5rem 2rem',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          position: 'relative', zIndex: 1,
        }}
      >
        {[
          { label: 'Cities Monitored', value: '10,000+', color: '#00d4ff' },
          { label: 'Data Points / Sec', value: '1.2M', color: '#a855f7' },
          { label: 'Forecast Accuracy', value: '97.3%', color: '#00ff88' },
          { label: 'AI Models Active', value: '4', color: '#f59e0b' },
        ].map((stat, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: stat.color, fontFamily: 'Outfit, sans-serif' }}>
              {stat.value}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', marginTop: '0.25rem', fontFamily: 'monospace' }}>
              {stat.label}
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
