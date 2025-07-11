/**
 * @file OperationRow.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useState } from 'react';
import { format, isMonday, isSameDay, nextMonday, nextSunday, previousMonday } from 'date-fns';
import { useAtomValue } from 'jotai';
import { CalendarDays } from 'lucide-react';

import Loading from '@/components/Loading';
import { MyPaginationNext, MyPaginationPrev } from '@/components/MyPagination';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { PaginationItem } from '@/components/ui/pagination';
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
      className='flex items-center justify-start lg:justify-center lg:gap-2'
    >
      {/* Prev button */}
      <PaginationItem className='block transform transition duration-400 hover:-translate-y-1'>
        <MyPaginationPrev className='!text-primary' onClick={() => setNewStart(prevMon, false)} />
      </PaginationItem>

      {/* Next button */}
      <PaginationItem className='block transform transition duration-400 hover:-translate-y-1'>
        <MyPaginationNext className='!text-primary' onClick={() => setNewStart(nextMon, false)} />
      </PaginationItem>

      {/* Date picker */}
      <div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              id='date'
              className='transform transition duration-400 hover:-translate-y-1'
              aria-label='Choose start date'
            >
              <CalendarDays />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className='flex w-auto flex-col items-center overflow-hidden p-3'
            align='end'
          >
            <span className='text-sm font-semibold'>{`${format(startDate, 'EEE dd MMM')} - ${format(nextSun, 'EEE dd MMM')}`}</span>
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
    </div>
  );
};

export default OperationRow;
