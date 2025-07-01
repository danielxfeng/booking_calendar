/**
 * @file CalendarHeader.tsx
 * @summary It's the header of the calendar view.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { addDays, format, isMonday, previousMonday } from 'date-fns';
import { useAtomValue } from 'jotai';

import { CELL_WIDTH_PX } from '@/config';
import { startAtom } from '@/lib/atoms';
import { gridStyleGenerator, styleGenerator } from '@/lib/tools';
import { cn } from '@/lib/utils';

const CalendarHeader = () => {
  const start = useAtomValue(startAtom);

  // Set start date, fallback to today.
  let startDate = new Date(start);
  if (isNaN(startDate.getTime())) {
    const today = new Date();
    startDate = isMonday(today) ? today : previousMonday(today);
  }
  const weekArr = Array.from({ length: 7 }, (_, i) => format(addDays(startDate, i), 'eee dd MMM'));
  const styleWidth = styleGenerator(CELL_WIDTH_PX);

  return (
    <div data-role='calendar-head' className='grid h-12' style={gridStyleGenerator(CELL_WIDTH_PX)}>
      {/* Side header */}
      <div key='calendar-head-side' className='border-border h-12 border' style={styleWidth}></div>

      {/* Week day headers */}
      {weekArr.map((v) => (
        <div
          key={`calendar-head-${v}`}
          className={cn('border-border flex h-12 items-center justify-center border font-semibold')}
          style={styleWidth}
        >
          {v}
        </div>
      ))}
    </div>
  );
};

export default CalendarHeader;
