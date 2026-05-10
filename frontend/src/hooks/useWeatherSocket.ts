// Socket.IO client hook
'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useWeatherStore } from '@/store/weatherStore';

let socket: Socket | null = null;

export const useWeatherSocket = () => {
  const { currentCity, currentLat, currentLon, setWeatherData, setAIPrediction, addAlert } = useWeatherStore();

  useEffect(() => {
    const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';
    
    if (!socket) {
      socket = io(WS_URL, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 2000,
      });
    }

    socket.on('connect', () => {
      console.log('🔌 WebSocket connected');
      socket?.emit('subscribe:weather', {
        city: currentCity,
        lat: currentLat,
        lon: currentLon,
      });
    });

    socket.on('weather:update', (res: { success: boolean; data: unknown }) => {
      if (res.success && res.data) {
        setWeatherData(res.data as Parameters<typeof setWeatherData>[0]);
      }
    });

    socket.on('ai:prediction', (res: { success: boolean; data: unknown }) => {
      if (res.success && res.data) {
        setAIPrediction(res.data as Parameters<typeof setAIPrediction>[0]);
      }
    });

    socket.on('weather:alert', (alert: Parameters<typeof addAlert>[0]) => {
      addAlert(alert);
    });

    socket.on('disconnect', () => {
      console.log('🔌 WebSocket disconnected');
    });

    return () => {
      socket?.off('weather:update');
      socket?.off('ai:prediction');
      socket?.off('weather:alert');
    };
  }, [currentCity, currentLat, currentLon, setWeatherData, setAIPrediction, addAlert]);

  return socket;
};
