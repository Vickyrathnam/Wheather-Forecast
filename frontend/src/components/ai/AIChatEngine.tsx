'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Send, BrainCircuit, Volume2, VolumeX, Zap } from 'lucide-react';
import { useWeatherStore } from '@/store/weatherStore';

interface Message {
  role: 'user' | 'ai';
  text: string;
}

async function fetchAiResponse(input: string, weatherData: any, aiPrediction: any) {
  try {
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
    const res = await fetch(`${backendUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: input, weatherData, aiPrediction }),
    });
    const data = await res.json();
    return data.reply || "I'm processing your query. Please try again.";
  } catch {
    return 'Neural link disrupted. Please check your connection.';
  }
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIChatEngine({ isOpen, onClose }: Props) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: '🌍 Welcome to the AI Climate Engine. I can answer questions about weather, storms, forecasts, air quality, and climate analytics. How can I assist you?' }
  ]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { weatherData, aiPrediction } = useWeatherStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const speakText = useCallback((text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1.05;
    utterance.volume = 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    // prefer a good English voice
    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.lang === 'en-US' && v.name.includes('Google')) || voices[0];
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }, [voiceEnabled]);

  const handleQuery = useCallback(async (query: string) => {
    if (!query.trim()) return;
    setMessages(prev => [...prev, { role: 'user', text: query }]);
    setInput('');
    setTranscript('');
    setIsTyping(true);
    const aiReply = await fetchAiResponse(query, weatherData, aiPrediction);
    setIsTyping(false);
    setMessages(prev => [...prev, { role: 'ai', text: aiReply }]);
    speakText(aiReply);
  }, [weatherData, aiPrediction, speakText]);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome or Edge.');
      return;
    }
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const text = Array.from(e.results).map((r: SpeechRecognitionResult) => r[0].transcript).join('');
      setTranscript(text);
      setInput(text);
      if (e.results[e.results.length - 1].isFinal) {
        handleQuery(text);
        setIsListening(false);
      }
    };
    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error('Speech error:', e.error);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, [handleQuery]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const quickQuestions = [
    '🌧️ Will it rain today?',
    '🌡️ Temperature forecast?',
    '💨 Wind & AQI update?',
    '⛈️ Storm risk level?',
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(0,0,0,0.75)',
              backdropFilter: 'blur(8px)',
              zIndex: 200,
            }}
          />

          {/* Chat Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(680px, 95vw)',
              height: 'min(80vh, 720px)',
              background: 'linear-gradient(145deg, rgba(2,4,20,0.98), rgba(10,4,30,0.98))',
              backdropFilter: 'blur(40px)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 24,
              boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 60px rgba(0,212,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
              zIndex: 201,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.25rem 1.5rem',
              background: 'linear-gradient(135deg, rgba(0,212,255,0.08), rgba(124,58,237,0.08))',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <motion.div
                  animate={{ scale: [1, 1.15, 1], boxShadow: ['0 0 12px rgba(0,212,255,0.4)', '0 0 24px rgba(0,212,255,0.8)', '0 0 12px rgba(0,212,255,0.4)'] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  style={{
                    width: 42, height: 42, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,212,255,0.9), rgba(124,58,237,0.7))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <BrainCircuit size={22} color="white" />
                </motion.div>
                <div>
                  <div style={{ color: '#e2e8f0', fontWeight: 700, fontSize: '1rem', fontFamily: 'Outfit, sans-serif' }}>
                    AI Climate Engine
                  </div>
                  <div style={{ fontSize: '0.65rem', letterSpacing: '0.12em', color: '#00ff88', fontFamily: 'monospace' }}>
                    ● NEURAL CORE ONLINE
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {/* Voice toggle */}
                <motion.button
                  onClick={() => { setVoiceEnabled(v => !v); stopSpeaking(); }}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  title={voiceEnabled ? 'Mute AI voice' : 'Enable AI voice'}
                  style={{
                    width: 34, height: 34, borderRadius: '50%', border: 'none',
                    background: voiceEnabled ? 'rgba(0,212,255,0.15)' : 'rgba(255,255,255,0.05)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: voiceEnabled ? '#00d4ff' : 'rgba(255,255,255,0.3)',
                  }}
                >
                  {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </motion.button>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  style={{
                    width: 34, height: 34, borderRadius: '50%', border: 'none',
                    background: 'rgba(255,255,255,0.05)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.5)',
                  }}
                >
                  <X size={16} />
                </motion.button>
              </div>
            </div>

            {/* Quick Questions */}
            <div style={{
              display: 'flex', gap: '0.5rem', padding: '0.75rem 1rem',
              overflowX: 'auto', flexShrink: 0,
              borderBottom: '1px solid rgba(255,255,255,0.04)',
            }}>
              {quickQuestions.map((q, i) => (
                <motion.button
                  key={i}
                  onClick={() => handleQuery(q.slice(2))}
                  whileHover={{ scale: 1.04, background: 'rgba(0,212,255,0.12)' }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    padding: '0.35rem 0.8rem', borderRadius: 20, flexShrink: 0,
                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(0,212,255,0.15)',
                    color: 'rgba(255,255,255,0.7)', fontSize: '0.72rem', cursor: 'pointer',
                    fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
                  }}
                >
                  {q}
                </motion.button>
              ))}
            </div>

            {/* Messages */}
            <div style={{
              flex: 1, overflowY: 'auto', padding: '1rem 1.25rem',
              display: 'flex', flexDirection: 'column', gap: '0.75rem',
            }}>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <div style={{
                    maxWidth: '80%',
                    padding: '0.7rem 1rem',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    fontSize: '0.88rem',
                    lineHeight: 1.6,
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, rgba(0,212,255,0.2), rgba(124,58,237,0.15))'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.07)'}`,
                    color: msg.role === 'user' ? '#e2e8f0' : 'rgba(255,255,255,0.85)',
                    fontFamily: 'Inter, sans-serif',
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', gap: '4px', padding: '0.5rem 0' }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i}
                      animate={{ y: [-4, 4, -4] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      style={{ width: 6, height: 6, borderRadius: '50%', background: '#00d4ff' }}
                    />
                  ))}
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Speaking indicator */}
            <AnimatePresence>
              {isSpeaking && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  style={{
                    padding: '0.4rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
                    background: 'rgba(0,212,255,0.06)', borderTop: '1px solid rgba(0,212,255,0.1)',
                  }}
                >
                  <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                    <Volume2 size={12} color="#00d4ff" />
                  </motion.div>
                  <span style={{ color: '#00d4ff', fontSize: '0.7rem', fontFamily: 'monospace' }}>AI speaking...</span>
                  <button onClick={stopSpeaking} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem' }}>
                    Stop
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input area */}
            <div style={{
              padding: '1rem 1.25rem',
              borderTop: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', gap: '0.6rem', alignItems: 'flex-end',
              flexShrink: 0,
            }}>
              {/* Mic button */}
              <motion.button
                onClick={isListening ? stopListening : startListening}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                animate={isListening ? { boxShadow: ['0 0 0 0 rgba(244,63,94,0.4)', '0 0 0 12px rgba(244,63,94,0)', '0 0 0 0 rgba(244,63,94,0.4)'] } : {}}
                transition={{ duration: 1.2, repeat: Infinity }}
                title={isListening ? 'Stop listening' : 'Speak to AI'}
                style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: 'none',
                  background: isListening
                    ? 'linear-gradient(135deg, #f43f5e, #e11d48)'
                    : 'rgba(255,255,255,0.06)',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: isListening ? '#fff' : '#00d4ff',
                }}
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </motion.button>

              {/* Text input */}
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleQuery(input)}
                placeholder={isListening ? '🎙️ Listening...' : 'Ask about weather, storms, climate...'}
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: '0.65rem 1rem',
                  color: '#e2e8f0',
                  fontSize: '0.9rem',
                  outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                  resize: 'none',
                }}
              />

              {/* Send button */}
              <motion.button
                onClick={() => handleQuery(input)}
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                disabled={!input.trim()}
                style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0, border: 'none',
                  background: input.trim()
                    ? 'linear-gradient(135deg, #00d4ff, #7c3aed)'
                    : 'rgba(255,255,255,0.04)',
                  cursor: input.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', opacity: input.trim() ? 1 : 0.3,
                }}
              >
                <Send size={16} />
              </motion.button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
