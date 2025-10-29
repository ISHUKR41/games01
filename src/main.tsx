/**
 * main.tsx
 * Entry point for the GameArena tournament platform
 * Sets up React Query, routing, and global providers
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

// Create a client for React Query with optimized settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache data for 5 minutes
      staleTime: 5 * 60 * 1000,
      // Keep data in cache for 10 minutes (was cacheTime in v4)
      gcTime: 10 * 60 * 1000,
      // Retry failed requests once
      retry: 1,
      // Refetch on window focus for real-time updates
      refetchOnWindowFocus: true,
    },
    mutations: {
      // Show error notifications automatically
      onError: (error: unknown) => {
        console.error('Mutation error:', error)
      },
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter 
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <App />
        {/* Toast notifications for user feedback */}
        <Toaster 
          position="top-right"
          theme="dark"
          richColors
          closeButton
          duration={4000}
        />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
)
