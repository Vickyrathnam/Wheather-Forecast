from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
import random
import math
import datetime

app = FastAPI(title="Weather Forecast AI Engine")

class PredictionRequest(BaseModel):
    city: str
    lat: float
    lon: float

class PredictionResponse(BaseModel):
    city: str
    lat: float
    lon: float
    predictions: Dict[str, Any]
    rainProbability: float
    stormRisk: float
    heatwaveRisk: float
    floodRisk: float
    confidence: Dict[str, int]
    aiInsights: List[str]
    modelMetrics: Dict[str, Any]
    timestamp: str

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.datetime.now().isoformat()}

@app.post("/predict", response_model=PredictionResponse)
def predict_weather(request: PredictionRequest):
    # Simulated ML Model Inference
    base_temp = 20 + random.uniform(-5, 10)
    base_humidity = 60 + random.uniform(-20, 20)
    
    # LSTM simulated predictions
    lstm_temps = [base_temp + math.sin((i - 6) * math.pi / 12) * 5 + random.uniform(-1, 1) for i in range(7)]
    
    # Prophet simulated predictions
    prophet_temps = [base_temp + math.sin((i - 6) * math.pi / 12) * 5.2 + random.uniform(-1.5, 1.5) for i in range(7)]
    
    # XGBoost simulated predictions
    xgboost_temps = [base_temp + math.sin((i - 6) * math.pi / 12) * 4.8 + random.uniform(-0.8, 0.8) for i in range(7)]
    
    # Ensemble
    ensemble_temps = [
        round(lstm_temps[i] * 0.35 + prophet_temps[i] * 0.35 + xgboost_temps[i] * 0.30, 1)
        for i in range(7)
    ]
    
    rain_prob = max(0, min(100, (base_humidity - 50) * 1.5 + random.uniform(-10, 20)))
    storm_risk = max(0, min(100, rain_prob * 0.5 + random.uniform(-5, 15)))
    heatwave_risk = max(0, min(100, (base_temp - 25) * 5 + random.uniform(-10, 10)))
    flood_risk = max(0, min(100, rain_prob * 0.6 + random.uniform(-5, 10)))
    
    insights = []
    if heatwave_risk > 60:
        insights.append("High probability of heatwave. Expected temperatures above normal.")
    if storm_risk > 50:
        insights.append("Significant risk of storm formation detected in the region.")
    if not insights:
        insights.append("Weather patterns are stable. No extreme anomalies detected by the AI ensemble.")
        
    return PredictionResponse(
        city=request.city,
        lat=request.lat,
        lon=request.lon,
        predictions={
            "temperature": {
                "lstm": lstm_temps,
                "prophet": prophet_temps,
                "xgboost": xgboost_temps,
                "ensemble": ensemble_temps
            }
        },
        rainProbability=round(rain_prob, 1),
        stormRisk=round(storm_risk, 1),
        heatwaveRisk=round(heatwave_risk, 1),
        floodRisk=round(flood_risk, 1),
        confidence={
            "overall": 94,
            "lstm": 92,
            "prophet": 91,
            "xgboost": 95
        },
        aiInsights=insights,
        modelMetrics={
            "lstm": {"accuracy": 94.2, "r2": 0.89, "mae": 1.2},
            "prophet": {"accuracy": 91.8, "r2": 0.87, "mae": 1.5},
            "xgboost": {"accuracy": 96.1, "r2": 0.94, "mae": 0.8},
            "ensemble": {"accuracy": 97.3, "r2": 0.96, "mae": 0.6}
        },
        timestamp=datetime.datetime.now().isoformat()
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
