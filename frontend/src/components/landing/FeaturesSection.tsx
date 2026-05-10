'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Cloud, Shield, Activity, Globe, Zap, Cpu, MapPin, Search, Thermometer, Droplets, Wind, Eye, Gauge, Compass } from 'lucide-react';
import AIChatEngine from '@/components/ai/AIChatEngine';


export default function FeaturesSection() {
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div style={{
      background: 'linear-gradient(to bottom, #020617, #090514)',
      color: '#e2e8f0',
      fontFamily: 'Inter, sans-serif',
      padding: '4rem 2rem',
      position: 'relative',
      overflow: 'hidden'
    }}>

      {/* Background glow effects */}
      <div style={{ position: 'absolute', top: '10%', left: '20%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0, 212, 255, 0.05), transparent 70%)', zIndex: 0 }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(168, 85, 247, 0.05), transparent 70%)', zIndex: 0 }} />

      <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        
        {/* HERO CONTENT */}
        <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span style={{ color: '#00d4ff', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, monospace' }}>Platform Overview</span>
            <h1 style={{ 
              fontSize: 'clamp(2.5rem, 5vw, 4rem)', 
              fontWeight: 800, 
              fontFamily: 'Outfit, sans-serif',
              marginTop: '0.5rem',
              marginBottom: '1rem',
              background: 'linear-gradient(135deg, #fff, #a855f7)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent'
            }}>
              AI-Powered Future Weather Intelligence
            </h1>
            <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.7)', maxWidth: '800px', margin: '0 auto 1.5rem', lineHeight: 1.6 }}>
              Experience next-generation climate forecasting powered by Artificial Intelligence, Machine Learning, realtime atmospheric simulations, and cinematic environmental visualization.
            </p>
            <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '750px', margin: '0 auto 2.5rem', lineHeight: 1.6 }}>
              Weather Forecast transforms traditional forecasting into an immersive AI-driven climate intelligence experience. Analyze future weather patterns, storm risks, rainfall probabilities, air quality, and environmental changes through futuristic holographic dashboards and realtime atmospheric simulations.
            </p>
          </motion.div>

          {/* CTA & Labels */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <button className="glow-button" style={{ padding: '0.8rem 1.5rem', borderRadius: 8, background: 'linear-gradient(135deg, #00d4ff, #a855f7)', color: 'white', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Explore Forecast</button>
            <motion.button
              onClick={() => setChatOpen(true)}
              whileHover={{ scale: 1.05, boxShadow: '0 0 24px rgba(0,212,255,0.4)' }}
              whileTap={{ scale: 0.97 }}
              style={{ padding: '0.8rem 1.5rem', borderRadius: 8, background: 'rgba(0,212,255,0.08)', color: '#00d4ff', border: '1px solid rgba(0,212,255,0.3)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              ⚡ Launch AI Climate Engine
            </motion.button>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['AI Climate Prediction', 'Realtime Atmospheric Simulation', 'Future Storm Intelligence', 'Neural Weather Analytics', 'Global Weather Intelligence'].map((label, i) => (
              <span key={i} style={{ padding: '4px 10px', background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 20, fontSize: '0.75rem', color: '#00d4ff', fontFamily: 'Space Grotesk, monospace' }}>
                {label}
              </span>
            ))}
          </div>
        </div>

        {/* HERO RIGHT PANEL MOCKUP */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#fff', lineHeight: 1 }}>28°</h3>
                <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '1rem' }}>Partly Cloudy</span>
              </div>
              <Cloud size={48} color="#00d4ff" />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.85rem' }}>
              <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Humidity:</span> <span style={{ color: '#fff' }}>72%</span></div>
              <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Wind Speed:</span> <span style={{ color: '#fff' }}>18 km/h</span></div>
              <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>AQI:</span> <span style={{ color: '#00ff88' }}>Moderate</span></div>
              <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>UV Index:</span> <span style={{ color: '#fff' }}>7</span></div>
              <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Pressure:</span> <span style={{ color: '#fff' }}>1008 hPa</span></div>
              <div><span style={{ color: 'rgba(255,255,255,0.4)' }}>Visibility:</span> <span style={{ color: '#fff' }}>8 km</span></div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Brain size={16} color="#a855f7" /> AI Forecast Metrics
            </h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>AI Prediction Confidence</span>
              <span style={{ color: '#00ff88', fontWeight: 700, fontFamily: 'Space Grotesk, monospace' }}>98.2% Accurate</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Rain Probability</span>
              <span style={{ color: '#00d4ff', fontWeight: 700, fontFamily: 'Space Grotesk, monospace' }}>62%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Storm Probability</span>
              <span style={{ color: '#f43f5e', fontWeight: 700, fontFamily: 'Space Grotesk, monospace' }}>31%</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>Climate Trend</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>Stable Pattern</span>
            </div>
          </div>
        </div>

        {/* AI ANALYTICS SECTION */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: '#a855f7', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, monospace' }}>Advanced Analytics</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#fff', marginTop: '0.5rem' }}>AI Climate Intelligence</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '700px', margin: '0.5rem auto', lineHeight: 1.6 }}>
              Advanced machine learning models continuously analyze atmospheric pressure, temperature flow, humidity evolution, satellite datasets, and environmental anomalies to predict future climate behavior with high accuracy.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div className="stat-card">
              <Thermometer size={24} color="#00d4ff" />
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Neural Temperature Forecast</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>Realtime AI-generated future temperature analysis powered by LSTM climate forecasting models.</p>
            </div>
            <div className="stat-card">
              <Droplets size={24} color="#00ff88" />
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Rainfall Probability Engine</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>Advanced precipitation prediction using atmospheric pressure mapping and humidity evolution.</p>
            </div>
            <div className="stat-card">
              <Activity size={24} color="#f43f5e" />
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Storm Detection System</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>Realtime thunderstorm and cyclone risk analysis with AI confidence scoring.</p>
            </div>
            <div className="stat-card">
              <Eye size={24} color="#a855f7" />
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginTop: '1rem', marginBottom: '0.5rem' }}>AQI Intelligence</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>Predict future air quality trends and pollution movement using environmental AI models.</p>
            </div>
          </div>
        </div>

        {/* SECTIONS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          
          {/* World Map */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <Globe size={32} color="#00d4ff" />
            <h3 style={{ color: '#fff', fontSize: '1.3rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Global Weather Intelligence Network</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Hover across the world to explore realtime weather conditions, AI climate predictions, atmospheric behavior, and severe weather alerts from every region on Earth.
            </p>
          </div>

          {/* 3D Earth */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <Compass size={32} color="#a855f7" />
            <h3 style={{ color: '#fff', fontSize: '1.3rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Realtime Earth Climate Simulation</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Visualize Earth’s atmosphere in realtime through immersive 3D satellite simulations featuring storm movement, global heatmaps, cloud layers, wind patterns, and AI-driven environmental analytics.
            </p>
          </div>

          {/* Live Radar */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <Activity size={32} color="#00ff88" />
            <h3 style={{ color: '#fff', fontSize: '1.3rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Advanced Storm & Radar Tracking</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Track rain systems, lightning zones, cyclone movement, atmospheric turbulence, and realtime environmental changes through futuristic radar visualization technology.
            </p>
          </div>

          {/* AI Assistant */}
          <div className="glass-card" style={{ padding: '2rem' }}>
            <Brain size={32} color="#f59e0b" />
            <h3 style={{ color: '#fff', fontSize: '1.3rem', marginTop: '1rem', marginBottom: '0.5rem' }}>Meet Your AI Climate Assistant</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: 1.6 }}>
              Ask questions about weather, travel conditions, farming guidance, climate behavior, or storm risks through an intelligent AI assistant trained on atmospheric datasets.
            </p>
          </div>
        </div>

        {/* WEATHER PREDICTION SECTION */}
        <div style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: '#00ff88', fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, monospace' }}>Forecasting Engine</span>
            <h2 style={{ fontSize: '2.5rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#fff', marginTop: '0.5rem' }}>Future Weather Prediction Engine</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: '700px', margin: '0.5rem auto', lineHeight: 1.6 }}>
              Powered by advanced AI forecasting models including LSTM, Prophet, ARIMA, and XGBoost.
            </p>
          </div>

          <div className="marquee-container">
            <div className="marquee-content">
              {['Temperature Forecasting', 'Rainfall Intelligence', 'Cyclone Detection', 'Flood Risk Analysis', 'Heatwave Alerts'].map((item, i) => (
                <div key={i} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', minWidth: '220px' }}>
                  <span style={{ color: '#00d4ff', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>{item}</span>
                </div>
              ))}
            </div>
            <div className="marquee-content">
              {['Temperature Forecasting', 'Rainfall Intelligence', 'Cyclone Detection', 'Flood Risk Analysis', 'Heatwave Alerts'].map((item, i) => (
                <div key={i + 10} className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', minWidth: '220px' }}>
                  <span style={{ color: '#00d4ff', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Poppins, sans-serif' }}>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WEATHER MODES CONTENT */}
        <div style={{ marginBottom: '5rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit, sans-serif', color: '#fff', textAlign: 'center', marginBottom: '3rem' }}>Atmospheric Simulation Modes</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#fb923c', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Sunny Mode</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>Volumetric sunlight, floating clouds, heatwave distortion.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#38bdf8', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Rain Mode</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>Wet reflections, water ripple shaders, fog movement.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#a855f7', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Thunderstorm</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>Procedural lightning generation with electric particles.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Snow Mode</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>Volumetric snowfall with ice crystal particles.</p>
            </div>
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ color: '#6366f1', fontSize: '1.1rem', marginBottom: '0.5rem' }}>Night Mode</h3>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem', lineHeight: 1.5 }}>Nebula clouds, aurora waves, animated stars.</p>
            </div>
          </div>
        </div>

        {/* MOBILE APP & NOTIFICATIONS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '5rem' }}>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '1rem' }}>Weather Intelligence Everywhere</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Access realtime climate forecasting, AI insights, atmospheric simulations, and futuristic weather analytics seamlessly across mobile, tablet, desktop, and immersive devices.
            </p>
          </div>
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h3 style={{ color: '#f43f5e', fontSize: '1.5rem', marginBottom: '1rem' }}>Smart Environmental Alerts</h3>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              Receive instant AI-generated alerts for: Storm warnings, Rain predictions, Heatwaves, AQI hazards, Lightning risks, and Flood threats.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '3rem', marginTop: '5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
            <div>
              <h3 style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>Weather Forecast</h3>
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginTop: '0.5rem', lineHeight: 1.5 }}>
                Next-generation AI-powered climate intelligence platform delivering futuristic environmental analytics.
              </p>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '1rem' }}>Platform</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>Forecast</li>
                <li>AI Analytics</li>
                <li>Radar</li>
                <li>Earth Simulation</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '1rem' }}>Resources</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>API Documentation</li>
                <li>Climate Reports</li>
                <li>Research</li>
              </ul>
            </div>
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.9rem', marginBottom: '1rem' }}>Company</h4>
              <ul style={{ listStyle: 'none', padding: 0, fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <li>About</li>
                <li>Careers</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <div style={{ textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
            <p style={{ color: '#00d4ff', fontSize: '0.9rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>
              “Predicting Tomorrow’s Atmosphere with Artificial Intelligence.”
            </p>
          </div>
        </div>

      </div>
    </div>

    {/* AI Chat Engine Modal */}
    <AIChatEngine isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
}
