// Custom hooks for weather data
'use client';

import { useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useWeatherStore } from '@/store/weatherStore';
import {
  fetchCurrentWeather,
  fetchForecast,
  fetchAIPrediction,
  fetchGlobalWeather,
} from '@/services/weatherApi';

export const useWeatherData = () => {
  const {
    currentCity,
    currentLat,
    currentLon,
    setWeatherData,
    setForecastData,
    setAIPrediction,
    setGlobalWeather,
    setLoading,
    setError,
    setInitialized,
    isInitialized,
  } = useWeatherStore();

  const { data: weather, isLoading: wLoading, error: wError } = useQuery({
    queryKey: ['weather', currentLat, currentLon],
    queryFn: () => fetchCurrentWeather(currentCity, currentLat, currentLon),
    refetchInterval: 10 * 60 * 1000, // 10 min
    staleTime: 5 * 60 * 1000,
    retry: 2,
  });

  const { data: forecast } = useQuery({
    queryKey: ['forecast', currentLat, currentLon],
    queryFn: () => fetchForecast(currentCity, currentLat, currentLon),
    refetchInterval: 30 * 60 * 1000, // 30 min
    staleTime: 15 * 60 * 1000,
    retry: 2,
  });

  const { data: aiPrediction } = useQuery({
    queryKey: ['ai', currentLat, currentLon],
    queryFn: () => fetchAIPrediction(currentCity, currentLat, currentLon),
    refetchInterval: 30 * 60 * 1000,
    staleTime: 15 * 60 * 1000,
    retry: 1,
  });

  const { data: globalWeather } = useQuery({
    queryKey: ['global'],
    queryFn: fetchGlobalWeather,
    refetchInterval: 15 * 60 * 1000,
    staleTime: 10 * 60 * 1000,
    retry: 1,
  });

  useEffect(() => {
    if (weather) {
      setWeatherData(weather);
      if (!isInitialized) setInitialized(true);
    }
  }, [weather, setWeatherData, isInitialized, setInitialized]);

  useEffect(() => {
    if (forecast) setForecastData(forecast);
  }, [forecast, setForecastData]);

  useEffect(() => {
    if (aiPrediction) setAIPrediction(aiPrediction);
  }, [aiPrediction, setAIPrediction]);

  useEffect(() => {
    if (globalWeather) setGlobalWeather(globalWeather);
  }, [globalWeather, setGlobalWeather]);

  useEffect(() => {
    setLoading(wLoading);
  }, [wLoading, setLoading]);

  useEffect(() => {
    if (wError) setError(wError.message);
  }, [wError, setError]);

  return { weather, forecast, aiPrediction, isLoading: wLoading };
};

// Geolocation hook
export const useGeolocation = () => {
  const setLocation = useWeatherStore(s => s.setLocation);
  const setLoading = useWeatherStore(s => s.setLoading);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const weather = await fetchCurrentWeather(undefined, lat, lon);
          setLocation(weather.city || 'Your Location', lat, lon);
        } catch {
          setLocation('Your Location', lat, lon);
        }
        setLoading(false);
      },
      () => setLoading(false),
      { timeout: 5000 }
    );
  }, [setLocation, setLoading]);

  return { requestLocation };
};

// Mouse parallax hook
export const useMouseParallax = (strength = 0.02) => {
  const handleMouseMove = useCallback((e: MouseEvent, element: HTMLElement | null) => {
    if (!element) return;
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX - innerWidth / 2) * strength;
    const y = (clientY - innerHeight / 2) * strength;
    element.style.transform = `translate(${x}px, ${y}px)`;
  }, [strength]);

  return { handleMouseMove };
};
