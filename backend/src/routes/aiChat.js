const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize the client
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/', async (req, res) => {
  const { message, weatherData, aiPrediction } = req.body;
  
  try {
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemPrompt = `You are the core AI of the 'Weather Forecast' Intelligence Platform. 
You are a highly advanced, futuristic, and premium climate assistant. 
Your tone should be concise, intelligent, and authoritative, like a NASA flight director or Jarvis.
Do not use markdown in your response. Respond in 2-3 short sentences max. 
If the user asks about the weather, use the provided context to answer.

CURRENT CONTEXT:
Location: ${weatherData?.city || 'Unknown'}
Condition: ${weatherData?.description || 'Unknown'}
Temperature: ${weatherData?.temperature || 'Unknown'}°C (Feels like: ${weatherData?.feelsLike || 'Unknown'}°C)
High/Low: ${weatherData?.tempMax || 'Unknown'}°C / ${weatherData?.tempMin || 'Unknown'}°C
Wind: ${weatherData?.windSpeed || 'Unknown'} km/h
Air Quality Index (AQI): ${weatherData?.aqi || 'Unknown'} (${weatherData?.aqiCategory || 'Unknown'})

AI PREDICTION ENSEMBLE:
Rain Probability: ${aiPrediction?.rainProbability || 0}%
Storm Risk: ${aiPrediction?.stormRisk || 0}%
Confidence: ${aiPrediction?.confidence?.overall || 0}%`;

    // Using gemini-flash-latest to avoid zero-quota limits on specific numbered models on free tier
    const model = ai.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `Answer the user's query: "${message}"` }
    ]);

    const reply = result.response.text();
    res.json({ reply });
  } catch (error) {
    console.error('AI Chat Error:', error.message || error);
    
    // Fallback to a smart simulated response so the app doesn't break
    return res.json({ reply: `[Simulated Core] I am processing your query manually. Based on current data in ${weatherData?.city || 'your location'}, the temperature is ${weatherData?.temperature || 'normal'}°C. (Note: Fallback mode active due to API error: ${error.message || 'unknown'}).` });
  }
});

module.exports = router;
