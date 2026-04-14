import { useEffect } from 'react';
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
      <div className='bg-background flex h-dvh w-full flex-col items-center justify-center gap-12 px-4'>
        <div className='flex flex-col items-center gap-4 text-center'>
          <h1 className='text-foreground text-4xl font-bold'>Bookme</h1>
          <p className='text-muted-foreground'>Please sign in to access the booking calendar.</p>
        </div>
        <div className='flex flex-col items-center gap-4 lg:flex-row'>
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
