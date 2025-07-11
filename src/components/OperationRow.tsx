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
      className='flex items-center gap-1 rounded-lg bg-muted/50 px-2 py-1 backdrop-blur-sm'
    >
      <PaginationItem className='flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted hover:shadow-sm active:scale-95'>
        <MyPaginationPrev className='h-4 w-4 !text-muted-foreground transition-colors hover:text-foreground' onClick={() => setNewStart(prevMon, false)} />
      </PaginationItem>

      <PaginationItem className='flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:bg-muted hover:shadow-sm active:scale-95'>
        <MyPaginationNext className='h-4 w-4 !text-muted-foreground transition-colors hover:text-foreground' onClick={() => setNewStart(nextMon, false)} />
      </PaginationItem>

      <div className='h-4 w-px bg-border' />

      <div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='ghost'
              id='date'
              className='flex h-8 w-8 items-center justify-center rounded-md p-0 transition-all duration-200 hover:bg-muted hover:shadow-sm active:scale-95'
              aria-label='Choose start date'
            >
              <CalendarDays className='h-4 w-4 text-muted-foreground transition-colors hover:text-foreground' />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className='flex w-auto flex-col items-center overflow-hidden p-4 shadow-lg'
            align='end'
          >
            <span className='mb-3 text-sm font-medium text-muted-foreground'>{`${format(startDate, 'EEE dd MMM')} - ${format(nextSun, 'EEE dd MMM')}`}</span>
            <Calendar
              mode='single'
              selected={startDate}
              captionLayout='dropdown'
              onSelect={(date) => dateSelectHandler(date)}
            />
            <Button
              variant='default'
              className='mt-3 w-full text-sm'
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
