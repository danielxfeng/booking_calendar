/**
 * @file App.tsx
 * @summary Main, and only page of this application
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router';

import FormWrapper from '@/components/BookingForm';
import Main from '@/components/Main';
import TanQuery from '@/components/TanQuery';
import { useStartController } from '@/lib/hooks';
import { setToken } from '@/lib/tokenStore';

/**
 * @summary Layout of the application.
 * @description
 * The application is data-driven
 * - The search param is synced to `startAtom`. String type, and comparison before update
 * are used to avoid the infinity loops.
 *   - `startAtom` is subscribed by `date-picker` related components like `operation panel`,
 *   and data fetcher `TanQuery`
 *
 * - FormWrapper is the popover upsert form
 * - TanQuery is a headless component, helps to fetching the data from API (with a cache),
 * then updates the `gridAtom` after deep comparison.
 *
 * - `bookingsAtom` is the main data structure of the application, and is subscribed by
 * `BookingLayer`, `CalHeads`, and the Upsert form...
 */
const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  // The custom hook to manage the start and the search params.
  const { setNewStart } = useStartController();

  // Fetch the params from location
  const startFromParams = searchParams.get('start');

  // Update the received token, useEffect to avoid multi-set.
  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      setToken(token);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('token');
      setSearchParams(nextParams, { replace: true }); // remove the url from history.
    }
  }, [searchParams, setSearchParams]);

  // Init`startAtom` from search params on first mount
  useEffect(() => {
    setNewStart(startFromParams, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='flex min-h-screen w-screen flex-col'>
      {/* Header */}

      <header className='text-background relative flex h-12 items-center justify-center'>
        <div className='bg-primary/85 pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-black/5' />
        <h1 className='relative z-10 !text-2xl font-bold'>Book Me</h1>
      </header>

      {/* Main */}
      <main className='flex-1'>
        <Main />
      </main>

      {/* Footer */}
      <footer className='bg-accent flex h-18 items-center justify-around'>
        <div data-role='footer-ads-left' className='text-muted-foreground text-center text-sm'>
          Frontend:{' '}
          <a href='www.linkedin.com/in/xin-daniel-feng' target='_blank' rel='noreferrer'>
            @xifeng
          </a>
        </div>
        <div data-role='footer-ads-right' className='text-muted-foreground text-center text-sm'>
          Backend:{' '}
          <a href='https://github.com/ibnBaqqi' target='_blank' rel='noreferrer'>
            @sabdulba
          </a>
        </div>
      </footer>

      {/* The popover form */}
      <FormWrapper />

      {/* Headless component for data querying */}
      <TanQuery />
    </div>
  );
};

export default App;
