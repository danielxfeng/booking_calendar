/**
 * @file App.tsx
 * @summary Main, and only page of this application
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { useStore } from 'jotai';

import FormWrapper from '@/components/BookingForm';
import Main from '@/components/Main';
import TanQuery from '@/components/TanQuery';
import { Toaster } from '@/components/ui/sonner';
import { startAtom } from '@/lib/atoms';
import { useStartController } from '@/lib/hooks';
import { setUser } from '@/lib/userStore';

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setNewStart } = useStartController();

  const startFromParams = searchParams.get('start');
  const unSubscribedStart = useStore().get(startAtom);

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
      if (unSubscribedStart !== '') nextParams.set('start', unSubscribedStart);
      setSearchParams(nextParams, { replace: true }); // remove the url from history.
    }
  }, [searchParams, setSearchParams, unSubscribedStart]);

  useEffect(() => {
    const newStart = startFromParams ?? unSubscribedStart;
    setNewStart(newStart, true);
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

      <FormWrapper />

      <TanQuery />

      <Toaster position='top-center' duration={2000} richColors />
    </div>
  );
};

export default App;
