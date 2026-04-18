import { type Day, differenceInCalendarDays } from 'date-fns';

import { ROOM_MAP } from '@/config';
import { ThrowInvalidIncomingDataErr } from '@/lib/errorHandler';
import { type Room, type Rooms, type RoomsIsoTime, RoomsIsoTimeSchema, RoomsSchema } from '@/lib/schema';
import { isoTimeRoomsToLocalTimeRooms, newDate } from '@/lib/tools';

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

const weekBookingsGenerator = (rooms: RoomsIsoTime, start: string): WeekBookings => {
  const validatedIsoTimeRooms = RoomsIsoTimeSchema.safeParse(rooms);
  if (!validatedIsoTimeRooms.success)
    ThrowInvalidIncomingDataErr(JSON.stringify(validatedIsoTimeRooms.error));
  const isoTimeRooms = validatedIsoTimeRooms.data!;
  const localTimeRooms: Rooms = isoTimeRoomsToLocalTimeRooms(isoTimeRooms);
  const validatedRooms = RoomsSchema.safeParse(localTimeRooms);
  if (!validatedRooms.success) ThrowInvalidIncomingDataErr(JSON.stringify(validatedRooms.error));
  const data = validatedRooms.data!;

  const startDate = newDate(start);

  const weekBookings: WeekBookings = newWeekBookings();

  const bookingIdSet = new Set<number>();

  for (const room of data) {
    if (!ROOM_MAP.some((r) => r.id === room.roomId)) continue;

    for (const slot of room.slots) {
      const bookingStartTime = new Date(slot.startTime);
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
      room.slots.sort((a, b) => (a.startTime > b.startTime ? 1 : -1));
    });
  });

  // Overlapping check
  let overlapping = false;
  for (const day of weekBookings) {
    for (const room of Object.values(day)) {
      if (room.slots.length < 2) continue;
      for (let i = 0; i < room.slots.length - 1; i++) {
        if (room.slots[i].endTime > room.slots[i + 1].startTime) {
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
