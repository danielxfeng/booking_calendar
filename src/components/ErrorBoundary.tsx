/**
 * @file ErrorBoundary.tsx
 * @summary A simple page to handle the error.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */
import type { ReactNode } from 'react';
import { Component } from 'react';

class ErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean; error?: Error }
> {
  state: { hasError: boolean; error?: Error } = {
    hasError: false,
    error: undefined,
  };

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('App crashed:', error, info);
  }

  render() {
    return this.state.hasError ? (
      <div className='flex h-screen w-screen flex-col items-center justify-center gap-10'>
        <h1>Oops, crashed</h1>
        <p className='text-destructive text-xl'>{this.state.error?.message}</p>
      </div>
    ) : (
      this.props.children
    );
  }
}

export default ErrorBoundary;
