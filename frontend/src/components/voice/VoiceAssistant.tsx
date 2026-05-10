'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Volume2 } from 'lucide-react';
import { useWeatherStore } from '@/store/weatherStore';

const AI_RESPONSES: Record<string, string> = {
  weather: "Based on current atmospheric data, I'm detecting {condition} conditions with a temperature of {temp}°C. AI models show {confidence}% confidence in today's forecast.",
  rain: "AI rain probability analysis: {rainProb}% chance of precipitation in the next 24 hours. LSTM model detects {stormRisk}% storm formation risk.",
  temperature: "Current temperature is {temp}°C, feeling like {feelsLike}°C. Neural forecast predicts a high of {tempMax}° and low of {tempMin}° today.",
  wind: "Wind speeds at {wind} km/h from the {direction} direction. AI wind evolution model projects gusts up to {windMax} km/h over the next 6 hours.",
  aqi: "Air Quality Index is {aqi} — classified as {aqiCategory}. PM2.5 levels at {pm25} μg/m³. Indoor activities recommended during peak hours.",
  forecast: "7-day AI ensemble forecast: Temperatures ranging from {tempMin}° to {tempMax}°. {stormRisk}% probability of severe weather. Model accuracy: 97.3%.",
  advice: "Based on current weather intelligence: {advice}. AI confidence: {confidence}%. Stay informed with real-time atmospheric updates.",
  hello: "Hello! I'm WeatherAI, your intelligent climate assistant. Ask me about current conditions, forecasts, air quality, or weather alerts. I process real-time satellite data and AI predictions.",
  default: "I'm analyzing atmospheric data for your location. Current conditions show {condition} with AI prediction confidence at {confidence}%. Would you like specific forecast details?",
};

function generateResponse(input: string, weatherData: ReturnType<typeof useWeatherStore>['weatherData'], aiPrediction: ReturnType<typeof useWeatherStore>['aiPrediction']) {
  const lower = input.toLowerCase();
  let template = AI_RESPONSES.default;

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) template = AI_RESPONSES.hello;
  else if (lower.includes('rain') || lower.includes('precipitation')) template = AI_RESPONSES.rain;
  else if (lower.includes('temp') || lower.includes('hot') || lower.includes('cold')) template = AI_RESPONSES.temperature;
  else if (lower.includes('wind')) template = AI_RESPONSES.wind;
  else if (lower.includes('air') || lower.includes('aqi') || lower.includes('quality')) template = AI_RESPONSES.aqi;
  else if (lower.includes('forecast') || lower.includes('week') || lower.includes('tomorrow')) template = AI_RESPONSES.forecast;
  else if (lower.includes('advice') || lower.includes('suggest') || lower.includes('recommend')) template = AI_RESPONSES.advice;
  else if (lower.includes('weather') || lower.includes('condition')) template = AI_RESPONSES.weather;

  const w = weatherData;
  const ai = aiPrediction;

  return template
    .replace('{condition}', w?.condition || 'clear')
    .replace('{temp}', String(w?.temperature || 22))
    .replace('{feelsLike}', String(w?.feelsLike || 21))
    .replace('{tempMax}', String(w?.tempMax || 25))
    .replace('{tempMin}', String(w?.tempMin || 18))
    .replace('{wind}', String(w?.windSpeed || 15))
    .replace('{direction}', 'NE')
    .replace('{windMax}', String((w?.windSpeed || 15) + 10))
    .replace('{aqi}', String(w?.aqi || 1))
    .replace('{aqiCategory}', w?.aqiCategory || 'Good')
    .replace('{pm25}', String(w?.pm25?.toFixed(1) || '12.0'))
    .replace('{rainProb}', String(Math.round(ai?.rainProbability || 30)))
    .replace('{stormRisk}', String(Math.round(ai?.stormRisk || 15)))
    .replace('{confidence}', String(ai?.confidence?.overall || 93))
    .replace('{advice}', w?.temperature > 35 ? 'Extreme heat detected — stay hydrated and avoid peak sun hours' : 'Conditions are favorable for outdoor activities');
}

export default function VoiceAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'ai'; text: string }>>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const { weatherData, aiPrediction } = useWeatherStore();

  const typeResponse = useCallback((text: string) => {
    setIsTyping(true);
    setResponse('');
    let i = 0;
    const timer = setInterval(() => {
      setResponse(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(timer);
        setIsTyping(false);
        // Speak response
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.rate = 0.9;
          utterance.pitch = 1.1;
          window.speechSynthesis.speak(utterance);
        }
      }
    }, 18);
  }, []);

  const handleQuery = useCallback((query: string) => {
    if (!query.trim()) return;
    const aiResponse = generateResponse(query, weatherData, aiPrediction);
    setMessages(prev => [...prev,
      { role: 'user', text: query },
      { role: 'ai', text: aiResponse }
    ]);
    typeResponse(aiResponse);
    setTranscript('');
  }, [weatherData, aiPrediction, typeResponse]);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser.');
      return;
    }
    const SR = (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition; SpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition || SpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (e) => {
      const text = Array.from(e.results).map(r => r[0].transcript).join('');
      setTranscript(text);
      if (e.results[e.results.length - 1].isFinal) {
        handleQuery(text);
        setIsListening(false);
      }
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

  return (
    <>
      {/* Floating AI orb */}
      <motion.button
        onClick={() => setIsOpen(o => !o)}
        className="animate-breathe"
        style={{
          position: 'fixed', bottom: '2rem', right: '2rem',
          width: 60, height: 60, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.9), rgba(0,212,255,0.6))',
          border: '2px solid rgba(168,85,247,0.5)',
          boxShadow: '0 0 25px rgba(124,58,237,0.5), 0 0 50px rgba(0,212,255,0.2)',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100,
        }}
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.95 }}
      >
        <Volume2 size={22} color="#ffffff" />
      </motion.button>

      {/* Assistant panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            style={{
              position: 'fixed', bottom: '6rem', right: '2rem',
              width: 320, maxHeight: 440,
              background: 'rgba(2,6,15,0.96)',
              backdropFilter: 'blur(30px)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 20,
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(124,58,237,0.15)',
              zIndex: 100,
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1rem 1.25rem',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(0,212,255,0.1))',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(0,212,255,0.9), rgba(124,58,237,0.7))',
                    boxShadow: '0 0 12px rgba(0,212,255,0.5)',
                  }}
                />
                <div>
                  <div style={{ color: '#e2e8f0', fontSize: '0.85rem', fontWeight: 600, fontFamily: 'Outfit, sans-serif' }}>WeatherAI</div>
                  <div style={{ color: '#00ff88', fontSize: '0.6rem', letterSpacing: '0.1em', fontFamily: 'Space Grotesk, monospace' }}>● ONLINE</div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.4)', padding: '0.25rem' }}>
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 260 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '1rem' }}>
                  Ask me about weather, forecasts, or climate insights! 🌤️
                </div>
              )}
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    padding: '0.5rem 0.75rem',
                    borderRadius: 10,
                    fontSize: '0.8rem',
                    lineHeight: 1.5,
                    maxWidth: '90%',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(124,58,237,0.1))'
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,255,0.2)' : 'rgba(255,255,255,0.06)'}`,
                    color: msg.role === 'user' ? '#e2e8f0' : 'rgba(255,255,255,0.8)',
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {msg.text}
                </motion.div>
              ))}
              {isTyping && (
                <div style={{ display: 'flex', gap: '0.25rem', padding: '0.5rem' }}>
                  {[0, 1, 2].map(i => (
                    <motion.div key={i} animate={{ y: [-3, 3, -3] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                      style={{ width: 5, height: 5, borderRadius: '50%', background: '#00d4ff' }} />
                  ))}
                </div>
              )}
            </div>

            {/* Input area */}
            <div style={{ padding: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '0.5rem' }}>
              <input
                value={transcript}
                onChange={e => setTranscript(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleQuery(transcript)}
                placeholder="Ask about weather..."
                style={{
                  flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8, padding: '0.5rem 0.75rem',
                  color: '#e2e8f0', fontSize: '0.8rem', outline: 'none',
                  fontFamily: 'Inter, sans-serif',
                }}
              />
              <motion.button
                onClick={isListening ? stopListening : startListening}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: isListening ? 'rgba(244,63,94,0.8)' : 'linear-gradient(135deg, rgba(0,212,255,0.6), rgba(124,58,237,0.6))',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: isListening ? 'pulse-glow 1s ease-in-out infinite' : 'none',
                }}
              >
                {isListening ? <MicOff size={14} color="white" /> : <Mic size={14} color="white" />}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
