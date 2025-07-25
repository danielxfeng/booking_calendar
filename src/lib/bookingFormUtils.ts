/**
 * @file BookingFormUtils.tsx
 * @summary abstracted helper functions for Booking form for decoupling and unit testing.
 * @see BookingForm - @/components/BookingForm.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { AxiosError } from 'axios';
import { addMinutes, differenceInMinutes, isAfter, isBefore, isEqual } from 'date-fns';

import type { Slot } from '@/components/bookingForm/ScrollSlotPicker';
import { LONGEST_STUDENT_MEETING, OPEN_HOURS_IDX, TIME_SLOT_INTERVAL } from '@/config';
import { ThrowInternalError } from '@/lib/errorHandler';
import type { FormProp, FormType } from '@/lib/hooks/useBookingForm';
import type { DayBookings } from '@/lib/weekBookings';

import type { BookingFromApi, UpsertBooking } from './schema';
import { formatToDateTime } from './tools';

const initForm = (
  formProp: Exclude<FormProp, null>,
  currBooking?: BookingFromApi,
  currRoomId?: number,
): [FormType, UpsertBooking] => {
  if (!currBooking) {
    // `insert`
    const formType = 'insert';

    return [
      formType,
      {
        roomId: formProp.roomId,
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
    const formType =
      currBooking.bookedBy !== null && isAfter(formProp.startTime, new Date()) ? 'update' : 'view';
    return [formType, { start: currBooking.start, end: currBooking.end, roomId: currRoomId }];
  }
};

const calculateSlots = (
  existingBookings: DayBookings,
  filedType: 'start' | 'end',
  roomId: number | undefined,
  baseTime: Date,
  bookingId?: number | undefined | null,
): Slot[] => {
  if (roomId === undefined) return []; // should not be here.

  const slots: Slot[] = [];

  // Generate slot start times based on openHours.
  // For example: openHours = ["06:00", "21:00"] and TIME_SLOT_INTERVAL = 30, the last startTime should be 20:30
  const firstSlot = addMinutes(baseTime, OPEN_HOURS_IDX[0] * TIME_SLOT_INTERVAL);
  let curr = firstSlot;
  const end = addMinutes(baseTime, OPEN_HOURS_IDX[1] * TIME_SLOT_INTERVAL);
  while (isBefore(curr, end)) {
    slots.push({ slot: curr, avail: true });
    curr = addMinutes(curr, TIME_SLOT_INTERVAL);
  }

  if (existingBookings[roomId]) {
    existingBookings[roomId].slots.forEach((slot) => {
      // We skip ourself.
      if (slot.id === bookingId) return;

      const bookingStart = new Date(slot.start);
      const bookingEnd = new Date(slot.end);

      const startIndex = Math.floor(
        differenceInMinutes(bookingStart, firstSlot) / TIME_SLOT_INTERVAL,
      );
      const endIndex = Math.ceil(differenceInMinutes(bookingEnd, firstSlot) / TIME_SLOT_INTERVAL);

      for (let i = startIndex; i < endIndex; i++) slots[i].avail = false;
    });
  }

  // For endSlots, add TIME_SLOT_INTERVAL.
  if (filedType === 'end')
    slots.forEach((slot) => (slot.slot = addMinutes(slot.slot, TIME_SLOT_INTERVAL)));
  return slots;
};

const overlappingCheck = (start: string, end: string, endSlots: Slot[]): boolean => {
  let inRange: boolean = false;
  for (const slot of endSlots) {
    if (isEqual(new Date(start), addMinutes(slot.slot, -TIME_SLOT_INTERVAL))) inRange = true;

    if (inRange) {
      if (!slot.avail) return false;
      if (isEqual(new Date(end), slot.slot)) return true;
    }
  }
  return true; // should not be here.
};

const parseErrorMsg = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message ?? 'Server responded with an error.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred.';
};

const bookingLengthCheck = (
  start: string,
  end: string,
  role: 'student' | 'staff' | null | undefined,
): boolean => {
  if (role === 'staff') return true;
  return differenceInMinutes(new Date(end), new Date(start)) <= LONGEST_STUDENT_MEETING * 60;
};

export { bookingLengthCheck, calculateSlots, initForm, overlappingCheck, parseErrorMsg };
