/**
 * @file Main.tsx
 * @summary Main section of the app
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { addDays, format, minutesToHours } from 'date-fns';
import { useAtom } from 'jotai';

import CellComp from '@/components/CellComponent';
import Loading from '@/components/Loading';
import OperationRow from '@/components/OperationRow';
import { CELL_HEIGHT, CELL_WIDTH, TIME_LABEL_INTERVAL, TIME_SLOT_INTERVAL } from '@/config';
import { calendarGridAtom, formPropAtom, startAtom } from '@/lib/atoms';
import { newDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

// Help to create doms.
const rowsCount = (24 * 60) / TIME_SLOT_INTERVAL;
const timeLabel = rowsCount / TIME_LABEL_INTERVAL;
const weekViewCols = Array.from({ length: 7 }, (_, i) => i);
const dayRows = Array.from({ length: rowsCount }, (_, i) => i);

/**
 * @summary The main component of the application, includes:
 * @description
 * - Operation row: pagination buttons, and a date picker.
 * - The calendar.
 */
const Main = () => {
  const [start] = useAtom(startAtom);
  const [grid] = useAtom(calendarGridAtom);
  const [formProp] = useAtom(formPropAtom);
  const startDate = newDate(start);

  return (
    <div
      data-role='main'
      // Stop event response when form is open.
      className={cn('mx-auto h-full w-full overflow-scroll', formProp && 'pointer-events-none')}
    >
      {/* Operation row */}
      <OperationRow startDate={startDate} />

      {/* Calendar header */}
      <div data-role='calendar-head' className='sticky top-0 grid h-12 w-full grid-cols-8'>
        <div key='calendar-head-side' className={cn('border-border h-12 border', CELL_WIDTH)}></div>
        {weekViewCols.map((i) => (
          <div key={`calendar-head-${i}`} className={cn('border-border h-12 border', CELL_WIDTH)}>
            {format(addDays(startDate, i), 'eee  dd MMM')}
          </div>
        ))}
      </div>

      {grid.length === 0 ? (
        <Loading />
      ) : (
        // Calendar cells
        <div data-role='calendar-data' className='border-border w-full border'>
          {/* Rows */}
          {dayRows.map((i) => (
            <div
              key={`calendar-data-row-${i}`}
              className={cn('grid w-full grid-cols-8', CELL_HEIGHT)}
            >
              {/* A row */}
              <div
                className={cn(
                  CELL_HEIGHT,
                  CELL_WIDTH,
                  // Draw a bottom line for every 2 hours.
                  i !== 0 && i % timeLabel === 0 && 'border-border border-b',
                )}
              >
                {/* Display the time label */}
                {i % timeLabel === 0 && `${minutesToHours(i * TIME_SLOT_INTERVAL)}:00`}
              </div>

              {/* Cells */}
              {weekViewCols.map((j) => (
                <CellComp key={`cell-${i}-${j}`} row={i} col={j} timeLabel={timeLabel} />
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Main;
