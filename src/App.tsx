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

import OperationRow from './components/OperationRow';

const App = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { setNewStart } = useStartController();

  const startFromParams = searchParams.get('start');

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

  useEffect(() => {
    setNewStart(startFromParams, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className='flex min-h-screen w-screen flex-col'>
      <header className='sticky shadow-sm top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60'>
        <div className='container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
          <div className='flex items-center gap-3'>
            <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 shadow-sm'>
              <span className='text-sm font-bold text-primary-foreground'>B</span>
            </div>
            <h1 className='text-xl font-semibold tracking-tight text-foreground sm:text-2xl'>
              Bookme
            </h1>
          </div>
          
          <div className='flex items-center gap-2'>
            <OperationRow />
          </div>
        </div>
      </header>

      {/* Main */}
      <main className='flex-1 mt-8'>
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
