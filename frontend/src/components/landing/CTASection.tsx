'use client';

import { motion } from 'framer-motion';

export default function CTASection() {
  return (
    <div style={{
      background: '#020408',
      color: '#fff',
      fontFamily: 'Syne, sans-serif',
      position: 'relative',
      overflow: 'hidden',
      borderTop: '1px solid rgba(255,255,255,0.05)',
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '4rem 2rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ color: '#00f5ff', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'JetBrains Mono, monospace' }}>Interactive Grid</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>Global Weather Intelligence</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', maxWidth: '600px', margin: '0.5rem auto', fontSize: '1rem' }}>
            Explore the live atmospheric grid powered by Aether Intelligence.
          </p>
        </div>

        {/* Embedded HTML Map */}
        <div style={{ 
          position: 'relative', 
          width: '100%', 
          height: '80vh', 
          borderRadius: 22, 
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.1)',
          boxShadow: '0 50px 100px rgba(0,0,0,0.5)'
        }}>
          <iframe 
            src="/cta-map.html" 
            style={{ 
              width: '100%', 
              height: '100%', 
              border: 'none',
              background: '#020408'
            }}
            title="Aether AI Weather Intelligence"
          />
        </div>
      </div>
    </div>
  );
}
