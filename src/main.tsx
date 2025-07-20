/**
 * @file main.tsx
 * @summary Entry of the application, the router is here also.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import * as Sentry from '@sentry/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from '@/App';
import ErrorBoundary from '@/components/ErrorBoundary';

import '@/index.css';
import './instrument';

const queryClient = new QueryClient();

const container = document.getElementById('root')!;
const root = createRoot(container, {
  // Callback called when an error is thrown and not caught by an ErrorBoundary.
  onUncaughtError: Sentry.reactErrorHandler((error, errorInfo) => {
    console.warn('Uncaught error', error, errorInfo.componentStack);
  }),
  // Callback called when React catches an error in an ErrorBoundary.
  onCaughtError: Sentry.reactErrorHandler(),
  // Callback called when React automatically recovers from errors.
  onRecoverableError: Sentry.reactErrorHandler(),
});

root.render(
  <StrictMode>
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path='/' element={<App />} />
            <Route
              path='*'
              element={
                <div className='flex min-h-screen w-full flex-col items-center justify-center bg-background px-4'>
                  <div className='text-center space-y-6 max-w-md'>
                    <div className='space-y-2'>
                      <h1 className='text-9xl font-bold text-muted-foreground/20'>404</h1>
                      <h2 className='text-2xl font-semibold text-foreground'>Page not found</h2>
                      <p className='text-muted-foreground'>
                        The page you're looking for doesn't exist or has been moved.
                      </p>
                    </div>
                    <button
                      onClick={() => window.location.href = '/'}
                      className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 h-9 px-4 py-2'
                    >
                      ← Back to Calendar
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
