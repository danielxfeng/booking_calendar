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

import FormWrapper from '@/components/bookingForm/BookingForm';
import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';
import Main from '@/components/Main';
import TanQuery from '@/components/TanQuery';
import { Toaster } from '@/components/ui/sonner';
import { startAtom } from '@/lib/atoms';
import { ThrowBackendError } from '@/lib/errorHandler';
import { useStartController } from '@/lib/hooks/useStartController';
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
    <div>
      <Header />
      <Main />
      <Footer />

      <FormWrapper />
      <TanQuery />
      <Toaster position='top-center' duration={2000} richColors />
    </div>
  );
};

export default App;
