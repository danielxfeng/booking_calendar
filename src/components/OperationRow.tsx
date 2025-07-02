/**
 * @file OperationRow.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useState } from 'react';
import { format, isMonday, isSameDay, nextMonday, nextSunday, previousMonday } from 'date-fns';
import { useAtomValue } from 'jotai';
import { ChevronDownIcon } from 'lucide-react';

import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { startAtom } from '@/lib/atoms';
import { useStartController } from '@/lib/hooks';
import { formatToDate, newDate } from '@/lib/tools';

/**
 * @summary An operation row includes:
 * @description
 * NavLeft, DatePicker, Today, NavRight. The pagination buttons only display on desktop view.
 * like: <-, Mon 05 Jun - Sun 12 Jun, Today,  ->
 * - Subscribe the `startAtom`
 */
const OperationRow = () => {
  const { setNewStart } = useStartController();
  const start = useAtomValue(startAtom);

  // helper for date picker.
  const [open, setOpen] = useState(false);

  // To prevent there is not a start.
  if (!start) return <Loading />;

  const startDate = newDate(start);

  // helper for pagination.
  const prevMon = formatToDate(previousMonday(startDate));
  const nextMon = formatToDate(nextMonday(startDate));

  // helper for displaying the date picker.
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
      className='mb-8 flex h-12 items-center justify-start gap-10 lg:justify-center'
    >
      {/* Prev button */}
      <PaginationItem className='hidden lg:block'>
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
              variant='outline'
              id='date'
              className='w-60 justify-between text-sm font-normal'
              aria-label='Choose start date'
            >
              {`${format(startDate, 'EEE dd MMM')} - ${format(nextSun, 'EEE dd MMM')}`}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
            <Calendar
              mode='single'
              selected={startDate}
              captionLayout='dropdown'
              onSelect={(date) => dateSelectHandler(date)}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Today */}
      <Button
        variant='outline'
        className='text-sm'
        onClick={() => {
          dateSelectHandler(new Date());
        }}
      >
        Today
      </Button>

      {/* Next button */}
      <PaginationItem className='hidden lg:block'>
        <PaginationNext className='!text-primary/80' onClick={() => setNewStart(nextMon, false)} />
      </PaginationItem>
    </div>
  );
};

export default OperationRow;
