import { Badge } from '@/components/ui/badge';

const HeaderBrand = () => {
  return (
    <div className='flex items-center gap-1.5'>
      <div className='flex items-center gap-3'>
        <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-800 to-blue-600/80 shadow-sm'>
          <span className='text-sm font-bold text-neutral-50'>B</span>
        </div>
        <h1 className='sr-only'>Bookme</h1>
        <span className='text-foreground hidden text-xl font-semibold tracking-tight sm:text-2xl lg:block'>
          Bookme
        </span>
      </div>
      <div className='hidden h-8 shrink-0 items-start lg:flex'>
        <Badge variant='secondary'>Beta</Badge>
      </div>
    </div>
  );
};

export default HeaderBrand;
