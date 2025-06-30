/**
 * @file CellComponent.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { add, isBefore, isEqual } from 'date-fns';
import { useAtom, useSetAtom } from 'jotai';

import BookedCell from '@/components/BookedCell';
import { CELL_HEIGHT, CELL_WIDTH, TIME_SLOT_INTERVAL } from '@/config';
import { calendarGridAtom, formPropAtom, startAtom } from '@/lib/atoms';
import type { Cell } from '@/lib/calGrid';
import { cellOnClickHandler } from '@/lib/cellOnClickHandler';
import { newDate } from '@/lib/dateUtils';
import { cn } from '@/lib/utils';

type CellCompProps = {
  row: number;
  col: number;
  timeLabel: number;
};

/**
 * @summary Represents a cell of the calendar view, includes:
 * @description
 * Main logic:
 * - for all cells:
 *   - if in the past, display a gray bg, onHover: none, onClick: none
 *   - if in the future, display a normal bg, onClick: insertion form
 *   - if there are bookings, draw a absolute view.
 */
const CellComp = ({ row, col, timeLabel }: CellCompProps) => {
  const [grid] = useAtom(calendarGridAtom);
  const [start] = useAtom(startAtom);
  const setFormProp = useSetAtom(formPropAtom);

  const cell: Cell = grid[col][row];

  // The start time of the cell.
  const startDate = newDate(start);
  const currTime = new Date();
  const cellStartTime: Date = add(startDate, { minutes: row * TIME_SLOT_INTERVAL, days: col });

  // If the slot is prev than curr.
  const isPast = isBefore(cellStartTime, currTime);

  // The booked slots dom is controlled by the cell when is the start time.
  const bookings = cell?.filter((slot) => isEqual(new Date(slot.start), cellStartTime));

  return (
    <div
      data-role='cell'
      className={cn(
        'border-border relative border-r',
        CELL_HEIGHT,
        CELL_WIDTH,
        isPast ? 'bg-gray-400' : 'bg-gray-200',
        col === 0 && 'border-l',
        row === 0 && 'border-t',
        row != 0 && row % timeLabel === 0 && 'border-b',
      )}
      onPointerDown={() => cellOnClickHandler(row, col, grid, start, setFormProp)}
    >
      {/* To display the possible booked blocks(A covered layer)  */}
      {bookings?.map((booking) => (
        <BookedCell
          key={booking.id}
          row={row}
          col={col}
          booking={booking}
          grid={grid}
          start={start}
        />
      ))}
    </div>
  );
};

export default CellComp;
