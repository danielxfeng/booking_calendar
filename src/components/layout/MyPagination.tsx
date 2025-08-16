import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { PaginationLink } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';

const MyPaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
  return (
    <PaginationLink
      aria-label='Go to next week'
      size='default'
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <ChevronRightIcon />
    </PaginationLink>
  );
};

const MyPaginationPrev = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
  return (
    <PaginationLink
      aria-label='Go to previous week'
      size='default'
      className={cn('gap-1 px-2.5 sm:pr-2.5', className)}
      {...props}
    >
      <ChevronLeftIcon />
    </PaginationLink>
  );
};

export { MyPaginationNext, MyPaginationPrev };
