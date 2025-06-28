import { differenceInMinutes } from 'date-fns';

import { CELL_HEIGHT_PX, CELL_WIDTH_PX, ROOM_MAP, TIME_SLOT_INTERVAL } from '@/config';
import type { Booking } from '@/lib/calGrid';
import { cn } from '@/lib/utils';

type BookedCellProps = {
  row: number;
  col: number;
  booking: Booking;
  onClick: (e: React.PointerEvent<HTMLElement>) => void;
};

const getClassName = (value: number, type: 'width' | 'height' | 'left'): string => {
  if (type === 'width') return `w-[${value}px]`;
  if (type === 'height') return `h-[${value}px]`;
  if (type === 'left') return `left-[${value}px]`;
  throw '[getClassName]: invalid type'; // should not be here
};

/**
 * @summary A booked cell covers the original calendar cell, to display a existing booking.
 * @description
 * A absolute view:
 *     - width is shared, so need to be handled very carefully.
 *     - height can be overflowed by the length of the slot.
 *     - draw border and bg (blue maybe?).
 *     - displays the info, start-end time, and bookedBy if available.
 */
const BookedCell = ({ row, col, booking, onClick }: BookedCellProps) => {
  // shares the width based on the numbers of meeting rooms.
  const width = CELL_WIDTH_PX / ROOM_MAP.length;

  // height = numbers of slots, may overflow the original container.
  const height =
    Math.floor(
      differenceInMinutes(new Date(booking.end), new Date(booking.start)) / TIME_SLOT_INTERVAL,
    ) * CELL_HEIGHT_PX;

  // left, offset is the index of meeting rooms.
  const left = ROOM_MAP.findIndex((room) => room.id === booking.roomId) * CELL_WIDTH_PX;

  if (left < 0) {
    console.error('[BookedCell]: invalid roomId', booking.roomId);
    return null;
  }

  return (
    <div
      data-role='booked-cell'
      data-type='booking'
      data-col={col}
      data-row={row}
      data-booking-id={booking.id}
      className={cn(
        'absolute top-0 flex flex-col justify-between border border-blue-600 bg-blue-500 text-sm text-blue-50',
        getClassName(height, 'height'),
        getClassName(width, 'width'),
        getClassName(left, 'left'),
      )}
      onPointerDown={onClick}
    >
      <p>{booking.roomName}</p>
      <p>
        {booking.start} - {booking.end}
      </p>
      {booking.bookedBy && <p>{booking.bookedBy}</p>}
    </div>
  );
};

export default BookedCell;
