import { type Day, differenceInCalendarDays } from 'date-fns';

import { ROOM_MAP } from '@/config';
import { ThrowInvalidIncomingDataErr } from '@/lib/errorHandler';
import { type Room, type Rooms, RoomsSchema } from '@/lib/schema';
import { newDate } from '@/lib/tools';

/**
 * @summary main data structure of this application.
 */
type WeekBookings = DayBookings[];

type DayBookings = Record<number, Room>;

const newWeekBookings = (): WeekBookings => {
  const weekBookings: WeekBookings = [];
  for (let i = 0; i < 7; i++) {
    const day: DayBookings = {};
    weekBookings.push(day);
  }
  return weekBookings;
};

const weekBookingsGenerator = (rooms: Rooms, start: string): WeekBookings => {
  const validatedRooms = RoomsSchema.safeParse(rooms);
  if (!validatedRooms.success) ThrowInvalidIncomingDataErr(JSON.stringify(validatedRooms.error));
  const data = validatedRooms.data!;

  const startDate = newDate(start);

  const weekBookings: WeekBookings = newWeekBookings();

  const bookingIdSet = new Set<number>();

  for (const room of data) {
    if (!ROOM_MAP.some((r) => r.id === room.roomId)) continue;

    for (const slot of room.slots) {
      const bookingStartTime = new Date(slot.start);
      const col = differenceInCalendarDays(bookingStartTime, startDate);

      if (col < 0 || col > 6) continue;

      if (bookingIdSet.has(slot.id))
        ThrowInvalidIncomingDataErr('[weekBookingsGenerator]: Duplicated slot id was found.');
      bookingIdSet.add(slot.id);

      const dayBookings: DayBookings = weekBookings[col];

      if (!dayBookings[room.roomId]) {
        dayBookings[room.roomId] = {
          roomId: room.roomId,
          roomName: room.roomName,
          slots: [],
        };
      }

      dayBookings[room.roomId].slots.push(slot);
    }
  }

  weekBookings.forEach((day) => {
    Object.values(day).forEach((room) => {
      room.slots.sort((a, b) => (a.start > b.start ? 1 : -1));
    });
  });

  // Overlapping check
  let overlapping = false;
  for (const day of weekBookings) {
    for (const room of Object.values(day)) {
      if (room.slots.length < 2) continue;
      for (let i = 0; i < room.slots.length - 1; i++) {
        if (room.slots[i].end > room.slots[i + 1].start) {
          overlapping = true;
          break;
        }
      }

      if (overlapping) break;
    }

    if (overlapping) break;
  }

  if (overlapping)
    ThrowInvalidIncomingDataErr('[weekBookingsGenerator]: Overlapping slots are found.');

  return weekBookings;
};

export { weekBookingsGenerator };

export type { Day, DayBookings, WeekBookings };
