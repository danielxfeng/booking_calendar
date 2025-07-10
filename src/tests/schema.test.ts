import { addDays, addMinutes, format, set } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { TIME_SLOT_INTERVAL } from '@/config';
import { BookingFromApiSchema, DateSchema, RoomSchema, UpsertBookingSchema } from '@/lib/schema';

describe('BookingSchema', () => {
  it('should pass for a valid booking with user', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:00:00',
      end: '2025-06-24T10:30:00',
      bookedBy: 'Daniel',
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(true);
  });

  it('should pass for a valid booking without a user', () => {
    const case1 = {
      id: 2,
      start: '2025-06-24T10:00:00',
      end: '2025-06-24T10:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(true);
  });

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

  it('should fail for a booking without a id', () => {
    const case1 = {
      start: '2025-06-24T10:00:00',
      end: '2025-06-24T10:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid id', () => {
    const case1 = {
      id: 'a',
      start: '2025-06-24T10:00:00',
      end: '2025-06-24T10:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a start', () => {
    const case1 = {
      id: 1,
      end: '2025-06-24T10:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid start(format)', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:00:00Z',
      end: '2025-06-24T10:30',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid start(invalid minute)', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:20:00',
      end: '2025-06-24T10:50:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a end', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid end(same as start)', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:30:00',
      end: '2025-06-24T10:30:00',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a user', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:30:00',
      end: '2025-06-24T10:30:00',
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid user(empty)', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:30:00',
      end: '2025-06-24T10:30:00',
      bookedBy: '   ',
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a inter day booking', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:30:00',
      end: '2025-06-25T10:30:00',
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
      start: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
      end: format(end, "yyyy-MM-dd'T'HH:mm:ss"),
    });

    expect(result.success).toBe(true);
  });

  it('fails if start is in the past', () => {
    const start = addDays(safeStart, -2); // past
    const end = addMinutes(start, 30);

    const result = UpsertBookingSchema.safeParse({
      roomId: 2,
      start: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
      end: format(end, "yyyy-MM-dd'T'HH:mm:ss"),
      bookedBy: 'bob',
    });

    expect(result.success).toBe(false);
  });

  it('fails if start and end are not on the same day', () => {
    const start = safeStart;
    const end = addDays(start, 1); // cross day

    const result = UpsertBookingSchema.safeParse({
      roomId: 4,
      start: format(start, "yyyy-MM-dd'T'HH:mm:ss"),
      end: format(end, "yyyy-MM-dd'T'HH:mm:ss"),
      bookedBy: 'david',
    });

    expect(result.success).toBe(false);
  });

  // Does not test a lot since the start/end logic is tested in booking schema.
});
