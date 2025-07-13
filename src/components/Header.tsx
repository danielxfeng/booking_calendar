import OperationRow from '@/components/OperationRow';

const Header = () => {
  return (
    <header className='border-border/40 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b shadow-sm backdrop-blur-xl'>
      <div className='container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8'>
        <div className='flex items-center gap-3'>
          <div className='from-primary to-primary/80 flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br shadow-sm'>
            <span className='text-primary-foreground text-sm font-bold'>B</span>
          </div>
          <h1 className='text-foreground text-xl font-semibold tracking-tight sm:text-2xl'>
            Bookme
          </h1>
        </div>

        <div className='flex items-center gap-2'>
          <OperationRow />
        </div>
      </div>
    </header>
  );
};

export default Header;
