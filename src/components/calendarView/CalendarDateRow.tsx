import { addDays, format, isMonday, isSameDay, previousMonday } from 'date-fns';
import { useAtomValue } from 'jotai';

import { CELL_WIDTH_PX } from '@/config';
import { startAtom } from '@/lib/atoms';
import { gridStyleGenerator, styleGenerator } from '@/lib/tools';
import { cn } from '@/lib/utils';

const CalendarDateRow = () => {
  const start = useAtomValue(startAtom);

  // Set start date, fallback to today.
  let startDate = new Date(start);
  const today = new Date();
  if (isNaN(startDate.getTime())) {
    startDate = isMonday(today) ? today : previousMonday(today);
  }
  const weekArr = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
  const styleWidth = styleGenerator(CELL_WIDTH_PX);

  return (
    <div
      data-role='calendar-date-row'
      className='bg-background grid h-12'
      style={gridStyleGenerator(CELL_WIDTH_PX)}
    >
      {weekArr.map((d) => {
        const day = format(d, 'eee');
        const date = format(d, 'dd MMM');
        return (
          <div
            key={`calendar-head-${day}`}
            className={cn(
              'box-border flex h-12 flex-col items-center justify-center border text-xs',
              isSameDay(d, today) && 'font-bold',
            )}
            style={styleWidth}
          >
            <p>{day}</p>
            <p>{date}</p>
          </div>
        );
      })}
    </div>
  );
};

export default CalendarDateRow;
