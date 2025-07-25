/**
 * @file BasicGrids.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { memo } from 'react';
import { addDays } from 'date-fns';
import { useAtomValue } from 'jotai';

import { CELL_HEIGHT_PX, CELL_WIDTH_PX, OPEN_HOURS_IDX, TIME_SLOT_INTERVAL } from '@/config';
import { startAtom } from '@/lib/atoms';
import { gridStyleGenerator, isPast, newDate, styleGenerator, timeFromCellIdx } from '@/lib/tools';
import { cn } from '@/lib/utils';

const slotsInAHour = 60 / TIME_SLOT_INTERVAL;

// One row per hour
const rowsArr = Array.from(
  { length: (OPEN_HOURS_IDX[1] - OPEN_HOURS_IDX[0]) / slotsInAHour },
  (_, i) => i + OPEN_HOURS_IDX[0] / slotsInAHour,
);

const colsArr = Array.from({ length: 7 }, (_, i) => i);

type BasicCellProps = {
  col: number;
  row: number;
  baseTime: Date;
  curr: Date;
};

const BasicCell = ({ col, row, baseTime, curr }: BasicCellProps) => {
  const cellBaseTime = addDays(baseTime, col);
  const cellTime = timeFromCellIdx(row, cellBaseTime);
  const past = isPast(cellTime, curr);
  return (
    <div
      className={cn('border-border box-border border', past ? 'bg-gray-100/98' : 'bg-transparent')}
      style={styleGenerator(CELL_WIDTH_PX, CELL_HEIGHT_PX)}
    ></div>
  );
};

/**
 * @summary A pure static grids layout to display a week view. 8 (7 + time indicator) * 24 grids
 */
const BasicGrids = memo(() => {
  const curr = new Date();
  const start = useAtomValue(startAtom);
  const baseTime = newDate(start);

  return (
    <div data-role='calendar-basic-grids' className='h-full w-full'>
      {/* Rows */}
      {rowsArr.map((row) => (
        <div
          key={`cal-basic-row-${row}`}
          className='box-border grid'
          style={gridStyleGenerator(CELL_WIDTH_PX, CELL_HEIGHT_PX)}
        >
          {/* Label */}
          <div
            key={`cal-side-row-${row}`}
            className='border-border box-border flex items-center justify-center border text-xs'
            style={styleGenerator(CELL_WIDTH_PX, CELL_HEIGHT_PX)}
          >
            {`${row.toString().padStart(2, '0')}:00`}
          </div>

          {/* Cells */}
          {colsArr.map((col) => (
            <BasicCell
              key={`cal-basic-cell-${row}-${col}`}
              col={col}
              row={row}
              baseTime={baseTime}
              curr={curr}
            />
          ))}
        </div>
      ))}
    </div>
  );
});

export default BasicGrids;
