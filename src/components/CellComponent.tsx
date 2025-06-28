/**
 * @file CellComponent.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import React from 'react';
import { add, compareAsc } from 'date-fns';

import { CELL_HEIGHT, CELL_WIDTH, TIME_SLOT_INTERVAL } from '@/config';
import type { CalGrid, Cell } from '@/lib/calGrid';
import { cn } from '@/lib/utils';

import BookedCell from './BookedCell';

type CellCompProps = {
  row: number;
  col: number;
  timeLabel: number;
  grid: CalGrid;
  startDate: Date;
  currTime: Date;
  onClick: (e: React.PointerEvent<HTMLElement>) => void;
};

/**
 * @summary Represents a cell of the calendar view, includes:
 * @description
 * Main logic:
 * - for all cells:
 *   - if in the past, display a gray bg, onHover: none, onClick: none
 *   - if in the future, display a normal bg, onHover: Hover Card to show the time, onClick: upsert form(insertion only)
 *   - if there are bookings, draw a absolute view.
 */
const CellComp = ({ row, col, timeLabel, grid, startDate, currTime, onClick }: CellCompProps) => {
  const cell: Cell = grid[row][col];

  // The start time of the cell.
  const cellStartTime: Date = add(startDate, { minutes: row * TIME_SLOT_INTERVAL, days: col });

  // If the slot is prev than curr.
  const isPast = compareAsc(cellStartTime, currTime) < 0;

  // The booked slots dom is controlled by the cell when is the start time.
  const bookings = cell?.filter((slot) => compareAsc(new Date(slot.start), cellStartTime) === 0);

  return (
    <div
      data-role='cell'
      data-type='avail'
      data-col={col}
      data-row={row}
      className={cn(
        'border-border relative border-r',
        CELL_HEIGHT,
        CELL_WIDTH,
        isPast ? 'bg-gray-400' : 'bg-gray-200',
        col === 0 && 'border-l',
        row === 0 && 'border-t',
        row != 0 && row % timeLabel === 0 && 'border-b',
      )}
      onPointerDown={onClick}
    >
      {/* To display the possible booked blocks(A covered layer)  */}
      {bookings?.map((booking) => (
        <BookedCell key={booking.id} row={row} col={col} booking={booking} onClick={onClick} />
      ))}
    </div>
  );
};

export default CellComp;
