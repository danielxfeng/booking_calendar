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

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
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
