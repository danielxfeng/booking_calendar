/**
 * @file BasicGrids.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { memo } from 'react';
import { startOfDay } from 'date-fns';
import { useSetAtom } from 'jotai';

import { CELL_HEIGHT_PX, CELL_WIDTH_PX } from '@/config';
import { formPropAtom } from '@/lib/atoms';
import { gridStyleGenerator, isPast, styleGenerator, timeFromCellIdx } from '@/lib/tools';
import { cn } from '@/lib/utils';

const rowsArr = Array.from({ length: 24 }, (_, i) => i);
const colsArr = Array.from({ length: 7 }, (_, i) => i);

type BasicCellProps = {
  col: number;
  row: number;
  baseTime: Date;
  curr: Date;
};

const BasicCell = ({ col, row, baseTime, curr }: BasicCellProps) => {
  const setFormProp = useSetAtom(formPropAtom);
  const cellTime = timeFromCellIdx(col, row, baseTime);
  return (
    <div
      className={cn(
        'border-border box-border border',
        isPast(cellTime, curr) ? 'bg-gray-200' : 'bg-gray-50',
      )}
      style={styleGenerator(CELL_WIDTH_PX, CELL_HEIGHT_PX)}
      onClick={() => setFormProp({ startTime: cellTime })}
    ></div>
  );
};

/**
 * @summary A full static layer contains 8 (7 + time indicator) * 24 grids
 */
const BasicGrids = memo(() => {
  const curr = new Date();
  const baseTime = startOfDay(curr); // start of today
  const setFormProp = useSetAtom(formPropAtom);

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
