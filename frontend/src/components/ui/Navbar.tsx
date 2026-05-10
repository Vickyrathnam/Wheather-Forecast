'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Settings, Bell, Map, BarChart3, Radar, User, CloudLightning, X, Menu } from 'lucide-react';
import { useWeatherStore } from '@/store/weatherStore';
import { searchCities } from '@/services/weatherApi';
import { useGeolocation } from '@/hooks/useWeather';
import toast from 'react-hot-toast';

interface SearchResult {
  name: string; country: string; state?: string; lat: number; lon: number;
}

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const { currentCity, setLocation, activePanel, setActivePanel, alerts } = useWeatherStore();
  const { requestLocation } = useGeolocation();
  const searchRef = useRef<HTMLInputElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) { setSearchResults([]); return; }
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchCities(query);
        setSearchResults(results);
      } catch { setSearchResults([]); }
      finally { setSearching(false); }
    }, 300);
  };

  const selectCity = (result: SearchResult) => {
    setLocation(`${result.name}, ${result.country}`, result.lat, result.lon);
    setSearchQuery('');
    setSearchResults([]);
    setSearchOpen(false);
    toast.success(`📍 Switched to ${result.name}, ${result.country}`);
  };

  const navItems = [
    { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
    { id: 'map', icon: Map, label: 'Globe Map' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'radar', icon: Radar, label: 'Radar' },
    { id: 'admin', icon: User, label: 'Admin' },
  ];

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 64,
      background: 'rgba(2,6,15,0.85)',
      backdropFilter: 'blur(30px) saturate(180%)',
      borderBottom: '1px solid rgba(255,255,255,0.06)',
      zIndex: 50,
      display: 'flex', alignItems: 'center',
      padding: '0 1.5rem',
      gap: '1.5rem',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexShrink: 0 }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 20, ease: 'linear', repeat: Infinity }}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.8), rgba(124,58,237,0.6))',
            boxShadow: '0 0 15px rgba(0,212,255,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <CloudLightning size={16} color="white" />
        </motion.div>
        <span style={{
          fontFamily: 'Outfit, sans-serif',
          fontWeight: 700, fontSize: '1rem',
          background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          letterSpacing: '-0.01em',
        }}>
          Weather Forecast
        </span>
      </div>

      {/* Nav items - desktop */}
      <div className="hide-mobile" style={{ display: 'flex', gap: '0.25rem' }}>
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActivePanel(id as typeof activePanel)}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: '0.4rem 0.75rem', borderRadius: 8,
              background: activePanel === id ? 'rgba(0,212,255,0.12)' : 'transparent',
              border: `1px solid ${activePanel === id ? 'rgba(0,212,255,0.3)' : 'transparent'}`,
              color: activePanel === id ? '#00d4ff' : 'rgba(255,255,255,0.5)',
              fontSize: '0.8rem', cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Current location */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem',
        flexShrink: 0,
      }} className="hide-mobile">
        <MapPin size={13} color="#00d4ff" />
        <span style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {currentCity}
        </span>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <motion.button
          onClick={() => { setSearchOpen(o => !o); setTimeout(() => searchRef.current?.focus(), 100); }}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8, padding: '0.4rem 0.75rem',
            color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem',
          }}
          whileHover={{ background: 'rgba(255,255,255,0.08)' }}
        >
          <Search size={14} />
          <span className="hide-mobile">Search city...</span>
        </motion.button>

        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.96 }}
              style={{
                position: 'absolute', top: '110%', right: 0,
                width: 300,
                background: 'rgba(2,6,15,0.98)',
                backdropFilter: 'blur(30px)',
                border: '1px solid rgba(0,212,255,0.2)',
                borderRadius: 12,
                overflow: 'hidden',
                boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
                zIndex: 200,
              }}
            >
              <div style={{ padding: '0.75rem', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.5rem' }}>
                <Search size={14} color="rgba(255,255,255,0.4)" style={{ marginTop: 2 }} />
                <input
                  ref={searchRef}
                  value={searchQuery}
                  onChange={e => handleSearch(e.target.value)}
                  placeholder="Search cities worldwide..."
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    color: '#e2e8f0', fontSize: '0.85rem', fontFamily: 'Inter, sans-serif',
                  }}
                />
                {searching && (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 14, height: 14, border: '2px solid transparent', borderTopColor: '#00d4ff', borderRadius: '50%', flexShrink: 0 }} />
                )}
              </div>

              {/* Search results */}
              {searchResults.length > 0 && (
                <div>
                  {searchResults.map((r, i) => (
                    <motion.button
                      key={i}
                      onClick={() => selectCity(r)}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      style={{
                        width: '100%', padding: '0.7rem 1rem',
                        background: 'none', border: 'none',
                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                        cursor: 'pointer', textAlign: 'left',
                        borderBottom: '1px solid rgba(255,255,255,0.04)',
                        color: '#e2e8f0',
                        transition: 'background 0.15s',
                      }}
                      whileHover={{ background: 'rgba(0,212,255,0.08)' }}
                    >
                      <MapPin size={13} color="#00d4ff" />
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{r.name}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                          {r.state ? `${r.state}, ` : ''}{r.country}
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}

              {/* GPS button */}
              <button
                onClick={() => { requestLocation(); setSearchOpen(false); }}
                style={{
                  width: '100%', padding: '0.7rem 1rem',
                  background: 'none', border: 'none',
                  display: 'flex', alignItems: 'center', gap: '0.6rem',
                  cursor: 'pointer', color: '#00d4ff',
                  fontSize: '0.8rem',
                  borderTop: searchResults.length ? '1px solid rgba(255,255,255,0.06)' : 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
              >
                <MapPin size={13} />
                Use my current location
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Alert bell */}
      <motion.div style={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }} whileHover={{ scale: 1.1 }}>
        <Bell size={18} color="rgba(255,255,255,0.5)" />
        {alerts.length > 0 && (
          <div style={{
            position: 'absolute', top: -4, right: -4,
            width: 14, height: 14, borderRadius: '50%',
            background: '#f43f5e', fontSize: '0.6rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700,
          }}>
            {alerts.length}
          </div>
        )}
      </motion.div>

      {/* Mobile menu */}
      <button
        className="hide-desktop"
        onClick={() => setMenuOpen(o => !o)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)' }}
      >
        <Menu size={20} />
      </button>
    </nav>
  );
}
