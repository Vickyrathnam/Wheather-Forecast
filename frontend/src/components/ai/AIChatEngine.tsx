'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Send, BrainCircuit, Volume2, VolumeX, CloudRain, Wind, Thermometer, Droplets, Sun, CloudLightning, Zap } from 'lucide-react';
import { useWeatherStore } from '@/store/weatherStore';

interface Message { role: 'user' | 'ai'; text: string; time: string; }

async function fetchAiResponse(input: string, weatherData: any, aiPrediction: any) {
  try {
    const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const res = await fetch(`${url}/api/ai/chat`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, weatherData, aiPrediction }),
    });
    const data = await res.json();
    return data.reply || "Processing your climate query...";
  } catch { return 'Neural link disrupted. Please check your connection.'; }
}

const QUICK = [
  { icon: '🌧️', label: 'Rain today?', q: 'Will it rain today?' },
  { icon: '🌡️', label: 'Temperature', q: 'What is the temperature forecast?' },
  { icon: '💨', label: 'Wind & AQI', q: 'What are the current wind speed and AQI?' },
  { icon: '⛈️', label: 'Storm risk', q: 'What is the storm risk level?' },
  { icon: '🌅', label: 'Sunrise/Sunset', q: 'What are todays sunrise and sunset times?' },
  { icon: '☁️', label: 'Cloud cover', q: 'What is the current cloud coverage?' },
];

export default function AIChatEngine({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([{
    role: 'ai',
    text: '🌍 Welcome to the AI Climate Engine. I can analyze weather patterns, storm risks, air quality, and provide detailed forecasts. Ask me anything about the atmosphere!',
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const recRef = useRef<any>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const { weatherData, aiPrediction } = useWeatherStore();

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isTyping]);

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text.slice(0, 300));
    u.rate = 0.92; u.pitch = 1.05;
    u.onstart = () => setIsSpeaking(true);
    u.onend = () => setIsSpeaking(false);
    const v = window.speechSynthesis.getVoices().find(v => v.lang === 'en-US');
    if (v) u.voice = v;
    window.speechSynthesis.speak(u);
  }, [voiceEnabled]);

  const sendMessage = useCallback(async (q: string) => {
    if (!q.trim()) return;
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'user', text: q, time }]);
    setInput(''); setIsTyping(true);
    const reply = await fetchAiResponse(q, weatherData, aiPrediction);
    setIsTyping(false);
    const t2 = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { role: 'ai', text: reply, time: t2 }]);
    speak(reply);
  }, [weatherData, aiPrediction, speak]);

  const startListen = useCallback(() => {
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (!SR) { alert('Use Chrome/Edge for voice input.'); return; }
    const r = new SR();
    r.continuous = false; r.interimResults = true; r.lang = 'en-US';
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((x: any) => x[0].transcript).join('');
      setInput(t);
      if (e.results[e.results.length - 1].isFinal) { sendMessage(t); setIsListening(false); }
    };
    r.onerror = () => setIsListening(false);
    r.onend = () => setIsListening(false);
    r.start(); recRef.current = r; setIsListening(true);
  }, [sendMessage]);

  const stopListen = () => { recRef.current?.stop(); setIsListening(false); };
  const stopSpeak = () => { window.speechSynthesis?.cancel(); setIsSpeaking(false); };

  const wd = weatherData;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)', zIndex: 900 }} />

          {/* Full Screen Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed', inset: '1vh 1vw',
              background: 'linear-gradient(145deg, #020410 0%, #060218 40%, #010c1a 100%)',
              border: '1px solid rgba(0,212,255,0.15)',
              borderRadius: 24,
              boxShadow: '0 0 120px rgba(0,100,255,0.08), 0 40px 120px rgba(0,0,0,0.9)',
              zIndex: 901, display: 'flex', overflow: 'hidden',
            }}
          >
            {/* ─── LEFT SIDEBAR: Weather Stats ─── */}
            <div style={{
              width: 260, flexShrink: 0,
              background: 'rgba(255,255,255,0.02)',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', flexDirection: 'column',
              padding: '1.5rem 1.25rem', gap: '1rem', overflowY: 'auto',
            }}>
              {/* Logo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                  style={{ width: 36, height: 36, borderRadius: '50%', background: 'radial-gradient(circle, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <BrainCircuit size={18} color="#fff" />
                </motion.div>
                <div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem', fontFamily: 'Outfit, sans-serif' }}>Climate Engine</div>
                  <div style={{ color: '#00ff88', fontSize: '0.6rem', letterSpacing: '0.1em', fontFamily: 'monospace' }}>● AI ONLINE</div>
                </div>
              </div>

              {/* Live weather card */}
              {wd && (
                <div style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.07), rgba(124,58,237,0.07))', border: '1px solid rgba(0,212,255,0.15)', borderRadius: 16, padding: '1.25rem' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: 'monospace', marginBottom: '0.5rem' }}>LIVE WEATHER</div>
                  <div style={{ color: '#00d4ff', fontSize: '0.9rem', fontWeight: 700 }}>{wd.city}, {wd.country}</div>
                  <div style={{ fontSize: '3rem', fontWeight: 900, color: '#fff', lineHeight: 1, fontFamily: 'Outfit, sans-serif', margin: '0.5rem 0' }}>{Math.round(wd.temperature)}°</div>
                  <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem', textTransform: 'capitalize' }}>{wd.description}</div>
                </div>
              )}

              {/* Stats grid */}
              {wd && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                  {[
                    { icon: <Droplets size={14} />, label: 'Humidity', value: `${wd.humidity}%`, color: '#38bdf8' },
                    { icon: <Wind size={14} />, label: 'Wind', value: `${Math.round(wd.windSpeed)}km/h`, color: '#a3e635' },
                    { icon: <Thermometer size={14} />, label: 'Feels', value: `${Math.round(wd.feelsLike)}°`, color: '#fb923c' },
                    { icon: <CloudRain size={14} />, label: 'AQI', value: wd.aqiCategory || 'Good', color: '#4ade80' },
                  ].map((s, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10, padding: '0.6rem', textAlign: 'center' }}>
                      <div style={{ color: s.color, display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' }}>{s.icon}</div>
                      <div style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 700, fontFamily: 'Outfit, sans-serif' }}>{s.value}</div>
                      <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.6rem' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Quick actions */}
              <div>
                <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.65rem', letterSpacing: '0.1em', fontFamily: 'monospace', marginBottom: '0.6rem' }}>QUICK QUERIES</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  {QUICK.map((q, i) => (
                    <motion.button key={i} onClick={() => sendMessage(q.q)}
                      whileHover={{ x: 4, background: 'rgba(0,212,255,0.08)' }}
                      whileTap={{ scale: 0.97 }}
                      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', padding: '0.5rem 0.75rem', borderRadius: 10, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', textAlign: 'left', color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif' }}>
                      <span style={{ fontSize: '1rem' }}>{q.icon}</span>{q.label}
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* ─── MAIN CHAT AREA ─── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>

              {/* Animated weather bg */}
              <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
                {[...Array(12)].map((_, i) => (
                  <motion.div key={i}
                    animate={{ y: ['-10%', '110%'], x: [`${Math.random() * 100}%`, `${Math.random() * 100}%`], opacity: [0, 0.3, 0] }}
                    transition={{ duration: 6 + Math.random() * 8, repeat: Infinity, delay: Math.random() * 6, ease: 'linear' }}
                    style={{ position: 'absolute', top: 0, fontSize: '1.2rem', left: `${(i / 12) * 100}%` }}>
                    {['💧', '❄️', '🌊', '☁️'][i % 4]}
                  </motion.div>
                ))}
                <div style={{ position: 'absolute', top: '20%', left: '30%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(0,100,200,0.04), transparent 70%)' }} />
                <div style={{ position: 'absolute', bottom: '10%', right: '20%', width: 300, height: 300, background: 'radial-gradient(circle, rgba(124,58,237,0.04), transparent 70%)' }} />
              </div>

              {/* Header */}
              <div style={{ position: 'relative', zIndex: 1, padding: '1.25rem 1.75rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(20px)' }}>
                <div>
                  <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.2rem', fontFamily: 'Outfit, sans-serif' }}>AI Climate Engine</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem', fontFamily: 'monospace' }}>Powered by Gemini Neural Intelligence · {messages.length - 1} messages</div>
                </div>
                <div style={{ display: 'flex', gap: '0.6rem' }}>
                  {isSpeaking && (
                    <motion.button onClick={stopSpeak} animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 0.8 }}
                      style={{ padding: '0.4rem 0.8rem', borderRadius: 20, background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', fontSize: '0.72rem', cursor: 'pointer', fontFamily: 'monospace' }}>
                      🔊 Stop
                    </motion.button>
                  )}
                  <motion.button onClick={() => { setVoiceEnabled(v => !v); stopSpeak(); }} whileHover={{ scale: 1.1 }}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: voiceEnabled ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: voiceEnabled ? '#00d4ff' : 'rgba(255,255,255,0.3)' }}>
                    {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
                  </motion.button>
                  <motion.button onClick={onClose} whileHover={{ scale: 1.1, background: 'rgba(244,63,94,0.15)' }}
                    style={{ width: 36, height: 36, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)' }}>
                    <X size={15} />
                  </motion.button>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 }}>
                {messages.map((msg, i) => (
                  <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                    style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '0.75rem', alignItems: 'flex-end' }}>
                    {msg.role === 'ai' && (
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'radial-gradient(circle, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <BrainCircuit size={16} color="#fff" />
                      </div>
                    )}
                    <div style={{ maxWidth: '72%' }}>
                      <div style={{
                        padding: '0.85rem 1.2rem',
                        borderRadius: msg.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                        background: msg.role === 'user'
                          ? 'linear-gradient(135deg, rgba(0,100,200,0.35), rgba(124,58,237,0.25))'
                          : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.07)'}`,
                        color: msg.role === 'user' ? '#e2e8f0' : 'rgba(255,255,255,0.88)',
                        fontSize: '0.92rem', lineHeight: 1.65, fontFamily: 'Inter, sans-serif',
                        boxShadow: msg.role === 'ai' ? '0 4px 20px rgba(0,0,0,0.3)' : 'none',
                      }}>{msg.text}</div>
                      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.65rem', marginTop: '0.25rem', textAlign: msg.role === 'user' ? 'right' : 'left', fontFamily: 'monospace' }}>{msg.time}</div>
                    </div>
                    {msg.role === 'user' && (
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #0080ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: '0.9rem' }}>👤</div>
                    )}
                  </motion.div>
                ))}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'radial-gradient(circle, #00d4ff, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <BrainCircuit size={16} color="#fff" />
                    </div>
                    <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px 20px 20px 4px', padding: '0.85rem 1.2rem', display: 'flex', gap: '5px' }}>
                      {[0, 1, 2].map(j => <motion.div key={j} animate={{ y: [-4, 4, -4] }} transition={{ duration: 0.6, repeat: Infinity, delay: j * 0.15 }} style={{ width: 7, height: 7, borderRadius: '50%', background: '#00d4ff' }} />)}
                    </div>
                  </motion.div>
                )}
                <div ref={endRef} />
              </div>

              {/* Input bar */}
              <div style={{ position: 'relative', zIndex: 1, padding: '1.25rem 1.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(20px)', display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <motion.button
                  onClick={isListening ? stopListen : startListen}
                  whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  animate={isListening ? { boxShadow: ['0 0 0 0 rgba(244,63,94,0.5)', '0 0 0 14px rgba(244,63,94,0)', '0 0 0 0 rgba(244,63,94,0.5)'] } : {}}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, border: 'none', background: isListening ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'rgba(255,255,255,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: isListening ? '#fff' : '#00d4ff' }}>
                  {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                </motion.button>

                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendMessage(input)}
                  placeholder={isListening ? '🎙️ Listening to your voice...' : 'Ask about weather, climate, storms, air quality...'}
                  style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 14, padding: '0.85rem 1.25rem', color: '#e2e8f0', fontSize: '0.95rem', outline: 'none', fontFamily: 'Inter, sans-serif' }}
                />

                <motion.button onClick={() => sendMessage(input)} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
                  style={{ width: 48, height: 48, borderRadius: '50%', flexShrink: 0, border: 'none', background: input.trim() ? 'linear-gradient(135deg, #00d4ff, #7c3aed)' : 'rgba(255,255,255,0.05)', cursor: input.trim() ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', opacity: input.trim() ? 1 : 0.35 }}>
                  <Send size={20} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
