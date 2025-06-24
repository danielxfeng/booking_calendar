/**
 * @file App.tsx
 * @summary Main, and only page of this application
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

const App = () => {
  return (
    <div className='flex min-h-screen w-screen flex-col'>
      {/* Header */}
      <header className='bg-accent flex h-18 items-center justify-center'>
        <h1 className='!text-lg font-bold'>Meeting Room Booking System</h1>
      </header>

      {/* Main */}
      <main className='flex-1'></main>

      {/* Footer */}
      <footer className='bg-accent flex h-18 items-center justify-center'>
        <div
          data-role='footer-ads-left'
          className='text-muted-foreground mx-auto text-center text-sm'
        >
          Frontend: <a href='https://danielslab.dev'>@xifeng</a>
        </div>
        <div
          data-role='footer-ads-right'
          className='text-muted-foreground mx-auto text-center text-sm'
        >
          Backend: <a href='https://danielslab.dev'>@abdul</a>
        </div>
      </footer>
    </div>
  );
};

export default App;
