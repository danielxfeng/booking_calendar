import { addDays, addHours, addMinutes, format, nextMonday, set } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';

import { TIME_SLOT_INTERVAL } from '@/config';
import {
  BookingFromApiSchema,
  DateSchema,
  EnhancedUpsertBookingSchemaFactory,
  RoomSchema,
  type UpsertBooking,
  UpsertBookingSchema,
} from '@/lib/schema';
import { formatToDateTime } from '@/lib/tools';
import type { WeekBookings } from '@/lib/weekBookings';

vi.mock('@/config', () => ({
  LONGEST_STUDENT_MEETING: 4,
  TIME_SLOT_INTERVAL: 30,
  OPEN_HOURS_IDX: [12, 42],
}));

describe('BookingSchema', () => {
  it('should pass for a valid booking with user', () => {
    const case1 = {
      id: 1,
      startTime: '2025-06-24T10:00:00',
      endTime: '2025-06-24T10:30:00',
      bookedBy: 'Daniel',
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(true);
  });

  it('should pass for a valid booking without a user', () => {
    const case1 = {
      id: 2,
      startTime: '2025-06-24T10:00:00',
      endTime: '2025-06-24T10:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(true);
  });

  it('should fail a too early booking', () => {
    const case1 = {
      id: 2,
      startTime: '2025-06-24T05:30:00',
      endTime: '2025-06-24T06:00:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail a too late booking', () => {
    const case1 = {
      id: 2,
      startTime: '2025-06-24T21:00:00',
      endTime: '2025-06-24T21:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  /**
  // These tests are currently disabled because 00:00 is outside of OPEN_HOURS.
  it('should pass for a booking that ends exactly at 00:00 but is same day logically (0:00-00:00)', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T00:00:00',
      end: '2025-06-25T00:00:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(true);
  });

  it('should pass for a booking that ends exactly at 00:00 but is same day logically (23:30-00:00)', () => {
    const case2 = {
      id: 2,
      start: '2025-06-24T23:30:00',
      end: '2025-06-25T00:00:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case2);
    expect(result.success).toBe(true);
  });
 

  it('should fail for a booking that ends at 00:30 (next day, invalid inter-day)', () => {
    const case3 = {
      id: 3,
      start: '2025-06-24T23:30:00',
      end: '2025-06-25T00:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case3);
    expect(result.success).toBe(false);
  });
   */

  it('should fail for a booking without a id', () => {
    const case1 = {
      startTime: '2025-06-24T10:00:00',
      endTime: '2025-06-24T10:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid id', () => {
    const case1 = {
      id: 'a',
      startTime: '2025-06-24T10:00:00',
      endTime: '2025-06-24T10:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a start', () => {
    const case1 = {
      id: 1,
      endTime: '2025-06-24T10:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid start(format)', () => {
    const case1 = {
      id: 1,
      startTime: '2025-06-24T10:00:00+09:00',
      endTime: '2025-06-24T10:30',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid start(invalid minute)', () => {
    const case1 = {
      id: 1,
      startTime: '2025-06-24T10:20:00',
      endTime: '2025-06-24T10:50:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a end', () => {
    const case1 = {
      id: 1,
      startTime: '2025-06-24T10:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid end(same as start)', () => {
    const case1 = {
      id: 1,
      startTime: '2025-06-24T10:30:00',
      endTime: '2025-06-24T10:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a user', () => {
    const case1 = {
      id: 1,
      startTime: '2025-06-24T10:30:00',
      endTime: '2025-06-24T10:30:00',
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid user(empty)', () => {
    const case1 = {
      id: 1,
      startTime: '2025-06-24T10:30:00',
      endTime: '2025-06-24T10:30:00',
      bookedBy: '   ',
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a inter day booking', () => {
    const case1 = {
      id: 1,
      startTime: '2025-06-24T10:30:00',
      endTime: '2025-06-25T10:30:00',
      bookedBy: '   ',
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });
});

describe('RoomSchema', () => {
  it('should pass for a valid booking with user', () => {
    const case1 = {
      roomId: 1,
      roomName: 'room',
      slots: [],
    };

    const result = RoomSchema.safeParse(case1);
    expect(result.success).toBe(true);
  });

  it('should fail for missing a roomId', () => {
    const case1 = {
      roomName: 'room',
      slots: [],
    };

    const result = RoomSchema.safeParse(case1);

    expect(result.success).toBe(false);
  });

  it('should fail for an invalid roomId', () => {
    const case1 = {
      roomId: 'a',
      roomName: 'room',
      slots: [],
    };

    const result = RoomSchema.safeParse(case1);

    expect(result.success).toBe(false);
  });

  it('should fail for missing a room name', () => {
    const case1 = {
      roomId: 'a',
      slots: [],
    };

    const result = RoomSchema.safeParse(case1);

    expect(result.success).toBe(false);
  });

  it('should fail for an invalid room name', () => {
    const case1 = {
      roomId: 'a',
      roomName: '',
      slots: [],
    };

    const result = RoomSchema.safeParse(case1);

    expect(result.success).toBe(false);
  });
});

describe('DateSchema', () => {
  it('should pass for a valid date', () => {
    const case1 = '2020-01-07';
    const result = DateSchema.safeParse(case1);
    expect(result.success).toBe(true);
  });

  it('should fail for a invalid date', () => {
    const case1 = '2025-06-24T10:30:00';
    const result = DateSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a null input', () => {
    const case1 = '2025-06-24T10:30:00';
    const result = DateSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });
});

describe('UpsertBookingSchema', () => {
  const safeStart = set(addDays(new Date(), 1), {
    hours: 10,
    minutes: 0,
    seconds: 0,
    milliseconds: 0,
  });

  it('passes with valid future booking on same day', () => {
    const start = safeStart;
    const end = addMinutes(start, TIME_SLOT_INTERVAL * 2);

    const result = UpsertBookingSchema.safeParse({
      roomId: 1,
      startTime: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(end, "yyyy-MM-dd'T'HH:mm:ss"),
    });

    expect(result.success).toBe(true);
  });

  it('allows past dates in UpsertBookingSchema (role-based check is in EnhancedFactory)', () => {
    const start = addDays(safeStart, -2); // past
    const end = addMinutes(start, 30);

    const result = UpsertBookingSchema.safeParse({
      roomId: 2,
      startTime: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(end, "yyyy-MM-dd'T'HH:mm:ss"),
    });

    expect(result.success).toBe(true);
  });

  it('fails if start and end are not on the same day', () => {
    const start = safeStart;
    const end = addDays(start, 1); // cross day

    const result = UpsertBookingSchema.safeParse({
      roomId: 4,
      startTime: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
      endTime: format(end, "yyyy-MM-dd'T'HH:mm:ss"),
      bookedBy: 'david',
    });

    expect(result.success).toBe(false);
  });

  // Does not test a lot since the start/end logic is tested in booking schema.
});

describe('EnhancedUpsertBookingSchemaFactory', () => {
  const user = { role: 'student' as const };

  it('passes with valid booking', () => {
    const bookings: WeekBookings = [
      {
        1: {
          roomId: 1,
          roomName: 'small',
          slots: [],
        },
      },
    ];

    const schema = EnhancedUpsertBookingSchemaFactory(user, bookings);
    const start = nextMonday(set(new Date(), { hours: 10, minutes: 0 }));
    const result = schema.safeParse({
      roomId: 1,
      startTime: formatToDateTime(start),
      endTime: formatToDateTime(addHours(start, 4)),
    });

    expect(result.success).toBe(true);
  });

  it('fails if the meeting is too long', () => {
    const bookings: WeekBookings = [
      {
        1: {
          roomId: 1,
          roomName: 'small',
          slots: [],
        },
      },
    ];

    const schema = EnhancedUpsertBookingSchemaFactory(user, bookings);
    const start = nextMonday(set(new Date(), { hours: 10, minutes: 0 }));
    const result = schema.safeParse({
      roomId: 1,
      startTime: formatToDateTime(start),
      endTime: formatToDateTime(addHours(start, 5)),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('max length');
  });

  it('passes with valid booking', () => {
    const start = nextMonday(set(new Date(), { hours: 10, minutes: 0 }));
    const end = addHours(start, 2);
    const booking: UpsertBooking = {
      roomId: 1,
      startTime: formatToDateTime(start),
      endTime: formatToDateTime(end),
    };

    const bookings: WeekBookings = [
      {
        1: {
          roomId: 1,
          roomName: 'small',
          slots: [
            {
              startTime: formatToDateTime(addHours(start, -1)),
              endTime: formatToDateTime(start),
              id: 1,
              bookedBy: null,
            },
            {
              startTime: formatToDateTime(end),
              endTime: formatToDateTime(addHours(end, 1)),
              id: 2,
              bookedBy: null,
            },
          ],
        },
      },
    ];

    const schema = EnhancedUpsertBookingSchemaFactory(user, bookings);
    const result = schema.safeParse(booking);
    expect(result.success).toBe(true);
  });

  it('fails when overlaps: cross start (09:30-10:30)', () => {
    const start = nextMonday(set(new Date(), { hours: 9, minutes: 30 }));
    const end = addHours(start, 1);

    const bookings: WeekBookings = [
      {
        1: {
          roomId: 1,
          roomName: 'small',
          slots: [
            {
              startTime: formatToDateTime(nextMonday(set(new Date(), { hours: 10, minutes: 0 }))),
              endTime: formatToDateTime(nextMonday(set(new Date(), { hours: 11, minutes: 30 }))),
              id: 1,
              bookedBy: null,
            },
          ],
        },
      },
    ];

    const schema = EnhancedUpsertBookingSchemaFactory(user, bookings);
    const result = schema.safeParse({
      roomId: 1,
      startTime: formatToDateTime(start),
      endTime: formatToDateTime(end),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('overlaps');
  });

  it('fails when overlaps: exact match (10:00-11:30)', () => {
    const start = nextMonday(set(new Date(), { hours: 10, minutes: 0 }));
    const end = nextMonday(set(new Date(), { hours: 11, minutes: 30 }));

    const bookings: WeekBookings = [
      {
        1: {
          roomId: 1,
          roomName: 'small',
          slots: [
            {
              startTime: formatToDateTime(start),
              endTime: formatToDateTime(end),
              id: 1,
              bookedBy: null,
            },
          ],
        },
      },
    ];

    const schema = EnhancedUpsertBookingSchemaFactory(user, bookings);
    const result = schema.safeParse({
      roomId: 1,
      startTime: formatToDateTime(start),
      endTime: formatToDateTime(end),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('overlaps');
  });

  it('fails when overlaps: inside (10:30-11:00)', () => {
    const baseStart = nextMonday(set(new Date(), { hours: 10, minutes: 0 }));
    const start = addHours(baseStart, 0.5);
    const end = addHours(start, 0.5);

    const bookings: WeekBookings = [
      {
        1: {
          roomId: 1,
          roomName: 'small',
          slots: [
            {
              startTime: formatToDateTime(baseStart),
              endTime: formatToDateTime(addHours(baseStart, 1.5)),
              id: 1,
              bookedBy: null,
            },
          ],
        },
      },
    ];

    const schema = EnhancedUpsertBookingSchemaFactory(user, bookings);
    const result = schema.safeParse({
      roomId: 1,
      startTime: formatToDateTime(start),
      endTime: formatToDateTime(end),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('overlaps');
  });

  it('fails when overlaps: cross end (11:00-12:00)', () => {
    const baseStart = nextMonday(set(new Date(), { hours: 10, minutes: 0 }));
    const start = addHours(baseStart, 1);
    const end = addHours(baseStart, 2);

    const bookings: WeekBookings = [
      {
        1: {
          roomId: 1,
          roomName: 'small',
          slots: [
            {
              startTime: formatToDateTime(baseStart),
              endTime: formatToDateTime(addHours(baseStart, 1.5)),
              id: 1,
              bookedBy: null,
            },
          ],
        },
      },
    ];

    const schema = EnhancedUpsertBookingSchemaFactory(user, bookings);
    const result = schema.safeParse({
      roomId: 1,
      startTime: formatToDateTime(start),
      endTime: formatToDateTime(end),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('overlaps');
  });

  it('fails for student booking in the past', () => {
    const student = { role: 'student' as const };
    const start = set(new Date('2026-03-02T00:00:00'), { hours: 10, minutes: 0 }); // fixed Monday in the past
    const end = addHours(start, 1);

    const bookings: WeekBookings = [
      {
        1: {
          roomId: 1,
          roomName: 'small',
          slots: [],
        },
      },
    ];

    const schema = EnhancedUpsertBookingSchemaFactory(student, bookings);
    const result = schema.safeParse({
      roomId: 1,
      startTime: formatToDateTime(start),
      endTime: formatToDateTime(end),
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toContain('Start time must be in future');
  });

  it('passes for staff booking in the past', () => {
    const staff = { role: 'staff' as const };
    const start = set(new Date('2026-03-02T00:00:00'), { hours: 10, minutes: 0 }); // fixed Monday in the past
    const end = addHours(start, 1);

    const bookings: WeekBookings = [
      {
        1: {
          roomId: 1,
          roomName: 'small',
          slots: [],
        },
      },
    ];

    const schema = EnhancedUpsertBookingSchemaFactory(staff, bookings);
    const result = schema.safeParse({
      roomId: 1,
      startTime: formatToDateTime(start),
      endTime: formatToDateTime(end),
    });

    expect(result.success).toBe(true);
  });

  it('passes for staff booking with very long duration', () => {
    const staff = { role: 'staff' as const };
    const start = nextMonday(set(new Date(), { hours: 10, minutes: 0 }));
    const end = addHours(start, 8); // 8 hours, exceeds student limit

    const bookings: WeekBookings = [
      {
        1: {
          roomId: 1,
          roomName: 'small',
          slots: [],
        },
      },
    ];

    const schema = EnhancedUpsertBookingSchemaFactory(staff, bookings);
    const result = schema.safeParse({
      roomId: 1,
      startTime: formatToDateTime(start),
      endTime: formatToDateTime(end),
    });

    expect(result.success).toBe(true);
  });
});
