/**
 * @file App.tsx
 * @summary Main, and only page of this application
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import Main from '@/components/Main';
import { CACHE_DURATION } from '@/config';
import { getSlots } from '@/lib/apiFetcher';
import { normalizeStartDate } from '@/lib/normalizeStartDate';
import { type Table, tableGenerator } from '@/lib/table';
import { setToken } from '@/lib/tokenStore';

/**
 * @summary Layout of the application.
 * @description
 * Mainly, the application is URL-driven.
 *  - An `useEffect` watches the changes of the address bar.
 *    - When the URL changes, validation and data fetching are triggered.
 *    - A 5-minute cache to prevent visiting backend too frequently.
 *    - Then the page is re-rendered by the new data.
 *
 *  - When users switch the date range,
 *  application uses `useNavigate` to change the search params to trigger the process above.
 *
 *  - Basically the application is state-less, except:
 *    - Cached slots are kept by react Query.
 *    - Jotai is used to keep the table (if dirty), so the dirty table can survive among re-renders.
 */
const App = () => {
  const navigate = useNavigate();

  // Fetch the params from location
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const startFromParams = searchParams.get('start');
  const token = searchParams.get('token');
  const [start, setStart] = useState<string | null>(null);

  // Update the received token, useEffect to avoid multi-set.
  useEffect(() => {
    if (token) {
      setToken(token);
    }
  }, [token]);

  // Validate the start, may redirect to the normalized date.
  useEffect(() => {
    const normalizedStart = normalizeStartDate(startFromParams);
    if (normalizedStart !== startFromParams) {
      navigate(`/?start=${normalizedStart}`, { replace: true });
      return;
    }

    setStart(normalizedStart);
  }, [navigate, startFromParams]);

  // useQuery to handle the cache, api fetching.
  const {
    data: table,
    error,
    isLoading,
    isError,
  } = useQuery<Table>({
    enabled: start !== null,
    queryKey: ['slots', start],
    queryFn: async () => tableGenerator(await getSlots(start!), new Date(start!)),
    staleTime: 1000 * 60 * CACHE_DURATION,
  });

  // Spinning on loading
  if (isLoading || !table || !start)
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <div className='h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-transparent' />
      </div>
    );

  // to error boundary since it makes no sense when there is no data.
  if (isError) throw error;

  return (
    <div className='flex min-h-screen w-screen flex-col'>
      {/* Header */}
      <header className='bg-accent flex h-18 items-center justify-center'>
        <h1 className='!text-lg font-bold'>Meeting Room Booking System</h1>
      </header>

      {/* Main */}
      <main className='flex-1'>
        <Main table={table} start={start} />
      </main>

      {/* Footer */}
      <footer className='bg-accent flex h-18 items-center justify-center'>
        <div
          data-role='footer-ads-left'
          className='text-muted-foreground mx-auto text-center text-sm'
        >
          Frontend:{' '}
          <a href='https://danielslab.dev' target='_blank' rel='noreferrer'>
            @xifeng
          </a>
        </div>
        <div
          data-role='footer-ads-right'
          className='text-muted-foreground mx-auto text-center text-sm'
        >
          Backend:{' '}
          <a href='https://github.com/ibnBaqqi' target='_blank' rel='noreferrer'>
            @sabdulba
          </a>
        </div>
      </footer>
    </div>
  );
};

export default App;
