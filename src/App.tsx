/**
 * @file App.tsx
 * @summary Main, and only page of this application
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { useAtom, useSetAtom } from 'jotai';
import lodash from 'lodash';

import Main from '@/components/Main';
import { CACHE_DURATION } from '@/config';
import { getSlots } from '@/lib/apiFetcher';
import { calendarGridAtom, startAtom } from '@/lib/atoms';
import { type CalGrid, calGridGenerator } from '@/lib/calGrid';
import { newDate } from '@/lib/dateUtils';
import { setToken } from '@/lib/tokenStore';

import { useStartController } from './lib/hooks';

/**
 * @summary Layout of the application.
 * @description
 * Mainly, the application is mainly driven by `start` atom:
 *  - When `start` changes, a data fetching (with 5-min cache) is triggered.
 *  - The fetched data (after a deep comparison) is saved to the `grid` atom.
 *  - The `start` and `grid` are bound to most of doms, so they are the main sources of re-rendering
 *
 *  - 3 ways to change the `start`
 *  - The address bar, if there is not a valid one, a normalized date is used instead.
 *  - The OperationRow, user navigation updates `start`.
 *  - The Upsert Form, when user selects a date, it may update `start`.
 *
 *  - A deep comparison is applied before updating atoms to avoid unnecessary re-renders.
 *    - Since `start` and the address bar are 2-way synced, comparison is also to prevent infinite loops.
 *  - A 5-minute cache is applied via tanstack query to avoid unnecessary fetching.
 *  - When the Upsert form submits, the related cache is invalidated.
 */
const App = () => {
  const [searchParams] = useSearchParams();
  // The custom hook to manage the start and the search params.
  const { setNewStart } = useStartController();

  // Fetch the params from location
  const startFromParams = searchParams.get('start');
  const token = searchParams.get('token');

  const [start] = useAtom(startAtom);
  const setCalendarGrid = useSetAtom(calendarGridAtom);

  // Update the received token, useEffect to avoid multi-set.
  useEffect(() => {
    if (token) {
      setToken(token);
    }
  }, [token]);

  // Update the start based on the search params.
  useEffect(() => {
    setNewStart(startFromParams, true);
  }, [setNewStart, startFromParams]);

  // useQuery to handle the cache, api fetching
  // And it subscribes the start.
  const {
    data: grid,
    error,
    isLoading,
    isError,
  } = useQuery<CalGrid>({
    enabled: start !== null,
    queryKey: ['slots', start],
    queryFn: async () => {
      const grid = calGridGenerator(await getSlots(start!), newDate(start!));
      return grid;
    },
    staleTime: 1000 * 60 * CACHE_DURATION,
  });

  // Update the atom.
  useEffect(() => {
    if (!grid) return;
    setCalendarGrid((prev) => {
      return lodash.isEqual(prev, grid) ? prev : grid;
    });
  }, [grid, setCalendarGrid]);

  // Spinning on loading
  if (isLoading || !grid || !start)
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
        <Main />
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
