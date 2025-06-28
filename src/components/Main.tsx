/**
 * @file Main.tsx
 * @summary Main section of the app
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { add, addDays, format, formatISO, minutesToHours } from 'date-fns';
import { useAtom } from 'jotai';

import BookingForm from '@/components/BookingForm';
import CellComp from '@/components/CellComponent';
import OperationRow from '@/components/OperationRow';
import { Popover, PopoverContent } from '@/components/ui/popover';
import {
  CELL_HEIGHT,
  CELL_WIDTH,
  ROOM_MAP,
  TIME_LABEL_INTERVAL,
  TIME_SLOT_INTERVAL,
} from '@/config';
import { formPropAtom } from '@/lib/atoms';
import type { CalGrid, Cell } from '@/lib/calGrid';
import type { UpsertBooking } from '@/lib/schema';
import { cn } from '@/lib/utils';

/**
 * @summary Represents the state of upsert form.
 * @description
 * - null: no form should be shown.
 * - editingId = null: insertion, otherwise: update.
 */
type FormProp = { editingId: number | null; default: UpsertBooking; startDate: Date } | null;

/**
 * @summary The main component of the application, includes:
 * @description
 * - Operation row: pagination buttons, and a date picker.
 * - The calendar.
 * - A popover form to handle the upsert and delete.
 */
const Main = ({ grid, start }: { grid: CalGrid; start: string }) => {
  const [formProp, setFormProp] = useAtom(formPropAtom);
  const startDate = new Date(start);
  const rowsCount = (24 * 60) / TIME_SLOT_INTERVAL;
  const currTime = new Date();
  const timeLabel = rowsCount / TIME_LABEL_INTERVAL;

  // Help to create doms.
  const weekViewCols = Array.from({ length: 7 }, (_, i) => i);
  const dayRows = Array.from({ length: rowsCount }, (_, i) => i);

  // The handler of clicking a cell.
  // It's a lifted func, since I don't want to create almost 700 lambda functions
  // The tradeoff is that I have to parse the dataset.
  const onClickHandler = (e: React.PointerEvent<HTMLElement>) => {
    // Stop event response when form is open.
    if (formProp) return;

    const cell = e.currentTarget as HTMLElement;
    const cellType = cell.dataset.bookingId ? 'avail' : 'booking';

    const row = parseInt(cell.dataset.dataTableRow ?? '', 10);
    const col = parseInt(cell.dataset.dataTableCol ?? '', 10);
    if (isNaN(row) || isNaN(col) || row < 0 || col < 0 || row >= rowsCount || col >= 7) {
      console.error('[onClickHandler]: failed to locate a cell.');
      return;
    }

    const cellProp: Cell = grid[row][col];

    // Insert a new booking.
    if (cellType === 'avail') {
      const startTime = add(startDate, { days: col, minutes: row * TIME_SLOT_INTERVAL });
      const start = formatISO(startTime);
      const end = formatISO(add(startTime, { minutes: TIME_SLOT_INTERVAL }));

      const availRoom = ROOM_MAP.find(
        (kv) => !cellProp?.some((booking) => booking.roomId === kv.id),
      );

      if (!availRoom) {
        console.error('[onClickHandler]: no available meeting room.');
        return;
      }

      setFormProp({ editingId: null, default: { start, end, roomId: availRoom.id }, startDate });
      return;
    }

    // View/update a existing booking.
    if (cellType === 'booking') {
      if (!cellProp) {
        console.error('[onClickHandler]: failed to get a booking id.');
        return;
      }

      const bookingId = parseInt(cell.dataset.bookingId ?? '', 10);
      if (isNaN(bookingId)) {
        console.error('[onClickHandler]: failed to get a booking id.');
        return;
      }

      const bookings = cellProp?.filter((kv) => kv.id === bookingId);

      if (bookings?.length != 1) {
        console.error('[onClickHandler]: failed to get a booking id.');
        return;
      }

      setFormProp({ editingId: bookingId, default: bookings[0], startDate });
      return;
    }

    console.error('[onClickHandler]: invalid cell type.'); // should not be here.
  };

  return (
    <div data-role='main' className='mx-auto h-full w-full overflow-scroll'>
      {/* Operation row */}
      <OperationRow startDate={startDate} />

      {/* Calendar header */}
      <div data-role='calendar-head' className='sticky top-0 grid h-12 w-full grid-cols-8'>
        <div key='calendar-head-side' className={cn('border-border h-12 border', CELL_WIDTH)}></div>
        {weekViewCols.map((i) => (
          <div key={`calendar-head-${i}`} className={cn('border-border h-12 border', CELL_WIDTH)}>
            {format(addDays(startDate, i), 'eee  dd MMM')}
          </div>
        ))}
      </div>

      {/* Calendar cells */}
      <div data-role='calendar-data' className='border-border w-full border'>
        {/* Rows */}
        {dayRows.map((i) => (
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
                i !== 0 && i % timeLabel === 0 && 'border-border border-b',
              )}
            >
              {/* Display the time label */}
              {i % timeLabel === 0 && `${minutesToHours(i * TIME_SLOT_INTERVAL)}:00`}
            </div>

            {/* Cells */}
            {Array.from({ length: 8 }, (_, j) => j).map((j) => (
              <CellComp
                key={`cell-${i}-${j}`}
                row={i}
                col={j}
                grid={grid}
                timeLabel={timeLabel}
                startDate={startDate}
                currTime={currTime}
                onClick={onClickHandler}
              />
            ))}
          </div>
        ))}
      </div>

      {/* A popover to toggle the form */}
      <Popover open={!!formProp}>
        <PopoverContent className='w-[300px]'>
          <BookingForm grid={grid} />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default Main;

export type { FormProp };
