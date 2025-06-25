/**
 * @file OperationRow.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { format, formatISO, isMonday, nextMonday, nextSunday, previousMonday } from 'date-fns';
import { ChevronDownIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/**
 * @summary An operation row includes:
 * @description
 * NavLeft, DatePicker, NavRight. The pagination buttons only display on desktop view.
 * like: <-   Mon 05 Jun - Sun 12 Jun    ->
 */
const OperationRow = ({ startDate }: { startDate: Date }) => {
  const navigate = useNavigate();

  // helper for date picker.
  const [date, setDate] = useState<Date | undefined>(startDate);
  const [open, setOpen] = useState(false);

  // helper for pagination.
  const prevMon = formatISO(previousMonday(startDate), { representation: 'date' });
  const nextMon = formatISO(nextMonday(startDate), { representation: 'date' });

  // helper for displaying the date picker.
  const nextSun = nextSunday(startDate);

  // navigate to updated start date.
  useEffect(() => {
    if (open || !date || date === startDate) return;
    const mon = isMonday(date)
      ? formatISO(date, { representation: 'date' })
      : formatISO(nextMonday(date), { representation: 'date' });
    navigate(`/?start=${mon}`);
  }, [open, date, startDate, navigate]);

  return (
    <div
      data-role='operation-panel'
      className='flex h-12 w-full items-center justify-center gap-10'
    >
      {/* Prev button */}
      <PaginationItem className='hidden lg:block'>
        <PaginationPrevious href={`/?start=${prevMon}`} />
      </PaginationItem>

      {/* Date picker */}
      <div>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant='outline'
              id='date'
              className='w-48 justify-between font-normal'
              aria-label='Choose start date'
            >
              {`${format(startDate, 'EEE dd MMM')} - ${format(nextSun, 'EEE dd MMM')}`}
              <ChevronDownIcon />
            </Button>
          </PopoverTrigger>
          <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
            <Calendar
              mode='single'
              selected={date}
              captionLayout='dropdown'
              onSelect={(date) => {
                setDate(date);
                setOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Next button */}
      <PaginationItem className='hidden lg:block'>
        <PaginationNext href={`/?start=${nextMon}`} />
      </PaginationItem>
    </div>
  );
};

export default OperationRow;
