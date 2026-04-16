import { describe, expect, it, vi } from 'vitest';

import type { RoomsIsoTime } from '@/lib/schema';
import { weekBookingsGenerator } from '@/lib/weekBookings';

const startDate = '2025-06-23';

vi.mock('@/config', () => ({
  BOOKING_TIME_ZONE: 'Europe/Helsinki',
  ROOM_MAP: [
    { id: 1, name: 'Big', color: 'bg-blue-300 border-blue-400' },
    { id: 2, name: 'Small', color: 'bg-blue-100 border-blue-200' },
  ],
  TIME_SLOT_INTERVAL: 30,
  OPEN_HOURS_IDX: [12, 42],
}));

describe('weekBookingsGenerator', () => {
  it('places a booking in the correct weekday column', () => {
    const rooms: RoomsIsoTime = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 1,
            start: '2025-06-25T07:00:00.000Z',
            end: '2025-06-25T07:30:00.000Z',
            bookedBy: 'Daniel',
          },
        ],
      },
    ];

    const grid = weekBookingsGenerator(rooms, startDate);
    expect(grid[2][1].slots[0].id).toBe(1);
  });

  it('places multiple rooms across multiple days correctly, with adjacent slots', () => {
    const rooms: RoomsIsoTime = [
      {
        roomId: 1,
        roomName: 'Alpha',
        slots: [
          {
            id: 101,
            start: '2025-06-24T07:00:00.000Z',
            end: '2025-06-24T07:30:00.000Z',
            bookedBy: 'Alice',
          },
          {
            id: 102,
            start: '2025-06-24T07:30:00.000Z',
            end: '2025-06-24T08:00:00.000Z',
            bookedBy: 'Alice',
          },
          {
            id: 103,
            start: '2025-06-25T06:00:00.000Z',
            end: '2025-06-25T06:30:00.000Z',
            bookedBy: 'Alice',
          },
        ],
      },
      {
        roomId: 2,
        roomName: 'Beta',
        slots: [
          {
            id: 200,
            start: '2025-06-25T06:00:00.000Z',
            end: '2025-06-25T06:30:00.000Z',
            bookedBy: 'Alice',
          },
          {
            id: 201,
            start: '2025-06-26T11:00:00.000Z',
            end: '2025-06-26T11:30:00.000Z',
            bookedBy: 'Bob',
          },
          {
            id: 202,
            start: '2025-06-26T11:30:00.000Z',
            end: '2025-06-26T12:00:00.000Z',
            bookedBy: 'Bob',
          },
        ],
      },
    ];

    const grid = weekBookingsGenerator(rooms, startDate);

    const allIds = new Set<number>();
    grid.forEach((day) => {
      Object.values(day).forEach((room) => {
        room.slots.forEach((slot) => {
          allIds.add(slot.id);
          expect(slot.start.endsWith(':00')).toBe(true);
        });
      });
    });

    expect(allIds).toEqual(new Set([101, 102, 103, 200, 201, 202]));

    expect(grid[1][1].slots.map((s) => s.id)).toEqual([101, 102]); // 06-24, room 1
    expect(grid[2][1].slots.map((s) => s.id)).toEqual([103]); // 06-25, room 1
    expect(grid[3][2].slots.map((s) => s.id)).toEqual([201, 202]); // 06-26, room 2
    expect(grid[2][2].slots.map((s) => s.id)).toContain(200); // 06-25, room 2
  });

  it('filters out rooms not in ROOM_MAP', () => {
    const rooms: RoomsIsoTime = [
      {
        roomId: 999,
        roomName: 'ghost room',
        slots: [
          {
            id: 1,
            start: '2025-06-25T07:00:00.000Z',
            end: '2025-06-25T07:30:00.000Z',
            bookedBy: 'Ghost',
          },
        ],
      },
    ];

    const grid = weekBookingsGenerator(rooms, startDate);
    expect(grid.every((day) => Object.keys(day).length === 0)).toBe(true);
  });

  it('filters out slots out of range (too early or too late)', () => {
    const rooms: RoomsIsoTime = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 1,
            start: '2025-06-20T07:00:00.000Z',
            end: '2025-06-20T07:30:00.000Z',
            bookedBy: 'X',
          },
          {
            id: 2,
            start: '2025-06-30T07:00:00.000Z',
            end: '2025-06-30T07:30:00.000Z',
            bookedBy: 'Y',
          },
        ],
      },
    ];

    const grid = weekBookingsGenerator(rooms, startDate);
    expect(grid.every((day) => Object.keys(day).length === 0)).toBe(true);
  });

  it('throws error on duplicate slot IDs', () => {
    const rooms: RoomsIsoTime = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 1,
            start: '2025-06-25T07:00:00.000Z',
            end: '2025-06-25T07:30:00.000Z',
            bookedBy: 'D1',
          },
          {
            id: 1,
            start: '2025-06-25T08:00:00.000Z',
            end: '2025-06-25T08:30:00.000Z',
            bookedBy: 'D2',
          },
        ],
      },
    ];

    expect(() => weekBookingsGenerator(rooms, startDate)).toThrow(
      '[weekBookingsGenerator]: Duplicated slot id was found.',
    );
  });

  it('throws error on overlapping bookings within the same room/day', () => {
    const rooms: RoomsIsoTime = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 1,
            start: '2025-06-25T07:00:00.000Z',
            end: '2025-06-25T07:30:00.000Z',
            bookedBy: 'D1',
          },
          {
            id: 2,
            start: '2025-06-25T07:00:00.000Z',
            end: '2025-06-25T08:00:00.000Z',
            bookedBy: 'D2',
          },
        ],
      },
    ];

    expect(() => weekBookingsGenerator(rooms, startDate)).toThrow(
      '[weekBookingsGenerator]: Overlapping slots are found.',
    );
  });

  it('accepts legal adjacent bookings without overlap', () => {
    const rooms: RoomsIsoTime = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 1,
            start: '2025-06-25T07:00:00.000Z',
            end: '2025-06-25T07:30:00.000Z',
            bookedBy: 'X',
          },
          {
            id: 2,
            start: '2025-06-25T07:30:00.000Z',
            end: '2025-06-25T08:00:00.000Z',
            bookedBy: 'Y',
          },
        ],
      },
    ];

    const grid = weekBookingsGenerator(rooms, startDate);
    expect(grid[2][1].slots).toHaveLength(2);
  });
});
