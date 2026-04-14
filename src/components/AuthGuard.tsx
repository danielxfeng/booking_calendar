import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';
import { useAtomValue, useSetAtom } from 'jotai';

import { API_URL, endpoint_auth } from '@/config';
import { userAtom } from '@/lib/userStore';

import { Button } from './ui/button';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const token = searchParams.get('token');
  const [showHiveLogo, setShowHiveLogo] = useState(false);
  const [showButtons, setShowButtons] = useState(false);

  useEffect(() => {
    const errFromBackend = searchParams.get('err');
    if (errFromBackend || !token) return;

    const intra = searchParams.get('intra');
    const rawRole = searchParams.get('role');
    const role = rawRole === 'student' || rawRole === 'staff' ? rawRole : null;

    setUser({ token, intra, role });

    const nextParams = new URLSearchParams(searchParams);
    nextParams.delete('token');
    nextParams.delete('intra');
    nextParams.delete('role');
    setSearchParams(nextParams, { replace: true });
  }, [searchParams, setSearchParams, setUser, token]);

  const isAuthenticated = !!token || !!user?.token;

  if (!isAuthenticated) {
    return (
      <div className='bg-background flex h-dvh w-full flex-col items-center justify-center gap-16 px-4'>
        <div className='flex flex-col items-center gap-3 text-center'>
          <h1
            className='animate-slide-up bg-linear-to-br from-purple-800 to-blue-600/80 bg-clip-text text-5xl font-bold tracking-tight text-transparent drop-shadow-[0_8px_24px_rgba(88,28,135,0.18)] sm:text-6xl'
            onAnimationEnd={() => setShowHiveLogo(true)}
          >
            Bookme
          </h1>
          <div
            className={`transition-opacity duration-300 ${
              showHiveLogo ? 'opacity-70' : 'opacity-0'
            }`}
            onTransitionEnd={() => setShowButtons(true)}
          >
            <img
              src='/hive-logo-dark.svg'
              alt='Hive Helsinki'
              className='h-5 w-auto dark:hidden sm:h-6'
            />
            <img
              src='/hive-logo-light.svg'
              alt='Hive Helsinki'
              className='hidden h-5 w-auto dark:block sm:h-6'
            />
          </div>
        </div>
        <div
          className={`flex flex-col items-center gap-4 transition-all duration-300 lg:flex-row ${
            showButtons ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
          }`}
        >
          <Button
            className='w-full lg:w-1/2'
            onClick={() => window.location.replace(`${API_URL}/${endpoint_auth('42')}`)}
          >
            Sign In with 42 Intra
          </Button>
          <Button
            className='w-full lg:w-1/2'
            onClick={() => window.location.replace(`${API_URL}/${endpoint_auth('keycloak')}`)}
          >
            Sign In with Keycloak
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
