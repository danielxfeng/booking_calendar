/**
 * @file BookingFormUtils.tsx
 * @summary abstracted helper functions for Booking form for decoupling and unit testing.
 * @see BookingForm - @/components/BookingForm.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { addMinutes, differenceInMinutes, isAfter, isBefore, isEqual, isSameDay } from 'date-fns';

import type { FormProp, FormType } from '@/components/BookingForm';
import type { Slot } from '@/components/ScrollSlotPicker';
import { ROOM_MAP, TIME_SLOT_INTERVAL } from '@/config';
import { ThrowInternalError } from '@/lib/errorHandler';
import type { DayBookings } from '@/lib/weekBookings';

import type { BookingFromApi, UpsertBooking } from './schema';
import { formatToDateTime } from './tools';

/**
 * @summary Returns form formType, and the default values
 * @description
 * - if there is no `currBooking`, it's an `insertion` form.
 * - Then there should be an existing booking.
 *   - If the booking is expired, or the bookedBy is null, the type is `view`
 *   - Otherwise, it is `update`
 */
const initForm = (
  formProp: Exclude<FormProp, null>,
  existingBookings: DayBookings,
  currBooking?: BookingFromApi,
  currRoomId?: number,
): [FormType, UpsertBooking] => {
  if (!currBooking) {
    // `insert`
    const formType = 'insert';

    // Find an available room
    let roomId = ROOM_MAP.find((room) => {
      return existingBookings[room.id].slots.some((slot) => {
        const start = new Date(slot.start);
        const end = new Date(slot.end);
        return (
          // Bc we have sorted the slots,
          // so if the current slot is after the startTime, then the room is available.
          isAfter(start, formProp.startTime) ||
          // Is not between
          (!isBefore(formProp.startTime, start) && !isAfter(formProp.startTime, end))
        );
      });
    })?.id;

    // fallbacks to any room, then user/zod handles it in UI. But should not be here.
    if (!roomId) {
      console.error('[initForm]: failed to find an available room.');
      roomId = ROOM_MAP[0].id;
    }

    return [
      formType,
      {
        roomId,
        start: formatToDateTime(formProp.startTime),
        end: formatToDateTime(addMinutes(formProp.startTime, TIME_SLOT_INTERVAL)),
      },
    ];
  } else {
    // 'update' or 'view'

    // should not be here.
    if (!currBooking || !currRoomId)
      return ThrowInternalError('The update form requires an existing booking and a roomId');

    // Update is only allowed for a booking in future.
    const formType = isAfter(formProp.startTime, new Date()) ? 'update' : 'view';
    return [formType, { start: currBooking.start, end: currBooking.end, roomId: currRoomId }];
  }
};

/**
 * @summary Calculate a slots.
 * @description
 * The idea is to iterate the bookings, if there is a existing booking, set the slot to unavailable.
 * The current booking is an exception.
 */
const calculateSlots = (
  existingBookings: DayBookings,
  filedType: 'start' | 'end',
  roomId: number | undefined,
  baseTime: Date,
  bookingId?: number | undefined | null,
): Slot[] => {
  if (roomId === undefined) return []; // should not be here.

  // Init an empty slots.
  const slots: Slot[] = [];
  let curr = baseTime;
  while (isSameDay(baseTime, curr)) {
    slots.push({ slot: curr, avail: true });
    curr = addMinutes(curr, TIME_SLOT_INTERVAL);
  }

  // Disable slots in existing Bookings
  existingBookings[roomId].slots.forEach((slot) => {
    // We skip ourself.
    if (slot.id === bookingId) return;

    const bookingStart = new Date(slot.start);
    const bookingEnd = new Date(slot.end);

    const startIndex = Math.floor(differenceInMinutes(bookingStart, baseTime) / TIME_SLOT_INTERVAL);
    const endIndex = Math.ceil(differenceInMinutes(bookingEnd, baseTime) / TIME_SLOT_INTERVAL);

    // Change all slots between the startIndex and endIndex to unavailable.
    for (let i = startIndex; i < endIndex; i++) slots[i].avail = false;
  });

  // For endSlots, add TIME_SLOT_INTERVAL.
  if (filedType === 'end')
    slots.forEach((slot) => (slot.slot = addMinutes(slot.slot, TIME_SLOT_INTERVAL)));
  return slots;
};

const overlappingCheck = (start: string, end: string, endSlots: Slot[]): boolean => {
  let inRange: boolean = false;
  for (const slot of endSlots) {
    if (isEqual(new Date(start), slot.slot)) inRange = true;
    if (inRange) {
      if (!slot.avail) return false;
      if (isEqual(new Date(end), slot.slot)) return true;
    }
  }
  return true; // should not be here.
};

export { calculateSlots, initForm, overlappingCheck };
