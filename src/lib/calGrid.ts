/**
 * @file calGrid.ts
 * @summary Main data structure of the app: a 2D matrix of bookings for the weekly calendar view.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */
import { differenceInCalendarDays, getHours, getMinutes } from 'date-fns';

import { NUMBERS_OF_ROOMS, TIME_SLOT_INTERVAL } from '@/config';
import { ThrowInvalidIncomingDataErr } from '@/lib/errorHandler';
import { type BookingFromApi, type Rooms, RoomsSchema } from '@/lib/schema';

/**
 * @summary A booking in the calendar grid view.
 * @description
 * A booking used for the calendar grid view.
 * roomId and roomName are added to the Cell.
 */
type Booking = {
  roomId: number;
  roomName: string;
} & BookingFromApi;

/**
 * @summary A cell, may contains an array of bookings, or null.
 */
type Cell = Booking[] | null;

/**
 * @summary One day, contains cells.
 */
type Day = Cell[];

/**
 * @summary 2D matrix of bookings for the weekly calendar view: grid[day][timeSlot]
 */
type CalGrid = Day[];

// Returns a new empty Calendar Grid.
const newCalGrid = (): CalGrid =>
  Array.from({ length: 7 }, () => Array((24 * 60) / TIME_SLOT_INTERVAL).fill(null));

/**
 * @summary Generate a calendar grid from given rooms
 *
 * @param rooms the array of rooms.
 * @param startDate the start date of calendar table.
 * @returns a table view.
 */
const calGridGenerator = (rooms: Rooms, startDate: Date): CalGrid => {

  const validatedRooms = RoomsSchema.safeParse(rooms);
  if (!validatedRooms.success) ThrowInvalidIncomingDataErr(JSON.stringify(validatedRooms.error));

  const grid: CalGrid = newCalGrid();

  // The length of the array.
  if (rooms.length > NUMBERS_OF_ROOMS)
    ThrowInvalidIncomingDataErr('Too many meeting rooms in API response.');

  // Prevent duplicated/overlapped bookings.
  const roomSet = new Set();
  const bookingMap = new Map<number, Booking>();

  // iterator all bookings
  for (const room of rooms) {
    // Prevent duplicated room
    if (roomSet.has(room.roomId)) ThrowInvalidIncomingDataErr('Duplicate room detected.');
    roomSet.add(room.roomId);

    for (const booking of room.slots) {
      const dayIndex = differenceInCalendarDays(booking.start, startDate);

      // Validate the date
      if (dayIndex < 0)
        ThrowInvalidIncomingDataErr('The booking is outside the displayed week range.');

      // We don't take the bookings out of this week.
      if (dayIndex > 6) continue;

      // Find all related cells, also we have checked that end > start in schema.
      const timeIndexStart = Math.floor(
        (getHours(booking.start) * 60 + getMinutes(booking.start)) / TIME_SLOT_INTERVAL,
      );
      const timeIndexEnd = Math.floor(
        (getHours(booking.end) * 60 + getMinutes(booking.end)) / TIME_SLOT_INTERVAL,
      );

      // Prevent duplicated booking id.
      if (bookingMap.has(booking.id)) ThrowInvalidIncomingDataErr('The booking id is not unique.');

      const newBooking: Booking = { ...booking, roomId: room.roomId, roomName: room.roomName };
      bookingMap.set(booking.id, newBooking);

      // Upsert booking to related cells.
      for (let timeIndex = timeIndexStart; timeIndex < timeIndexEnd; timeIndex++) {
        const cell = grid[dayIndex]?.[timeIndex];

        // Insert
        if (!cell) {
          grid[dayIndex][timeIndex] = [newBooking];
          continue;
        }

        // Or Append
        // Check overlapping.
        if (cell.some((booking) => booking.roomId === room.roomId))
          ThrowInvalidIncomingDataErr('Duplicate booking detected.');

        grid[dayIndex][timeIndex]!.push(newBooking);
      }
    }
  }

  return grid;
};

export { calGridGenerator, newCalGrid };

export type { Booking, CalGrid, Cell, Day };
