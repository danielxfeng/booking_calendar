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
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import App from '@/App';
import ErrorBoundary from '@/components/ErrorBoundary';

import '@/index.css';
import './instrument';
import * as Sentry from '@sentry/react';


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
            {/* Only one page */}
            <Route path='/' element={<App />} />

            {/* A simple fall back */}
            <Route
              path='*'
              element={
                <div className='flex h-screen w-screen items-center justify-center text-3xl'>
                  Page not found
                </div>
              }
            />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </ErrorBoundary>
  </StrictMode>,
);
