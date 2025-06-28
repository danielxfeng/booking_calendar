import { describe, expect, it } from 'vitest';

import { BookingFromApiSchema, DateSchema, RoomSchema, UpsertBookingSchema } from '@/lib/schema';

describe('BookingSchema', () => {
  it('should pass for a valid booking with user', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:00',
      end: '2025-06-24T10:15',
      bookedBy: 'Daniel',
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(true);
  });

  it('should pass for a valid booking without a user', () => {
    const case1 = {
      id: 2,
      start: '2025-06-24T10:00',
      end: '2025-06-24T10:30',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(true);
  });

  it('should fail for a booking without a id', () => {
    const case1 = {
      start: '2025-06-24T10:00',
      end: '2025-06-24T10:30',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid id', () => {
    const case1 = {
      id: 'a',
      start: '2025-06-24T10:00',
      end: '2025-06-24T10:30',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a start', () => {
    const case1 = {
      id: 1,
      end: '2025-06-24T10:30',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid start(format)', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:00:00',
      end: '2025-06-24T10:30',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid start(invalid minute)', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:20',
      end: '2025-06-24T10:45',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a end', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:15',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid end(same as start)', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:15',
      end: '2025-06-24T10:15',
      bookedBy: null,
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a user', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:15',
      end: '2025-06-24T10:15',
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a booking without a valid user(empty)', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:15',
      end: '2025-06-24T10:15',
      bookedBy: '   ',
    };

    const result = BookingFromApiSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a inter day booking', () => {
    const case1 = {
      id: 1,
      start: '2025-06-24T10:15',
      end: '2025-06-25T10:45',
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
      bookings: [],
    };

    const result = RoomSchema.safeParse(case1);
    if (result.error)
        console.log(JSON.stringify(result.error));
    expect(result.success).toBe(true);
  });

  it('should fail for missing a roomId', () => {
    const case1 = {
      roomName: 'room',
      bookings: [],
    };

    const result = RoomSchema.safeParse(case1);

    expect(result.success).toBe(false);
  });

  it('should fail for an invalid roomId', () => {
    const case1 = {
      roomId: 'a',
      roomName: 'room',
      bookings: [],
    };

    const result = RoomSchema.safeParse(case1);

    expect(result.success).toBe(false);
  });

  it('should fail for missing a room name', () => {
    const case1 = {
      roomId: 'a',
      bookings: [],
    };

    const result = RoomSchema.safeParse(case1);

    expect(result.success).toBe(false);
  });

  it('should fail for an invalid room name', () => {
    const case1 = {
      roomId: 'a',
      roomName: '',
      bookings: [],
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
    const case1 = '2025-06-24T10:15';
    const result = DateSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });

  it('should fail for a null input', () => {
    const case1 = '2025-06-24T10:15';
    const result = DateSchema.safeParse(case1);
    expect(result.success).toBe(false);
  });
});

describe('UpsertBookingSchema', () => {
  it('should pass a valid upsert query', () => {
    const case1 = { roomId: 1, start: '2025-06-24T10:00', end: '2025-06-24T10:30' };

    const result = UpsertBookingSchema.safeParse(case1);
    expect(result.success).toBe(true);
  });

  // Does not test a lot since the start/end logic is tested in booking schema.
});
