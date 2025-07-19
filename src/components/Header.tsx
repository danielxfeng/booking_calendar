import HeaderBrand from '@/components/HeaderBrand';
import HeaderMenu from '@/components/HeaderMenu';

const Header = () => {
  return (
    <header className='border-border/40 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-20 left-0 right-0 border-b shadow-sm backdrop-blur-xl'>
      <div className='container mx-auto max-w-5xl flex h-16 items-center justify-between px-6'>
        <HeaderBrand />
        <HeaderMenu />
      </div>
    </header>
  );
};

export default Header;
