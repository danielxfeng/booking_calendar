import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className='bg-accent flex h-10 md:h-12 items-center justify-center border-t'>
      <div className='text-muted-foreground text-center text-xs md:text-sm flex items-center gap-2'>
        <span>Developed with</span>
        <Heart className='h-4 w-4 fill-sky-400 stroke-0 animate-pulse' /> 
        <span>by{' '}
        <a
          href='https://danielslab.dev'
          target='_blank'
          rel='noreferrer'
          className='hover:underline'
        >
          xifeng
        </a>{' '}
        and{' '}
        <a
          href='https://github.com/ibnBaqqi'
          target='_blank'
          rel='noreferrer'
          className='hover:underline'
        >
          sabdulba
        </a>
        </span>
      </div>
    </footer>
  );
};

export default Footer;
