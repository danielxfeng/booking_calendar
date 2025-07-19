const HeaderBrand = () => {
  return (
    <div className='flex items-center gap-3'>
      <div className='flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-purple-800 to-blue-600/80 shadow-sm'>
        <span className='text-primary-foreground text-sm font-bold'>B</span>
      </div>
      <h1 className='text-foreground text-xl font-semibold tracking-tight sm:text-2xl'>
        Bookme
      </h1>
    </div>
  );
};

export default HeaderBrand; 