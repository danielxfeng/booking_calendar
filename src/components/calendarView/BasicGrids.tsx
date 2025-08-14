import { memo } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { addDays } from 'date-fns';
import { useAtomValue } from 'jotai';

import { Skeleton } from '@/components/ui/skeleton';
import { CELL_HEIGHT_PX, CELL_WIDTH_PX, OPEN_HOURS_IDX } from '@/config';
import { startAtom } from '@/lib/atoms';
import {
  gridStyleGenerator,
  isPast,
  newDate,
  rowsArr,
  slotsInAHour,
  styleGenerator,
  timeFromCellIdx,
} from '@/lib/tools';
import { cn } from '@/lib/utils';

const colsArr = Array.from({ length: 7 }, (_, i) => i);
const rows = (OPEN_HOURS_IDX[1] - OPEN_HOURS_IDX[0]) / slotsInAHour;

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
      className={cn(
        'box-border border-r-2 border-b-2 last:border-r-0',
        past ? 'bg-muted' : 'bg-transparent',
      )}
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
  const isFetching = useIsFetching();

  return (
    <div
      data-role='calendar-basic-grids'
      className='container box-border'
      style={styleGenerator(CELL_WIDTH_PX * 7, CELL_HEIGHT_PX * rows)}
    >
      {/* Rows */}
      {rowsArr.map((row) =>
        isFetching ? (
          <Skeleton
            key={row}
            className={cn('rounded-none', row % 2 === 0 ? 'bg-muted/50' : 'bg-muted')}
            style={gridStyleGenerator(CELL_WIDTH_PX, CELL_HEIGHT_PX)}
          />
        ) : (
          <div
            key={`cal-basic-row-${row}`}
            className='grid'
            style={gridStyleGenerator(CELL_WIDTH_PX, CELL_HEIGHT_PX)}
          >
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
        ),
      )}
    </div>
  );
});

export default BasicGrids;
