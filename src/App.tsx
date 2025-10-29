/**
 * App.tsx
 * Main application component with routing and layout
 * Handles navigation between homepage, game pages, and admin panel
 */

import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

// Layout components
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { ErrorFallback } from '@/components/common/ErrorFallback'

// Import all pages directly for debugging
import { HomePage } from '@/pages/HomePage'
import { BGMIPage } from '@/pages/BGMIPage'
import { FreeFirePage } from '@/pages/FreeFirePage'
import { ContactPage } from '@/pages/ContactPage'
// Keep admin and 404 as lazy for now
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'))
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="min-h-screen bg-background text-foreground">
        {/* Navigation */}
        <Navbar />

        {/* Main content with suspense for code splitting */}
        <main className="flex-1">
          <Suspense fallback={<LoadingSpinner />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/bgmi" element={<BGMIPage />} />
              <Route path="/freefire" element={<FreeFirePage />} />
              <Route path="/contact" element={<ContactPage />} />
              
              {/* Admin routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              
              {/* 404 page */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </main>

        {/* Footer */}
        <Footer />
      </div>

      {/* React Query DevTools - only in development */}
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </ErrorBoundary>
  )
}

export default App
