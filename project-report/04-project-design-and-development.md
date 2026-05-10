# Chapter 4: Project Design and Development

## 4.1 System Architecture
The Weather Forecast AI Platform follows a modern three-tier architecture:

1.  **Presentation Tier (Frontend)**: Built with **Next.js 14**, providing a highly interactive, component-based user interface. It uses **Framer Motion** for animations, **Lucide React** for icons, and **Globe.gl** for 3D visualizations. State management is handled by **Zustand** (WeatherStore).
2.  **Application Tier (Backend API)**:
    -   **Node.js + Express**: Handles client requests, acts as a proxy for external APIs, manages rate limiting, and serves as the main backend gateway.
    -   **Python + FastAPI** (Optional/Simulated): In a full implementation, this tier handles heavy machine learning computations and serves predictions. Currently, it acts as a simulated ML engine returning structured data.
3.  **Data Tier (External APIs)**:
    -   **OpenWeatherMap API**: Provides live weather data, forecasts, and air quality information.
    -   **Google Gemini API**: Powers the conversational AI capabilities of the chat assistant.

## 4.2 Module Design

### 4.2.1 Weather Data Module
This module is responsible for fetching, processing, and displaying weather data.
-   **Functionality**: It calls the OpenWeatherMap API using latitude and longitude or city names. It handles current conditions, hourly forecasts, and air quality index (AQI) calculations.
-   **Components**: `weatherApi.ts`, `WeatherInfoPanel.tsx`.

### 4.2.2 AI Chat Engine Module
This module provides a full-screen, interactive chat interface powered by Gemini AI.
-   **Functionality**: It accepts text or voice input from the user, sends it to the backend (which calls the Gemini API), and displays the response. It includes context about the current weather to provide relevant answers.
-   **Components**: `AIChatEngine.tsx`, `backend/src/controllers/aiController.js`.

### 4.2.3 Predictive Engine Module
This module simulates advanced machine learning analysis.
-   **Functionality**: It returns simulated confidence scores and trend analysis (e.g., "98.2% Accurate", "Rain Probability 62%") to demonstrate how a trained ML model would present data.
-   **Components**: `AIPredictionPanel.tsx`, `ai-engine/main.py`.

### 4.2.4 Interactive Visualization Module
This module handles the immersive visual elements of the site.
-   **Functionality**: It renders a 3D Earth globe with clickable city points displaying weather summaries. It also handles the slow-motion marquee for prediction categories.
-   **Components**: `WorldMapCTA.tsx`, `FeaturesSection.tsx`.

## 4.3 Development Workflow
The development followed an agile, iterative process:
1.  **Environment Setup**: Initialized Node.js and Python environments.
2.  **UI Design**: Built the core landing page layout with dark mode and glassmorphism.
3.  **API Integration**: Connected OpenWeatherMap and Gemini APIs.
4.  **Feature Addition**: Added the 3D map, custom cursor, and voice features sequentially.
5.  **Refinement**: Polished UI elements, improved error handling, and optimized performance.
6.  **Deployment**: Pushed code to GitHub, deployed backend on Render, and frontend on Vercel.
