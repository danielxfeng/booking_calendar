import { cn } from "@/lib/utils";

const Loading = ({ className }: { className?: string }) => (
  <div className='flex items-center justify-center'>
    <div className={cn('h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-transparent', className)} />
  </div>
);

export default Loading;