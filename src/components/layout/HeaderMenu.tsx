/**
 * @file HeaderMenu.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useState } from 'react';
import {
  addYears,
  format,
  isMonday,
  isSameDay,
  nextMonday,
  nextSunday,
  previousMonday,
} from 'date-fns';
import { enGB } from 'date-fns/locale';
import { useAtomValue } from 'jotai';
import { CalendarDays } from 'lucide-react';

import { MyPaginationNext, MyPaginationPrev } from '@/components/layout/MyPagination';
import ThemeToggle from '@/components/layout/ThemeToggle';
import Loading from '@/components/Loading';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { PaginationItem } from '@/components/ui/pagination';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { startAtom } from '@/lib/atoms';
import { useStartController } from '@/lib/hooks/useStartController';
import { formatToDate, newDate } from '@/lib/tools';

const HeaderMenu = () => {
  const { setNewStart } = useStartController();
  const start = useAtomValue(startAtom);

  const [open, setOpen] = useState(false);

  // To prevent there is not a start.
  if (!start) return <Loading className='h-4 w-4' />;

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
    <div className='flex items-center gap-2'>
      <div
        data-role='operation-panel'
        className='bg-muted/50 flex items-center gap-1 rounded-lg px-2 py-1 backdrop-blur-sm'
      >
        <PaginationItem
          className='hover:bg-muted flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:shadow-sm active:scale-95'
          onClick={() => setNewStart(prevMon, false)}
        >
          <MyPaginationPrev className='!text-muted-foreground hover:text-foreground h-4 w-4 transition-colors' />
        </PaginationItem>

        <PaginationItem
          className='hover:bg-muted flex h-8 w-8 items-center justify-center rounded-md transition-all duration-200 hover:shadow-sm active:scale-95'
          onClick={() => setNewStart(nextMon, false)}
        >
          <MyPaginationNext className='!text-muted-foreground hover:text-foreground h-4 w-4 transition-colors' />
        </PaginationItem>

        <div className='bg-border h-4 w-px' />

        <div>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant='ghost'
                id='date'
                className='hover:bg-muted flex h-8 w-8 items-center justify-center rounded-md p-0 transition-all duration-200 hover:shadow-sm active:scale-95'
                aria-label='Choose start date'
              >
                <CalendarDays className='text-muted-foreground hover:text-foreground h-4 w-4 transition-colors' />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className='flex w-auto flex-col items-center overflow-hidden p-4 shadow-lg'
              align='end'
            >
              <span className='text-muted-foreground mb-3 text-sm font-medium'>{`${format(startDate, 'EEE dd MMM')} - ${format(nextSun, 'EEE dd MMM')}`}</span>
              <Calendar
                mode='single'
                selected={startDate}
                captionLayout='dropdown'
                onSelect={(date) => dateSelectHandler(date)}
                startMonth={addYears(new Date(), -1)}
                endMonth={addYears(new Date(), 1)}
                locale={enGB}
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

        <div className='bg-border h-4 w-px' />

        <ThemeToggle />
      </div>
    </div>
  );
};

export default HeaderMenu;
