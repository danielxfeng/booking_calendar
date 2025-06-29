/**
 * @file BookingFormUtils.tsx
 * @summary abstracted helper functions for Booking form for decoupling and unit testing.
 * @see BookingForm - @/components/BookingForm.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { add, isBefore, startOfDay } from 'date-fns';

import type { FormProp, FormType } from '@/components/BookingForm';
import type { Slot } from '@/components/ScrollSlotPicker';
import { TIME_SLOT_INTERVAL } from '@/config';

import type { CalGrid } from './calGrid';
import { ThrowInternalError } from './errorHandler';
import type { UpsertBooking } from './schema';

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

// todo
const initSlots = (
  booking: UpsertBooking | undefined,
  grid: CalGrid,
  filedType: 'start' | 'end',
  formType: FormType,
): Slot[] => {};

// todo
const timeSlotChangeHandler = (
  type: 'start' | 'end',
  value: string,
  setSlots: (slots: Slot[]) => void,
) => {
  if (type === 'start') {
    // todo
    console.log(value);
    setSlots([]);
  } else if (type === 'end')
    setSlots([]); // todo
  // should not be here.
  else ThrowInternalError('The type of Time Slot Selector should be either start or end.');
};

export { getFormType, initSlots, timeSlotChangeHandler };
