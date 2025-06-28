/**
 * @file schema.ts
 * @summary Defines the Zod schemas and Types used for API request and response.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { differenceInDays, differenceInMinutes } from 'date-fns';
import * as z from 'zod/v4';

import { TIME_SLOT_INTERVAL } from '@/config';

const MIN_MEETING_MINUTES = 15;
const MAX_USERNAME_LENGTH = 100;

/**
 * @summary Returns if the time is valid
 */
const timeAdditionalCheck = (datetime: string): boolean => {
  const date = new Date(datetime);
  if (isNaN(date.getTime())) return false;
  return date.getMinutes() % TIME_SLOT_INTERVAL === 0;
};

/**
 * @summary Returns if the start time is in future.
 */
const laterThanNowCheck = (start: string): boolean => {
  return differenceInMinutes(new Date(start), new Date()) >= MIN_MEETING_MINUTES;
};

/**
 * @summary Returns if the meeting match the minimal length.
 */
const meetingLengthCheck = (start: string, end: string): boolean => {
  return differenceInMinutes(new Date(end), new Date(start)) >= MIN_MEETING_MINUTES;
};

/**
 * @summary Returns if the meeting is in the same day.
 */
const isSameDayCheck = (start: string, end: string): boolean => {
  return differenceInDays(new Date(end), new Date(start)) == 0;
};

/**
 * @summary A enhanced datetime.
 */
const dateTimeSchema = z.iso
  .datetime({ local: true, precision: -1 })
  .refine((val) => timeAdditionalCheck(val), {
    message: `Time must align to ${TIME_SLOT_INTERVAL}-minute slots.`,
  });

/**
 * @summary A booking from API
 */
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

/**
 * @summary The bookings for a room.
 */
const RoomSchema = z.object({
  roomId: z.int(),
  roomName: z.string().trim().min(1),
  bookings: BookingsFromApiSchema,
});

/**
 * @summary The array of bookings for rooms
 */
const RoomsSchema = z.array(RoomSchema);

/**
 * @summary The schema to validate a iso date
 */
const DateSchema = z.iso.date();

/**
 * @summary The form value of upsert a new booking
 */
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
