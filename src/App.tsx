/**
 * @file App.tsx
 * @summary Main, and only page of this application
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import loader from '@/lib/loader';
import type { Table } from '@/lib/table';

/**
 * @summary Layout of the application.
 */
const App = () => {
  const [table, setTable] = useState<Table | null>(null);

  // Fetch the params from location
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const start = searchParams.get('start');
  const end = searchParams.get('end');

  // Reload the data if dates are changed.
  useEffect(() => {
    loader(start, end)
      .then((table) => setTable(table))
      .catch((err) => {
        throw err; // throw to error boundary on error.
      });
  }, [start, end]);

  // Spinning on loading
  if (!table)
    return (
      <div className='flex h-screen w-screen items-center justify-center'>
        <div className='h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-transparent' />
      </div>
    );

  return (
    <div className='flex min-h-screen w-screen flex-col'>
      {/* Header */}
      <header className='bg-accent flex h-18 items-center justify-center'>
        <h1 className='!text-lg font-bold'>Meeting Room Booking System</h1>
      </header>

      {/* Main */}
      <main className='flex-1'></main>

      {/* Footer */}
      <footer className='bg-accent flex h-18 items-center justify-center'>
        <div
          data-role='footer-ads-left'
          className='text-muted-foreground mx-auto text-center text-sm'
        >
          Frontend: <a href='https://danielslab.dev'>@xifeng</a>
        </div>
        <div
          data-role='footer-ads-right'
          className='text-muted-foreground mx-auto text-center text-sm'
        >
          Backend: <a href='https://danielslab.dev'>@abdul</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
