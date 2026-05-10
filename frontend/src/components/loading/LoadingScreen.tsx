'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface LoadingScreenProps {
  onComplete: () => void;
}

export default function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  const [visible, setVisible] = useState(true);

  const phases = [
    'Initializing AI Engine...',
    'Loading Atmospheric Models...',
    'Calibrating ML Predictions...',
    'Syncing Satellite Data...',
    'Booting Weather Intelligence...',
    'System Ready.',
  ];

  useEffect(() => {
    const intervals = [
      { target: 20, delay: 0, duration: 600 },
      { target: 40, delay: 700, duration: 500 },
      { target: 60, delay: 1300, duration: 400 },
      { target: 80, delay: 1800, duration: 500 },
      { target: 95, delay: 2400, duration: 400 },
      { target: 100, delay: 2900, duration: 300 },
    ];

    intervals.forEach(({ target, delay }, i) => {
      setTimeout(() => {
        setProgress(target);
        setPhase(i);
      }, delay);
    });

    setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 600);
    }, 3800);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          className="loading-screen"
          style={{ zIndex: 9999 }}
        >
          {/* Background grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `
              linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }} />

          {/* Radial glow */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'radial-gradient(circle at center, rgba(0,212,255,0.08) 0%, transparent 70%)',
          }} />

          {/* Scan line */}
          <motion.div
            animate={{ y: ['-100vh', '100vh'] }}
            transition={{ duration: 3.5, ease: 'linear', repeat: Infinity }}
            style={{
              position: 'absolute', left: 0, right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.6), transparent)',
              boxShadow: '0 0 20px rgba(0,212,255,0.4)',
            }}
          />

          {/* Center content */}
          <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '2rem' }}>
            {/* AI Orb */}
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 360] }}
              transition={{ scale: { duration: 2, repeat: Infinity }, rotate: { duration: 8, ease: 'linear', repeat: Infinity } }}
              style={{
                width: 120, height: 120,
                margin: '0 auto 2rem',
                position: 'relative',
              }}
            >
              {/* Outer ring */}
              <div style={{
                position: 'absolute', inset: 0,
                borderRadius: '50%',
                border: '2px solid rgba(0,212,255,0.3)',
                animation: 'spin-slow 8s linear infinite',
              }} />
              {/* Middle ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
                style={{
                  position: 'absolute', inset: 10,
                  borderRadius: '50%',
                  border: '2px solid rgba(124,58,237,0.5)',
                  borderTopColor: 'transparent',
                }}
              />
              {/* Core */}
              <div style={{
                position: 'absolute', inset: 20,
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(0,212,255,0.8) 0%, rgba(124,58,237,0.6) 50%, transparent 100%)',
                boxShadow: '0 0 30px rgba(0,212,255,0.5), 0 0 60px rgba(124,58,237,0.3)',
              }} />
              {/* Inner pulse */}
              <motion.div
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  position: 'absolute', inset: 30,
                  borderRadius: '50%',
                  background: 'rgba(0,212,255,0.9)',
                  boxShadow: '0 0 20px rgba(0,212,255,0.8)',
                }}
              />
            </motion.div>

            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <h1 style={{
                fontSize: 'clamp(1.8rem, 4vw, 2.5rem)',
                fontFamily: 'Outfit, Inter, sans-serif',
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00d4ff, #7c3aed)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.02em',
                marginBottom: '0.5rem',
              }}>
                WEATHER FORECAST
              </h1>
              <p style={{ color: 'rgba(0,212,255,0.6)', fontSize: '0.85rem', letterSpacing: '0.3em', fontFamily: 'Space Grotesk, monospace' }}>
                AI CLIMATE INTELLIGENCE SYSTEM
              </p>
            </motion.div>

            {/* Phase text */}
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              style={{
                margin: '2rem 0 1rem',
                color: 'rgba(0,212,255,0.8)',
                fontSize: '0.8rem',
                letterSpacing: '0.15em',
                fontFamily: 'Space Grotesk, monospace',
                minHeight: '1.2em',
              }}
            >
              {phases[phase]}
            </motion.div>

            {/* Progress bar */}
            <div style={{ width: 320, margin: '0 auto' }}>
              <div style={{
                height: 2,
                background: 'rgba(255,255,255,0.08)',
                borderRadius: 1,
                overflow: 'hidden',
                marginBottom: '0.75rem',
              }}>
                <motion.div
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: 'linear-gradient(90deg, #00d4ff, #7c3aed)',
                    borderRadius: 1,
                    boxShadow: '0 0 8px rgba(0,212,255,0.6)',
                  }}
                />
              </div>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem',
                fontFamily: 'Space Grotesk, monospace',
              }}>
                <span>SYSTEM BOOT</span>
                <span>{progress}%</span>
              </div>
            </div>

            {/* Data dots */}
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '2rem' }}>
              {['LSTM', 'PROPHET', 'XGBOOST', 'ENSEMBLE'].map((model, i) => (
                <motion.div
                  key={model}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: progress > (i + 1) * 20 ? 1 : 0.2 }}
                  style={{
                    padding: '0.25rem 0.5rem',
                    border: `1px solid ${progress > (i + 1) * 20 ? 'rgba(0,212,255,0.4)' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: 4,
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                    color: progress > (i + 1) * 20 ? 'rgba(0,212,255,0.8)' : 'rgba(255,255,255,0.2)',
                    fontFamily: 'Space Grotesk, monospace',
                    transition: 'all 0.3s',
                  }}
                >
                  {model}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
