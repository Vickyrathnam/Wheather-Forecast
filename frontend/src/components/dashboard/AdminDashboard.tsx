'use client';

import { motion } from 'framer-motion';
import { Server, Activity, Database, Cpu, ShieldAlert, CheckCircle2, RefreshCcw } from 'lucide-react';
import { useWeatherStore } from '@/store/weatherStore';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { predictions } = useWeatherStore();
  const [metrics, setMetrics] = useState({ cpu: 42, ram: 68, latency: 124 });
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);

  // Simulate changing metrics
  useEffect(() => {
    const int = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 20) + 30,
        ram: Math.floor(Math.random() * 10) + 60,
        latency: Math.floor(Math.random() * 50) + 100,
      });
    }, 2000);
    return () => clearInterval(int);
  }, []);

  const handleRetrain = () => {
    if (training) return;
    setTraining(true);
    setProgress(0);
    toast('Initializing Neural Network Weights...', { icon: '🧠', style: { background: '#02060f', color: '#fff', border: '1px solid #7c3aed' } });
    
    let p = 0;
    const int = setInterval(() => {
      p += Math.random() * 15;
      if (p >= 100) {
        p = 100;
        clearInterval(int);
        setTraining(false);
        toast.success('AI Models Re-calibrated Successfully', { style: { background: '#02060f', color: '#00ff88', border: '1px solid #00ff88' } });
      }
      setProgress(p);
    }, 500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>
      
      {/* System Status Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <Server size={18} color="#00d4ff" />
            <span style={{ color: '#00ff88', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', display: 'inline-block' }} /> ONLINE
            </span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase' }}>Core Backend</div>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, fontFamily: 'Space Grotesk, monospace' }}>v1.0.4-prod</div>
        </div>
        
        <div className="stat-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <Activity size={18} color="#a855f7" />
            <span style={{ color: '#00d4ff', fontSize: '0.7rem' }}>{metrics.latency}ms ping</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', textTransform: 'uppercase' }}>AI Inference Engine</div>
          <div style={{ color: '#fff', fontSize: '1.2rem', fontWeight: 600, fontFamily: 'Space Grotesk, monospace' }}>Ensemble ML</div>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={16} color="#f59e0b" /> Resource Allocation
        </h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>CPU Usage</span>
            <span style={{ color: 'white', fontFamily: 'Space Grotesk, monospace' }}>{metrics.cpu}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${metrics.cpu}%`, background: 'linear-gradient(90deg, #f59e0b, #fb923c)' }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>Neural RAM Cache</span>
            <span style={{ color: 'white', fontFamily: 'Space Grotesk, monospace' }}>{metrics.ram}% (12.4 GB)</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${metrics.ram}%`, background: 'linear-gradient(90deg, #3b82f6, #00d4ff)' }} />
          </div>
        </div>
      </div>

      {/* Model Management */}
      <div className="glass-card" style={{ padding: '1.25rem' }}>
        <h3 style={{ color: 'white', fontSize: '0.9rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Database size={16} color="#00ff88" /> Model Parameters
        </h3>
        
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <span style={{ padding: '4px 8px', background: 'rgba(0,255,136,0.1)', border: '1px solid rgba(0,255,136,0.3)', borderRadius: 4, fontSize: '0.7rem', color: '#00ff88' }}>LSTM: Active</span>
          <span style={{ padding: '4px 8px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', borderRadius: 4, fontSize: '0.7rem', color: '#00d4ff' }}>Prophet: Active</span>
          <span style={{ padding: '4px 8px', background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: 4, fontSize: '0.7rem', color: '#a855f7' }}>XGBoost: Active</span>
        </div>

        <button 
          onClick={handleRetrain}
          disabled={training}
          style={{
            width: '100%', padding: '0.8rem', borderRadius: 8,
            background: training ? 'rgba(255,255,255,0.05)' : 'rgba(124,58,237,0.2)',
            border: `1px solid ${training ? 'rgba(255,255,255,0.1)' : 'rgba(124,58,237,0.5)'}`,
            color: training ? 'rgba(255,255,255,0.5)' : '#fff',
            cursor: training ? 'not-allowed' : 'pointer',
            fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            transition: 'all 0.3s'
          }}
        >
          {training ? (
            <>
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'flex' }}>
                <RefreshCcw size={16} />
              </motion.div>
              Re-calibrating Weights ({Math.round(progress)}%)
            </>
          ) : (
            <>
              <RefreshCcw size={16} /> Force Model Retraining
            </>
          )}
        </button>

        {training && (
          <div className="progress-bar" style={{ marginTop: '1rem', height: 2 }}>
            <div className="progress-fill" style={{ width: `${progress}%`, background: '#a855f7' }} />
          </div>
        )}
      </div>

    </div>
  );
}
