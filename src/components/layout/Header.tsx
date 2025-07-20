import HeaderBrand from '@/components/layout/HeaderBrand';
import HeaderMenu from '@/components/layout/HeaderMenu';

const Header = () => {
  return (
    <header className='border-border/40 bg-background/80 supports-[backdrop-filter]:bg-background/60 sticky z-20 border-b shadow-sm backdrop-blur-xl'>
      <div className='container mx-auto max-w-5xl flex h-16 items-center justify-between px-6'>
        <HeaderBrand />
        <HeaderMenu />
      </div>
    </header>
  );
};

export default Header;
