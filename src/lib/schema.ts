/**
 * @file schema.ts
 * @summary Defines the Zod schemas and Types used for API request and response.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { addMilliseconds, differenceInMinutes, isSameDay } from 'date-fns';
import * as z from 'zod/v4';

import { OPEN_HOURS_IDX, TIME_SLOT_INTERVAL } from '@/config';

const MIN_MEETING_MINUTES = 15;
const MAX_USERNAME_LENGTH = 100;

const isSlotTimeWithinOpenHours = (datetime: string): boolean => {
  const date = new Date(datetime);
  if (isNaN(date.getTime())) return false;

  const minutes = date.getHours() * 60 + date.getMinutes();
  if (minutes % TIME_SLOT_INTERVAL !== 0) return false; // Align with TIME_SLOT_INTERVAL
  const slotIdx = minutes / TIME_SLOT_INTERVAL;
  return slotIdx >= OPEN_HOURS_IDX[0] && slotIdx <= OPEN_HOURS_IDX[1]; // Within OpenHours.
};

const laterThanNowCheck = (start: string): boolean => {
  return differenceInMinutes(new Date(start), new Date()) >= MIN_MEETING_MINUTES;
};

const meetingLengthCheck = (start: string, end: string): boolean => {
  return differenceInMinutes(new Date(end), new Date(start)) >= MIN_MEETING_MINUTES;
};

const isSameDayCheck = (start: string, end: string): boolean => {
  let endTime = new Date(end);

  // There is a corner case that the end time is at 0:00 of next day.
  if (endTime.getHours() === 0 && endTime.getMinutes() === 0)
    endTime = addMilliseconds(endTime, -1);

  return isSameDay(new Date(start), endTime);
};

const dateTimeSchema = z.iso
  .datetime({ local: true })
  .refine((val) => isSlotTimeWithinOpenHours(val), {
    message: `Time must align to ${TIME_SLOT_INTERVAL}-minute slots, and within open hours.`,
  });

const BookingFromApiSchema = z
  .object({
    id: z.int().positive(),
    start: dateTimeSchema,
    end: dateTimeSchema,
    bookedBy: z.string().trim().min(1).max(MAX_USERNAME_LENGTH).nullable(),
  })
  .strict()
  .refine((data) => meetingLengthCheck(data.start, data.end), {
    message: `End time must be at least ${MIN_MEETING_MINUTES} minutes after start time.`,
    path: ['end'],
  })
  .refine((data) => isSameDayCheck(data.start, data.end), {
    message: 'No inter day booking is allowed',
    path: ['start', 'end'],
  });

const BookingsFromApiSchema = z.array(BookingFromApiSchema);

const RoomSchema = z.object({
  roomId: z.int(),
  roomName: z.string().trim().min(1),
  slots: BookingsFromApiSchema,
});

const RoomsSchema = z.array(RoomSchema);

const DateSchema = z.iso.date();

const UpsertBookingSchema = z
  .object({
    roomId: z.int(),
    start: dateTimeSchema.refine((value) => laterThanNowCheck(value), {
      message: 'Start time must be in future',
      path: ['start'],
    }),
    end: dateTimeSchema,
  })
  .strict()
  .refine((data) => meetingLengthCheck(data.start, data.end), {
    message: `End time must be at least ${MIN_MEETING_MINUTES} minutes after start time.`,
    path: ['end'],
  })
  .refine((data) => isSameDayCheck(data.start, data.end), {
    message: 'No inter day booking is allowed',
    path: ['start', 'end'],
  });

export {
  BookingFromApiSchema,
  BookingsFromApiSchema,
  DateSchema,
  RoomSchema,
  RoomsSchema,
  UpsertBookingSchema,
};

type BookingFromApi = z.infer<typeof BookingFromApiSchema>;
type BookingsFromApi = z.infer<typeof BookingsFromApiSchema>;
type Room = z.infer<typeof RoomSchema>;
type Rooms = z.infer<typeof RoomsSchema>;
type UpsertBooking = z.infer<typeof UpsertBookingSchema>;

export type { BookingFromApi, BookingsFromApi, Room, Rooms, UpsertBooking };
