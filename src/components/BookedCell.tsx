/**
 * @file BookedCell.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { differenceInMinutes } from 'date-fns';
import { useSetAtom } from 'jotai';

import { CELL_HEIGHT_PX, CELL_WIDTH_PX, ROOM_MAP, TIME_SLOT_INTERVAL } from '@/config';
import { formPropAtom } from '@/lib/atoms';
import type { Booking, CalGrid } from '@/lib/calGrid';
import { cellOnClickHandler } from '@/lib/cellOnClickHandler';
import { styleGenerator } from '@/lib/tools';
import { cn } from '@/lib/utils';

type BookedCellProps = {
  row: number;
  col: number;
  start: string;
  grid: CalGrid;
  booking: Booking;
};

// shares the width based on the numbers of meeting rooms.
const width = Math.floor(CELL_WIDTH_PX / ROOM_MAP.length);

/**
 * @summary A booked cell covers the original calendar cell, to display a existing booking.
 * @description
 * A absolute view:
 *     - width is shared, so need to be handled very carefully.
 *     - height can be overflowed by the length of the slot.
 *     - draw border and bg (blue maybe?).
 *     - displays the info, start-end time, and bookedBy if available.
 */
const BookedCell = ({ row, col, booking, grid, start }: BookedCellProps) => {
  const setFormProp = useSetAtom(formPropAtom);

  // height = numbers of slots, may overflow the original container.
  const height =
    Math.floor(
      differenceInMinutes(new Date(booking.end), new Date(booking.start)) / TIME_SLOT_INTERVAL,
    ) * CELL_HEIGHT_PX;

  // left, offset is the index of meeting rooms.
  const left = ROOM_MAP.findIndex((room) => room.id === booking.roomId) * CELL_WIDTH_PX;

  const style = styleGenerator(width, height, left);

  if (left < 0) {
    console.error('[BookedCell]: invalid roomId', booking.roomId);
    return null;
  }

  return (
    <div
      data-role='booked-cell'
      className={cn(
        'absolute top-0 z-10 flex flex-col justify-between border border-blue-600 bg-blue-500/80 text-center text-xs text-blue-50',
      )}
      style={style}
      onPointerDown={() => cellOnClickHandler(row, col, grid, start, setFormProp, booking)}
    >
      <p>{booking.roomName}</p>
    </div>
  );
};

export default BookedCell;
