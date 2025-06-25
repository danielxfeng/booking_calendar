/**
 * @file slotSchemas.ts
 * @summary Defines the Zod schemas and Types used for Slot related data structures.
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
 * @summary A slot
 */
const SlotSchema = z
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

const SlotsSchema = z.array(SlotSchema);

/**
 * @summary The slots for a room.
 */
const SlotsARoomSchema = z.object({
  roomId: z.int(),
  roomName: z.string().trim().min(1),
  slots: SlotsSchema,
});

/**
 * @summary The array of slots for rooms
 */
const SlotsRoomsSchema = z.array(SlotsARoomSchema);

/**
 * @summary The schema to validate a iso date
 */
const DateSchema = z.iso.date();

/**
 * @summary The form value of upsert a new slot
 */
const UpsertSlotSchema = z
  .object({
    roomId: z.int(),
    start: dateTimeSchema,
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
  DateSchema,
  SlotsARoomSchema,
  SlotSchema,
  SlotsRoomsSchema,
  SlotsSchema,
  UpsertSlotSchema,
};

type Slot = z.infer<typeof SlotSchema>;
type Slots = z.infer<typeof SlotsSchema>;
type SlotsARoom = z.infer<typeof SlotsARoomSchema>;
type SlotsRooms = z.infer<typeof SlotsRoomsSchema>;
type UpsertSlot = z.infer<typeof UpsertSlotSchema>;

export type { Slot, Slots, SlotsARoom, SlotsRooms, UpsertSlot };
