/**
 * @file CellOnClickHandler.ts
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { add, format, isBefore } from 'date-fns';

import type { FormProp } from '@/components/BookingForm';
import { ROOM_MAP, TIME_SLOT_INTERVAL } from '@/config';
import type { Booking, CalGrid, Cell } from '@/lib/calGrid';
import { newDate } from '@/lib/dateUtils';

/**
 * @summary The onClick handler for both common cell and booked cell.
 * @description
 * This logic is abstracted bc it is shared by 2 components, and also it is easier for unit test.
 *
 * If `booking` is not provided, it's a common cell('avail'), which means an insertion request.
 *  - the time is computed from the given row/col and start date,
 *  - prevent inserting into expired time slots
 *  - the first available room will be selected automatically.
 *
 * Otherwise, it's a booked cell('booking'), which means an update request
 * or view-only request(expired or for ABAC reason).
 *
 * In the end, `setFormProp` is called to set the property, and also changing of `formProp` should
 * trigger the form.
 */
const cellOnClickHandler = (
  row: number,
  col: number,
  grid: CalGrid,
  start: string,
  setFormProp: (fp: FormProp) => void,
  booking?: Booking,
) => {
  const cellType = booking ? 'booking' : 'avail';
  const startDate = newDate(start);

  // Insert a new booking.
  if (cellType === 'avail') {
    const cellProp: Cell = grid[col][row];
    const startTime = add(startDate, { days: col, minutes: row * TIME_SLOT_INTERVAL });

    // Prevent inserting into expired time slots
    if (isBefore(startTime, new Date())) return;

    const start = format(startTime, "yyyy-MM-dd'T'HH:mm");
    const end = format(add(startTime, { minutes: TIME_SLOT_INTERVAL }), "yyyy-MM-dd'T'HH:mm");

    const availRoom = ROOM_MAP.find((kv) => !cellProp?.some((booking) => booking.roomId === kv.id));

    if (!availRoom) {
      console.error('[onClickHandler]: no available meeting room.');
      return;
    }

    setFormProp({
      editingId: null,
      default: { start, end, roomId: availRoom.id },
      startDate,
      col,
      row,
    });
    return;
  }

  // View/update a existing booking.
  if (cellType === 'booking') {
    setFormProp({ editingId: booking!.id, default: booking!, startDate, col, row });
    return;
  }

  console.error('[onClickHandler]: invalid cell type.'); // should not be here.
};

export { cellOnClickHandler };
