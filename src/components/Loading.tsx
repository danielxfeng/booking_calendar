import type { CSSProperties } from 'react';

const Loading = ({ style }: { style?: CSSProperties }) => (
  <div
    className='bg-background/60 flex h-full w-full items-center justify-center opacity-70 dark:opacity-80'
    style={style}
  >
    <div
      className='h-10 w-10 animate-spin rounded-full bg-gradient-to-r from-purple-800 to-blue-600/80'
      style={{
        WebkitMask:
          'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
        WebkitMaskComposite: 'destination-in',
      }}
    />
  </div>
);

export default Loading;
