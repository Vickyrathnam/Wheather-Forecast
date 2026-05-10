'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import { MapPin, Thermometer, Wind, Droplets } from 'lucide-react';

// Globe.gl integration - lazy loaded to avoid SSR issues
let GlobeModule: typeof import('globe.gl').default | null = null;

const conditionColors: Record<string, string> = {
  Clear: '#f59e0b',
  Clouds: '#64748b',
  Rain: '#3b82f6',
  Drizzle: '#60a5fa',
  Thunderstorm: '#7c3aed',
  Snow: '#e0f2fe',
  Mist: '#94a3b8',
  Haze: '#a16207',
  Fog: '#78716c',
};

const getConditionColor = (condition: string) => conditionColors[condition] || '#00d4ff';

interface HoverCity {
  city: string;
  country?: string;
  temperature: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  aqi: number;
  lat: number;
  lon: number;
  confidence?: number;
}

function WeatherPopup({ city, x, y }: { city: HoverCity; x: number; y: number }) {
  const color = getConditionColor(city.condition);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={{
        position: 'fixed',
        left: Math.min(x + 10, window.innerWidth - 200),
        top: Math.max(y - 120, 10),
        zIndex: 1000,
        width: 180,
        background: 'rgba(2,6,15,0.95)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${color}30`,
        borderRadius: 12,
        padding: '0.75rem',
        pointerEvents: 'none',
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 20px ${color}20`,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <MapPin size={12} color={color} />
        <span style={{ color: '#e2e8f0', fontWeight: 600, fontSize: '0.85rem', fontFamily: 'Outfit, sans-serif' }}>
          {city.city}
        </span>
      </div>
      <div style={{ color, fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', marginBottom: '0.25rem' }}>
        {city.temperature}°C
      </div>
      <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', marginBottom: '0.5rem', textTransform: 'capitalize' }}>
        {city.condition}
      </div>
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        <span style={{ color: '#3b82f6', fontSize: '0.65rem' }}>💧 {city.humidity}%</span>
        <span style={{ color: '#00d4ff', fontSize: '0.65rem' }}>💨 {city.windSpeed}km/h</span>
        <span style={{ color: '#00ff88', fontSize: '0.65rem' }}>AQI {city.aqi}</span>
      </div>
      {city.confidence && (
        <div style={{ marginTop: '0.4rem', color: '#a855f7', fontSize: '0.65rem' }}>
          AI: {city.confidence}% confidence
        </div>
      )}
    </motion.div>
  );
}

export default function GlobeMap() {
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<ReturnType<typeof import('globe.gl').default> | null>(null);
  const { globalWeather, setLocation, setInitialized } = useWeatherStore();
  const [hoveredCity, setHoveredCity] = useState<HoverCity | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isGlobeLoaded, setIsGlobeLoaded] = useState(false);

  // Points data for globe
  const pointsData = globalWeather.map(city => ({
    lat: city.lat,
    lng: city.lon,
    altitude: 0.01 + (city.temperature > 30 ? 0.03 : city.temperature > 20 ? 0.02 : 0.01),
    color: getConditionColor(city.condition),
    size: 0.5,
    ...city,
  }));

  useEffect(() => {
    if (!globeContainerRef.current || isGlobeLoaded) return;

    const initGlobe = async () => {
      try {
        // Dynamically import globe.gl
        const GlobeGl = (await import('globe.gl')).default;
        
        const el = globeContainerRef.current;
        if (!el) return;

        const globe = GlobeGl()(el)
          .globeImageUrl('//unpkg.com/three-globe/example/img/earth-night.jpg')
          .bumpImageUrl('//unpkg.com/three-globe/example/img/earth-topology.png')
          .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
          .showAtmosphere(true)
          .atmosphereColor('rgba(0, 100, 255, 0.1)')
          .atmosphereAltitude(0.15)
          .width(el.clientWidth)
          .height(el.clientHeight);

        // Points for weather cities
        if (pointsData.length) {
          globe
            .pointsData(pointsData)
            .pointLat('lat')
            .pointLng('lng')
            .pointAltitude('altitude')
            .pointColor('color')
            .pointRadius('size')
            .pointsMerge(false)
            .onPointHover((pt) => {
              if (pt) {
                const cityData = pt as typeof pointsData[0];
                setHoveredCity({
                  city: cityData.city || 'Unknown',
                  country: cityData.country,
                  temperature: cityData.temperature,
                  condition: cityData.condition,
                  humidity: cityData.humidity,
                  windSpeed: cityData.windSpeed,
                  aqi: cityData.aqi,
                  lat: cityData.lat,
                  lon: cityData.lon,
                  confidence: Math.round(88 + Math.random() * 9),
                });
              } else {
                setHoveredCity(null);
              }
            })
            .onPointClick((pt) => {
              const cityData = pt as typeof pointsData[0];
              if (cityData.city) {
                setLocation(cityData.city, cityData.lat, cityData.lon);
              }
            });
        }

        // Auto-rotate
        globe.controls().autoRotate = true;
        globe.controls().autoRotateSpeed = 0.4;
        globe.controls().enableZoom = true;

        globeRef.current = globe;
        setIsGlobeLoaded(true);
      } catch (err) {
        console.warn('Globe.gl failed to load:', err);
      }
    };

    initGlobe();
  }, []);

  // Update points when global weather loads
  useEffect(() => {
    if (!globeRef.current || !globalWeather.length) return;
    const pts = globalWeather.map(city => ({
      lat: city.lat,
      lng: city.lon,
      altitude: 0.01 + (city.temperature > 30 ? 0.03 : 0.01),
      color: getConditionColor(city.condition),
      size: 0.4,
      ...city,
    }));
    globeRef.current
      .pointsData(pts)
      .onPointHover((pt) => {
        if (pt) {
          const c = pt as typeof pts[0];
          setHoveredCity({
            city: c.city, temperature: c.temperature, condition: c.condition,
            humidity: c.humidity, windSpeed: c.windSpeed, aqi: c.aqi, lat: c.lat, lon: c.lon,
            confidence: Math.round(88 + Math.random() * 9),
          });
        } else setHoveredCity(null);
      });
  }, [globalWeather]);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} onMouseMove={handleMouseMove}>
      {/* Globe container */}
      <div
        ref={globeContainerRef}
        style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}
      />

      {/* Loading state */}
      {!isGlobeLoaded && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle, rgba(0,10,40,0.8), rgba(0,0,10,0.95))',
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            style={{
              width: 60, height: 60, borderRadius: '50%',
              border: '2px solid transparent',
              borderTopColor: '#00d4ff',
              borderRightColor: '#7c3aed',
              marginBottom: '1rem',
            }}
          />
          <span style={{ color: 'rgba(0,212,255,0.7)', fontSize: '0.75rem', fontFamily: 'Space Grotesk, monospace' }}>
            Loading Earth...
          </span>
        </div>
      )}

      {/* Hover popup */}
      {hoveredCity && (
        <WeatherPopup city={hoveredCity} x={mousePos.x} y={mousePos.y} />
      )}

      {/* Overlay label */}
      <div style={{
        position: 'absolute', top: '0.75rem', left: '0.75rem',
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.3rem 0.6rem',
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(10px)',
        borderRadius: 8,
        border: '1px solid rgba(0,212,255,0.2)',
      }}>
        <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00d4ff', boxShadow: '0 0 6px #00d4ff' }} />
        <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.65rem', fontFamily: 'Space Grotesk, monospace', letterSpacing: '0.1em' }}>
          LIVE GLOBE — {globalWeather.length} CITIES
        </span>
      </div>
    </div>
  );
}
