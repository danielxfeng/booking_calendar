/**
 * @file App.tsx
 * @summary Main, and only page of this application
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAtomValue, useStore } from 'jotai';

import AuthGuard from '@/components/AuthGuard';
import FormWrapper from '@/components/bookingForm/BookingForm';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Main from '@/components/Main';
import TanQuery from '@/components/TanQuery';
import { Toaster } from '@/components/ui/sonner';
import { startAtom, themeAtom } from '@/lib/atoms';
import { ThrowBackendError } from '@/lib/errorHandler';
import { useStartController } from '@/lib/hooks/useStartController';

const App = () => {
  const [searchParams] = useSearchParams();
  const theme = useAtomValue(themeAtom);
  const [err, setErr] = useState<string | null>(null);
  const { setNewStart } = useStartController();

  const startFromParams = searchParams.get('start');
  const unSubscribedStart = useStore().get(startAtom);

  useEffect(() => {
    const errFromBackend = searchParams.get('err');
    if (errFromBackend) {
      setErr(errFromBackend);
      return;
    }
  }, [searchParams]);

  useEffect(() => {
    const newStart = startFromParams ?? unSubscribedStart;
    setNewStart(newStart, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    const sysSetting = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      if (theme === 'system')
        root.setAttribute('data-theme', sysSetting.matches ? 'dark' : 'light');
      else root.setAttribute('data-theme', theme);
    };

    applyTheme();

    if (theme === 'system') {
      sysSetting.addEventListener('change', applyTheme);
      return () => sysSetting.removeEventListener('change', applyTheme);
    }
  }, [theme]);

  if (err) ThrowBackendError(err);

  return (
    <AuthGuard>
      <div className='flex h-[100dvh] w-full flex-col overflow-hidden'>
        <Header />
        <Main />
        <Footer />

        <FormWrapper />
        <TanQuery />
        <Toaster position='top-center' duration={2000} richColors />
      </div>
    </AuthGuard>
  );
};

export default App;
