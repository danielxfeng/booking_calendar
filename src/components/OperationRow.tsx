/**
 * @file OperationRow.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useState } from 'react';
import { format, isMonday, isSameDay, nextMonday, nextSunday, previousMonday } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useStartController } from '@/lib/hooks';

/**
 * @summary An operation row includes:
 * @description
 * NavLeft, DatePicker, NavRight. The pagination buttons only display on desktop view.
 * like: <-   Mon 05 Jun - Sun 12 Jun    ->
 */
const OperationRow = ({ startDate }: { startDate: Date }) => {
  const { setNewStart } = useStartController();
  // helper for date picker.
  const [open, setOpen] = useState(false);

  // helper for pagination.
  const prevMon = format(previousMonday(startDate), 'yyyy-MM-dd');
  const nextMon = format(nextMonday(startDate), 'yyyy-MM-dd');

  // helper for displaying the date picker.
  const nextSun = nextSunday(startDate);

  // // navigate to updated start date.
  const dateSelectHandler = (date: Date | undefined) => {
    if (!date) return;
    if (isSameDay(date, startDate)) return;
    const mon = isMonday(date)
      ? format(date, 'yyyy-MM-dd')
      : format(previousMonday(date), 'yyyy-MM-dd');
    setNewStart(mon, false);
    setOpen(false);
  };

  return (
    <div data-role='operation-panel' className='mb-8 flex h-12 items-center justify-center gap-10'>
      {/* Prev button */}
      <PaginationItem className='hidden lg:block'>
        <PaginationPrevious onClick={() => setNewStart(prevMon, false)} />
      </PaginationItem>

      {/* Date picker */}
      <div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              id='date'
              className='w-56 justify-between font-normal'
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

      {/* Next button */}
      <PaginationItem className='hidden lg:block'>
        <PaginationNext onClick={() => setNewStart(nextMon, false)} />
      </PaginationItem>
    </div>
  );
};

export default OperationRow;
