'use client';

import { motion } from 'framer-motion';
import { useWeatherStore } from '@/store/weatherStore';
import { Brain, TrendingUp, CloudRain, Zap, Flame, Wind, AlertCircle, CheckCircle } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis
} from 'recharts';

function RiskGauge({ label, value, color, icon: Icon }: {
  label: string; value: number; color: string;
  icon: React.ComponentType<{ size?: number; color?: string }>;
}) {
  return (
    <div className="glass-card" style={{ padding: '0.75rem', textAlign: 'center' }}>
      <Icon size={16} color={color} />
      <div style={{
        fontSize: '1.4rem', fontWeight: 700, color,
        fontFamily: 'Outfit, sans-serif',
        marginTop: '0.25rem',
        textShadow: `0 0 12px ${color}`,
      }}>
        {Math.round(value)}%
      </div>
      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem', letterSpacing: '0.05em' }}>{label}</div>
      <div style={{ marginTop: '0.4rem', background: 'rgba(255,255,255,0.08)', height: 3, borderRadius: 2 }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{ height: '100%', background: color, borderRadius: 2, boxShadow: `0 0 6px ${color}` }}
        />
      </div>
    </div>
  );
}

function ConfidenceDisplay({ confidence }: {
  confidence: { overall: number; lstm: number; prophet: number; xgboost: number }
}) {
  const models = [
    { name: 'LSTM', value: confidence.lstm, color: '#00d4ff' },
    { name: 'Prophet', value: confidence.prophet, color: '#a855f7' },
    { name: 'XGBoost', value: confidence.xgboost, color: '#00ff88' },
    { name: 'Ensemble', value: confidence.overall, color: '#f59e0b' },
  ];

  return (
    <div className="glass-card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Brain size={14} color="#00d4ff" />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, monospace' }}>
          AI Confidence
        </span>
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 6px #00ff88', animation: 'breathe 2s ease-in-out infinite' }} />
          <span style={{ color: '#00ff88', fontSize: '0.65rem' }}>LIVE</span>
        </div>
      </div>
      {models.map(m => (
        <div key={m.name} style={{ marginBottom: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontFamily: 'Space Grotesk, monospace' }}>{m.name}</span>
            <span style={{ color: m.color, fontSize: '0.7rem', fontWeight: 600 }}>{m.value}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', height: 3, borderRadius: 2 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${m.value}%` }}
              transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
              style={{ height: '100%', background: m.color, borderRadius: 2, boxShadow: `0 0 8px ${m.color}60` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function TemperatureChart({ prediction }: { prediction: ReturnType<typeof useWeatherStore>['aiPrediction'] }) {
  if (!prediction?.predictions?.temperature) return null;
  const { ensemble, lstm, prophet } = prediction.predictions.temperature;

  const data = ensemble.map((val, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    ensemble: Math.round(val),
    lstm: Math.round(lstm[i]),
    prophet: Math.round(prophet[i]),
  }));

  return (
    <div className="glass-card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <TrendingUp size={14} color="#00d4ff" />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, monospace' }}>
          Neural Temperature Curve
        </span>
      </div>
      <ResponsiveContainer width="100%" height={90}>
        <AreaChart data={data} margin={{ top: 5, right: 0, bottom: 0, left: -30 }}>
          <defs>
            <linearGradient id="ensembleGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="day" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 9 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: 'rgba(8,13,26,0.95)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: '#e2e8f0' }}
            itemStyle={{ color: '#00d4ff' }}
          />
          <Area type="monotone" dataKey="lstm" stroke="#7c3aed" strokeWidth={1} fill="none" strokeDasharray="3 3" dot={false} />
          <Area type="monotone" dataKey="prophet" stroke="#a855f7" strokeWidth={1} fill="none" strokeDasharray="2 4" dot={false} />
          <Area type="monotone" dataKey="ensemble" stroke="#00d4ff" strokeWidth={2} fill="url(#ensembleGrad)" dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.25rem' }}>
        {[['LSTM', '#7c3aed'], ['Prophet', '#a855f7'], ['Ensemble', '#00d4ff']].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
            <div style={{ width: 12, height: 2, background: color }} />
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RainProbabilityGauge({ probability }: { probability: number }) {
  const angle = (probability / 100) * 180 - 90;

  return (
    <div className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', justifyContent: 'center' }}>
        <CloudRain size={14} color="#3b82f6" />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, monospace' }}>
          Rain Probability
        </span>
      </div>
      {/* Semi-circle gauge */}
      <div style={{ position: 'relative', width: 120, height: 70, margin: '0 auto' }}>
        <svg width="120" height="70" viewBox="0 0 120 70">
          {/* Background arc */}
          <path d="M 10 60 A 50 50 0 0 1 110 60" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
          {/* Value arc */}
          <motion.path
            d="M 10 60 A 50 50 0 0 1 110 60"
            fill="none"
            stroke="url(#rainGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${(probability / 100) * 157} 157`}
            initial={{ strokeDasharray: '0 157' }}
            animate={{ strokeDasharray: `${(probability / 100) * 157} 157` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="rainGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#00d4ff" />
            </linearGradient>
          </defs>
          {/* Needle */}
          <motion.line
            x1="60" y1="60"
            x2="60" y2="20"
            stroke="#00d4ff"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ transformOrigin: '60px 60px' }}
            initial={{ rotate: -90 }}
            animate={{ rotate: angle }}
            transition={{ duration: 1.5, ease: 'easeOut', type: 'spring', stiffness: 60 }}
          />
          <circle cx="60" cy="60" r="4" fill="#00d4ff" />
        </svg>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
          <span style={{ color: '#3b82f6', fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>
            {Math.round(probability)}%
          </span>
        </div>
      </div>
    </div>
  );
}

function AIInsights({ insights }: { insights: string[] }) {
  return (
    <div className="glass-card" style={{ padding: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <Brain size={14} color="#a855f7" />
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Space Grotesk, monospace' }}>
          AI Insights
        </span>
      </div>
      {insights.map((insight, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          style={{
            padding: '0.5rem 0.75rem',
            background: 'rgba(168,85,247,0.08)',
            border: '1px solid rgba(168,85,247,0.15)',
            borderRadius: 8,
            marginBottom: '0.4rem',
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.75rem',
            lineHeight: 1.5,
          }}
        >
          {insight}
        </motion.div>
      ))}
    </div>
  );
}

export default function AIPredictionPanel() {
  const { aiPrediction, weatherData } = useWeatherStore();

  if (!aiPrediction) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card shimmer-effect" style={{ height: 80 }} />
        ))}
      </div>
    );
  }

  const ai = aiPrediction;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {/* Confidence */}
      <ConfidenceDisplay confidence={ai.confidence} />

      {/* Risk meters */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <RiskGauge label="Rain Risk" value={ai.rainProbability} color="#3b82f6" icon={CloudRain} />
        <RiskGauge label="Storm Risk" value={ai.stormRisk} color="#7c3aed" icon={Zap} />
        <RiskGauge label="Heatwave" value={ai.heatwaveRisk} color="#f59e0b" icon={Flame} />
        <RiskGauge label="Flood Risk" value={ai.floodRisk} color="#06b6d4" icon={Wind} />
      </div>

      {/* Rain gauge */}
      <RainProbabilityGauge probability={ai.rainProbability} />

      {/* Temperature neural curve */}
      <TemperatureChart prediction={ai} />

      {/* AI Insights */}
      {ai.aiInsights && ai.aiInsights.length > 0 && (
        <AIInsights insights={ai.aiInsights} />
      )}

      {/* Model accuracy */}
      <div className="glass-card" style={{ padding: '0.75rem' }}>
        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', marginBottom: '0.5rem', fontFamily: 'Space Grotesk, monospace' }}>
          MODEL METRICS
        </div>
        {ai.modelMetrics && Object.entries(ai.modelMetrics).map(([model, metrics]) => (
          <div key={model} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
            <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', fontFamily: 'Space Grotesk, monospace', textTransform: 'uppercase' }}>
              {model}
            </span>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <span style={{ color: '#00ff88', fontSize: '0.65rem' }}>ACC: {metrics.accuracy}%</span>
              <span style={{ color: '#00d4ff', fontSize: '0.65rem' }}>R²: {metrics.r2}</span>
              <span style={{ color: '#a855f7', fontSize: '0.65rem' }}>MAE: {metrics.mae}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
