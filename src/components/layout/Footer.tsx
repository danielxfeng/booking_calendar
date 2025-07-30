import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className='bg-accent flex h-8 lg:h-14 items-center justify-center border-t'>
      <div className='text-muted-foreground flex items-center gap-2 text-center text-xs lg:text-sm'>
        <span>Developed with</span>
        <Heart className='h-4 w-4 animate-pulse fill-sky-400 stroke-0' />
        <span>
          by{' '}
          <a
            href='https://www.linkedin.com/in/xin-daniel-feng'
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
