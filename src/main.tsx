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
                <div className='bg-background flex min-h-screen w-full flex-col items-center justify-center px-4'>
                  <div className='animate-fade-in max-w-md space-y-6 text-center'>
                    <div className='space-y-2'>
                      <h1 className='text-muted-foreground/20 text-9xl font-bold select-none'>
                        4
                        <span className='animate-spin-slow inline-block hover:animate-ping'>0</span>
                        4
                      </h1>
                      <h2 className='text-foreground animate-slide-up text-2xl font-semibold'>
                        Page not found
                      </h2>
                      <p className='text-muted-foreground animate-slide-up-delayed'>
                        The page you're looking for doesn't exist or has been moved.
                      </p>
                    </div>
                    <button
                      onClick={() => (window.location.href = '/')}
                      className='bg-primary text-primary-foreground hover:bg-primary/90 animate-bounce-in inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap shadow-xs transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:pointer-events-none disabled:opacity-50'
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
