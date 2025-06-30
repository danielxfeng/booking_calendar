/**
 * @file BookingFormUtils.tsx
 * @summary abstracted helper functions for Booking form for decoupling and unit testing.
 * @see BookingForm - @/components/BookingForm.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { add, addMinutes, isBefore, isEqual, startOfDay } from 'date-fns';

import type { FormProp, FormType } from '@/components/BookingForm';
import type { Slot } from '@/components/ScrollSlotPicker';
import { TIME_SLOT_INTERVAL } from '@/config';
import type { CalGrid, Day } from '@/lib/calGrid';
import { ThrowInternalError } from '@/lib/errorHandler';

/**
 * @summary Returns an empty Slots
 */
const newEmptySlots = (start: string | undefined): Slot[] => {
  if (!start) return []; // to solve the type, should not be here.

  const baseDay = startOfDay(start);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptionsCount = 60 / TIME_SLOT_INTERVAL - 1; // -1 = - min_interval
  const minutesIdx = Array.from({ length: minuteOptionsCount }, (_, i) => i);
  const slots: Slot[] = [];
  for (const h of hours) {
    for (const mi of minutesIdx) {
      slots.push({
        slot: add(baseDay, { hours: h, minutes: mi * TIME_SLOT_INTERVAL }),
        avail: false,
      });
    }
  }
  return slots;
};

/**
 * @summary Returns form type
 * @description
 * - if there is no `editingId`, indicates the `insert`
 * - Then there should be an existing booking.
 *   - If the booking is expired, or the bookedBy is null, the type is `view`
 *   - Otherwise, it is `update`
 */
const getFormType = (formProp: FormProp, grid: CalGrid): FormType => {
  if (!formProp) return 'view'; // should not be here.

  // When there is no `editingId`
  if (formProp.editingId === null) return 'insert';

  const cell = grid[formProp.row][formProp.col];

  const currBooking = cell?.find((booking) => booking.id === formProp.editingId);
  if (!currBooking) {
    ThrowInternalError('cannot find the booking.'); // There should be a booking.
    return 'view'; // Should not be here.
  }

  // When the bookedBy is null.
  if (!currBooking.bookedBy) return 'view';

  // When the booking is expired.
  if (isBefore(new Date(currBooking.start), new Date())) return 'view';

  return 'update';
};

/**
 * @summary Calculate a slots.
 * @description
 * The idea is to iterate the bookings, if there is a existing booking, set the slot to unavailable.
 * The current booking is an exception.
 */
const calculateSlots = (
  formType: FormType,
  day: Day,
  filedType: 'start' | 'end',
  roomId: number | undefined,
  editId?: number | undefined | null,
  start?: string | undefined,
): Slot[] => {
  if (roomId === undefined || start === undefined) return []; // should not be here.

  // Init an empty slots.
  const slots = newEmptySlots(start);

  for (let i = 0; i < slots.length; i++) {
    const bookings = day[i] ?? [];
    let isTaken: boolean;

    // If there is a `view` form, all slots are disabled, except the current booking.
    if (formType === 'view') isTaken = bookings.some((b) => b.id !== editId);
    // Otherwise, all booked slots are disabled, except the current booking.
    else isTaken = bookings.some((b) => b.roomId === roomId && b.id !== editId);
    slots[i].avail = !isTaken;
  }

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
  ThrowInternalError('[overlappingCheck]: End slot not reached, error slot range.');
  return false; // should not be here.
};

export { calculateSlots, getFormType, overlappingCheck };
