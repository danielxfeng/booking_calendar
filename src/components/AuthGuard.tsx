import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router';

import Loading from '@/components/Loading';
import { API_URL, ENDPOINT_AUTH } from '@/config';
import { getUser, setUser } from '@/lib/userStore';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuthentication = async () => {
      const errFromBackend = searchParams.get('err');
      if (errFromBackend) {
        setIsCheckingAuth(false);
        return;
      }

      const token = searchParams.get('token');
      if (token) {
        const intra = searchParams.get('intra');
        const rawRole = searchParams.get('role');
        const role = rawRole === 'student' || rawRole === 'staff' ? rawRole : null;

        setUser({ token, intra, role });
        setIsAuthenticated(true);
        setIsCheckingAuth(false);

        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('token');
        nextParams.delete('intra');
        nextParams.delete('role');
        setSearchParams(nextParams, { replace: true });
        return;
      }

      const existingUser = getUser();
      if (existingUser?.token) {
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
        return;
      }

      window.location.replace(`${API_URL}/${ENDPOINT_AUTH}`);
    };

    checkAuthentication();
  }, [searchParams, setSearchParams]);

  if (isCheckingAuth) {
    return (
      <div className='bg-background flex h-screen w-full flex-col items-center justify-center'>
        <div className='flex flex-col items-center space-y-4'>
          <Loading />
          <p className='text-muted-foreground animate-pulse'>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='bg-background flex h-[100dvh] w-full flex-col items-center justify-center px-4'>
        <div className='max-w-md space-y-6 text-center'>
          <div className='space-y-2'>
            <h1 className='text-foreground text-4xl font-bold'>Authentication Required</h1>
            <p className='text-muted-foreground'>
              You need to be authenticated to access the booking calendar.
            </p>
          </div>
          <button
            onClick={() => window.location.replace(`${API_URL}/${ENDPOINT_AUTH}`)}
            className='bg-primary text-primary-foreground hover:bg-primary/90 inline-flex h-9 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium whitespace-nowrap shadow-xs transition-all duration-300 hover:scale-105 hover:shadow-lg disabled:pointer-events-none disabled:opacity-50'
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;
