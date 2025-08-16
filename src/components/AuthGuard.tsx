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
      if (import.meta.env.VITE_IS_AUTH === 'false') {
        setIsAuthenticated(true);
        setIsCheckingAuth(false);
        return;
      }

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
      <div className='flex h-[100dvh] w-full flex-col items-center justify-center bg-background'>
        <div className='flex flex-col items-center space-y-4'>
          <Loading />
          <p className='text-muted-foreground animate-pulse'>Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className='flex h-[100dvh] w-full flex-col items-center justify-center bg-background px-4'>
        <div className='text-center space-y-6 max-w-md'>
          <div className='space-y-2'>
            <h1 className='text-4xl font-bold text-foreground'>Authentication Required</h1>
            <p className='text-muted-foreground'>
              You need to be authenticated to access the booking calendar.
            </p>
          </div>
          <button
            onClick={() => window.location.replace(`${API_URL}/${ENDPOINT_AUTH}`)}
            className='inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-xs hover:bg-primary/90 hover:scale-105 hover:shadow-lg h-9 px-4 py-2'
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
