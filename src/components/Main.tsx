/**
 * @file Main.tsx
 * @summary Main section of the app
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { addDays, format, minutesToHours } from 'date-fns';

import OperationRow from '@/components/OperationRow';
import { CELL_HEIGHT, CELL_WIDTH, TIME_SLOT_INTERVAL } from '@/config';
import type { Table } from '@/lib/table';
import { cn } from '@/lib/utils';

import CellComp from './CellComponent';

/**
 * @summary The main component of the application, includes:
 * @description
 * - An optional warning bar
 * - Operation row: pagination buttons, and a date picker.
 * - The calendar, for every 2 hours, display the time and draw a bottom border.
 */
const Main = ({ table, start }: { table: Table; start: string }) => {
  const startDate = new Date(start);
  const rowsCount = (24 * 60) / TIME_SLOT_INTERVAL;
  const rowsForTwoHours = rowsCount / 12;

  return (
    <div data-role='main' className='mx-auto h-full w-full overflow-scroll'>
      {/* Optional warning bar */}
      {import.meta.env.MODE !== 'prod' && (
        <p data-role='env-warning' className='text-muted text-sm'>
          Preview mode enabled. This demo does not connect to the backend.
          <br /> All data is mocked, and room bookings will not update the interface. <br />
          Submissions may randomly succeed or fail to simulate server behavior.
        </p>
      )}

      {/* Operation row */}
      <OperationRow startDate={startDate} />

      {/* Calendar header */}
      <div data-role='calendar-head' className='sticky top-0 grid h-12 w-full grid-cols-8'>
        <div key='calendar-head-side' className={cn('border-border h-12 border', CELL_WIDTH)}></div>
        {Array.from({ length: 7 }, (_, i) => i).map((i) => (
          <div key={`calendar-head-${i}`} className={cn('border-border h-12 border', CELL_WIDTH)}>
            {format(addDays(startDate, i), 'eee  dd MMM')}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div data-role='calendar-data' className='border-border w-full border'>
        {/* Rows */}
        {Array.from({ length: rowsCount }, (_, i) => i).map((i) => (
          <div
            key={`calendar-data-row-${i}`}
            className={cn('grid w-full grid-cols-8', CELL_HEIGHT)}
          >
            {/* A row */}
            <div
              className={cn(
                '',
                CELL_HEIGHT,
                CELL_WIDTH,
                // Draw a bottom line for every 2 hours.
                i !== 0 && i % rowsForTwoHours === 0 && 'border-border border-b',
              )}
            >
              {/* Display the time for every 2 hours. */}
              {i % rowsForTwoHours === 0 && `${minutesToHours(i * TIME_SLOT_INTERVAL)}:00`}
            </div>

            {/* Cells */}
            {Array.from({ length: 8 }, (_, j) => j).map((j) => (
              <CellComp
                key={`cell-${i}-${j}`}
                row={i}
                col={j}
                table={table}
                startDate={startDate}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Main;
