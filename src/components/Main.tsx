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
import { CELL_HEIGHT_PX, CELL_WIDTH_PX, TIME_LABEL_INTERVAL, TIME_SLOT_INTERVAL } from '@/config';
import { calendarGridAtom, formPropAtom, startAtom } from '@/lib/atoms';
import { newDate, styleGenerator } from '@/lib/tools';
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

  const styleHeight = styleGenerator(undefined, CELL_HEIGHT_PX);
  const styleFull = styleGenerator(CELL_WIDTH_PX, CELL_HEIGHT_PX);
  const styleWidth = styleGenerator(CELL_WIDTH_PX);

  return (
    <div className='w-full overflow-x-scroll flex justify-center items-center'>
      <div
        data-role='main'
        // Stop event response when form is open.
        className={cn(
          'mx-auto my-12 h-fit w-fit',
          formProp && 'pointer-events-none',
        )}
      >
        {/* Operation row */}
        <OperationRow startDate={startDate} />

        {/* Calendar header */}
        <div data-role='calendar-head' className='grid h-12 grid-cols-8'>
          <div
            key='calendar-head-side'
            className={cn('border-border h-12 border')}
            style={styleWidth}
          ></div>
          {weekViewCols.map((i) => (
            <div
              key={`calendar-head-${i}`}
              className={cn(
                'border-border flex h-12 items-center justify-center border font-semibold',
              )}
              style={styleWidth}
            >
              {format(addDays(startDate, i), 'eee  dd MMM')}
            </div>
          ))}
        </div>

        {grid.length === 0 ? (
          <Loading />
        ) : (
          // Calendar cells
          <div data-role='calendar-data' className='border-border border'>
            {/* Rows */}
            {dayRows.map((i) => (
              <div
                key={`calendar-data-row-${i}`}
                className={cn('grid grid-cols-8')}
                style={styleHeight}
              >
                {/* A row */}
                <div
                  className={cn(
                    i % timeLabel !== 0 && 'invisible',
                    i % timeLabel === 0 && 'border-t text-center',
                  )}
                  style={styleFull}
                >
                  {/* Display the time label */}
                  {`${minutesToHours(i * TIME_SLOT_INTERVAL)}:${String((i % (60 / TIME_SLOT_INTERVAL)) * TIME_SLOT_INTERVAL).padStart(2, '0')}`}
                </div>

                {/* Cells */}
                {weekViewCols.map((j) => (
                  <CellComp
                    key={`cell-${i}-${j}`}
                    row={i}
                    col={j}
                    timeLabel={timeLabel}
                    style={styleFull}
                  />
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
