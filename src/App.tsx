/**
 * @file App.tsx
 * @summary Main, and only page of this application
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useStore } from 'jotai';

import FormWrapper from '@/components/BookingForm';
import Main from '@/components/Main';
import OperationRow from '@/components/OperationRow';
import TanQuery from '@/components/TanQuery';
import { Toaster } from '@/components/ui/sonner';
import { startAtom } from '@/lib/atoms';
import { ThrowBackendError } from '@/lib/errorHandler';
import { useStartController } from '@/lib/hooks';
import { setUser } from '@/lib/userStore';

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [err, setErr] = useState<string | null>(null);
  const { setNewStart } = useStartController();

  const startFromParams = searchParams.get('start');
  const unSubscribedStart = useStore().get(startAtom);

  // To handle the params from backend.
  useEffect(() => {
    const errFromBackend = searchParams.get('err');
    if (errFromBackend) {
      setErr(errFromBackend);
      return;
    }

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
      if (unSubscribedStart !== '') nextParams.set('start', unSubscribedStart);
      setSearchParams(nextParams, { replace: true }); // remove the url from history.
    }
  }, [searchParams, setSearchParams, unSubscribedStart]);

  useEffect(() => {
    const newStart = startFromParams ?? unSubscribedStart;
    setNewStart(newStart, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (err) ThrowBackendError(err);

  return (
    <div className='flex min-h-screen w-screen flex-col'>
      <header className='border-border/40 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b shadow-sm backdrop-blur-xl'>
        <div className='container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg  bg-gradient-to-br from-purple-800 to-blue-600/80 shadow-sm'>
              <span className='text-sm font-bold text-primary-foreground '>B</span>
            </div>
            <h1 className='text-foreground text-xl font-semibold tracking-tight sm:text-2xl'>
              Bookme
            </h1>
          </div>

          <div className='flex items-center gap-2'>
            <OperationRow />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className='mt-8 flex-1'>
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

      <FormWrapper />

      <TanQuery />

      <Toaster position='top-center' duration={2000} richColors />
    </div>
  );
};

export default App;
