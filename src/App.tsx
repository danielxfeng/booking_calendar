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
import { Toaster } from '@/components/ui/sonner';
import { useStartController } from '@/lib/hooks';
import { setUser } from '@/lib/userStore';

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
      const intra = searchParams.get('intra');
      const rawRole = searchParams.get('role');
      const role = rawRole === 'student' || rawRole === 'staff' ? rawRole : null;
      setUser({ token, intra, role });
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('token');
      nextParams.delete('intra');
      nextParams.delete('role');
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
      {/* TODO: rename as navbar once we are reworking that bit for now can be removed. */}
      {/* <header className='text-background relative flex h-12 items-center justify-center'>
        <div className='bg-primary/85 pointer-events-none absolute inset-0 bg-gradient-to-b from-white/5 to-black/5' />
        <h1 className='relative z-10 !text-2xl font-bold'>Book Me</h1>
      </header> */}

      {/* Main */}
      <main className='flex-1'>
        <Main />
      </main>

      {/* Footer */}
      <footer className='bg-accent flex h-14 items-center justify-center'>
        <div className='text-muted-foreground text-center text-sm'>
          Developed with 🩵 by{' '}
          <a
            href='https://www.linkedin.com/in/xin-daniel-feng'
            target='_blank'
            rel='noreferrer'
            className='hover:underline'
          >
            xifeng
          </a>{' '}
          and{' '}
          <a
            href='https://github.com/ibnBaqqi'
            target='_blank'
            rel='noreferrer'
            className='hover:underline'
          >
            sabdulba
          </a>
        </div>
      </footer>

      {/* The popover form */}
      <FormWrapper />

      {/* Headless component for data querying */}
      <TanQuery />

      {/* A toaster for sending notification */}
      <Toaster position='top-center' duration={2000} richColors />
    </div>
  );
};

export default App;
