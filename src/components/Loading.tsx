/**
 * @file Loading.tsx
 * @summary A spinning.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

const Loading = () => (
  <div className='flex h-screen w-screen items-center justify-center'>
    <div className='h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-transparent' />
  </div>
);

export default Loading;