'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(8, 13, 26, 0.95)',
            color: '#e2e8f0',
            border: '1px solid rgba(0, 212, 255, 0.2)',
            backdropFilter: 'blur(20px)',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          },
          success: { iconTheme: { primary: '#00ff88', secondary: '#02060f' } },
          error: { iconTheme: { primary: '#f43f5e', secondary: '#02060f' } },
        }}
      />
    </QueryClientProvider>
  );
}
