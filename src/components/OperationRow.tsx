/**
 * @file OperationRow.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useState } from 'react';
import { format, isMonday, isSameDay, nextMonday, nextSunday, previousMonday } from 'date-fns';
import { useAtomValue } from 'jotai';
import { CalendarDays, ChevronDownIcon } from 'lucide-react';

import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { startAtom } from '@/lib/atoms';
import { useStartController } from '@/lib/hooks';
import { formatToDate, newDate } from '@/lib/tools';

const OperationRow = () => {
  const { setNewStart } = useStartController();
  const start = useAtomValue(startAtom);

  const [open, setOpen] = useState(false);

  // To prevent there is not a start.
  if (!start) return <Loading />;

  const startDate = newDate(start);

  const prevMon = formatToDate(previousMonday(startDate));
  const nextMon = formatToDate(nextMonday(startDate));
  const nextSun = nextSunday(startDate);

  // // navigate to updated start date.
  const dateSelectHandler = (date: Date | undefined) => {
    if (!date) return;
    if (isSameDay(date, startDate)) return;
    const mon = isMonday(date) ? formatToDate(date) : formatToDate(previousMonday(date));
    setNewStart(mon, false);
    setOpen(false);
  };

  return (
    <div
      data-role='operation-panel'
      className='mb-5 flex h-12 items-center justify-start gap-1 lg:justify-center lg:gap-10'
    >
      {/* Prev button */}
      <PaginationItem className='block'>
        <PaginationPrevious
          className='!text-primary/80'
          onClick={() => setNewStart(prevMon, false)}
        />
      </PaginationItem>

      {/* Date picker */}
      <div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              id='date'
              className='lg:border-border lg:hover:bg-muted justify-between text-sm font-normal lg:w-60 lg:border lg:bg-transparent'
              aria-label='Choose start date'
            >
              <span className='hidden lg:inline-block'>{`${format(startDate, 'EEE dd MMM')} - ${format(nextSun, 'EEE dd MMM')}`}</span>
              <CalendarDays className='lg:hidden' />
              <ChevronDownIcon className='hidden lg:inline-block' />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className='flex w-auto flex-col items-center overflow-hidden p-0 p-2'
            align='start'
          >
            <span className='text-sm font-semibold lg:hidden'>{`${format(startDate, 'EEE dd MMM')} - ${format(nextSun, 'EEE dd MMM')}`}</span>
            <Calendar
              mode='single'
              selected={startDate}
              captionLayout='dropdown'
              onSelect={(date) => dateSelectHandler(date)}
            />
            {/* Today */}
            <Button
              variant='default'
              className='w-full text-sm'
              onClick={() => {
                dateSelectHandler(new Date());
              }}
            >
              Today
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      {/* Next button */}
      <PaginationItem className='block'>
        <PaginationNext className='!text-primary/80' onClick={() => setNewStart(nextMon, false)} />
      </PaginationItem>
    </div>
  );
};

export default OperationRow;
