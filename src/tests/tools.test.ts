import { format } from 'date-fns';
import { describe, expect, it } from 'vitest';

import {
  isoTimeApiToLocalTimeApi,
  localTimeUpsertToIsoTimeUpsert,
  newDate,
} from '@/lib/tools';

describe('newDate', () => {
  it('returns a Date object', () => {
    const date = newDate('2025-01-01');
    const strDate = format(date, "yyyy-MM-dd'T'HH:mm:ss");
    expect(strDate).toBe('2025-01-01T00:00:00');
  });
});

describe('booking timezone conversion', () => {
  it('converts winter bookings from API ISO to Helsinki wall time', () => {
    expect(
      isoTimeApiToLocalTimeApi({
        id: 1,
        start: '2025-01-15T08:00:00.000Z',
        end: '2025-01-15T09:00:00.000Z',
        bookedBy: 'user',
      }),
    ).toEqual({
      id: 1,
      start: '2025-01-15T10:00:00',
      end: '2025-01-15T11:00:00',
      bookedBy: 'user',
    });
  });

  it('converts summer bookings from API ISO to Helsinki wall time', () => {
    expect(
      isoTimeApiToLocalTimeApi({
        id: 1,
        start: '2025-07-15T07:00:00.000Z',
        end: '2025-07-15T08:00:00.000Z',
        bookedBy: 'user',
      }),
    ).toEqual({
      id: 1,
      start: '2025-07-15T10:00:00',
      end: '2025-07-15T11:00:00',
      bookedBy: 'user',
    });
  });

  it('converts winter Helsinki wall time to API ISO', () => {
    expect(
      localTimeUpsertToIsoTimeUpsert({
        roomId: 2,
        start: '2025-01-15T10:00:00',
        end: '2025-01-15T11:00:00',
      }),
    ).toEqual({
      roomId: 2,
      start: '2025-01-15T08:00:00Z',
      end: '2025-01-15T09:00:00Z',
    });
  });

  it('converts summer Helsinki wall time to API ISO', () => {
    expect(
      localTimeUpsertToIsoTimeUpsert({
        roomId: 2,
        start: '2025-07-15T10:00:00',
        end: '2025-07-15T11:00:00',
      }),
    ).toEqual({
      roomId: 2,
      start: '2025-07-15T07:00:00Z',
      end: '2025-07-15T08:00:00Z',
    });
  });

  it('keeps winter bookings stable in a non-Helsinki runtime timezone', () => {
    const localBooking = isoTimeApiToLocalTimeApi({
      id: 1,
      start: '2025-01-15T08:00:00.000Z',
      end: '2025-01-15T09:00:00.000Z',
      bookedBy: 'user',
    });

    expect(localTimeUpsertToIsoTimeUpsert({ ...localBooking, roomId: 2 })).toEqual({
      roomId: 2,
      start: '2025-01-15T08:00:00Z',
      end: '2025-01-15T09:00:00Z',
    });
  });
});
