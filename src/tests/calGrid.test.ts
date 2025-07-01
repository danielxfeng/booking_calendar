import { parseISO } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { TIME_SLOT_INTERVAL } from '@/config';
import { calGridGenerator } from '@/lib/calGrid';
import type { Rooms } from '@/lib/schema';

const startDate = parseISO('2025-06-23');

describe('calGridGenerator', () => {
  it('should place one booking into correct cell', () => {
    const rooms: Rooms = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 1,
            start: '2025-06-25T10:00',
            end: '2025-06-25T10:30',
            bookedBy: 'Daniel',
          },
        ],
      },
    ];

    const grid = calGridGenerator(rooms, startDate);

    expect(grid[2][40]?.[0].roomId).toBe(1);
    expect(grid[2][41]?.[0].roomId).toBe(1);
  });

  it('should place bookings into correct cells', () => {
    const rooms: Rooms = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 1,
            start: '2025-06-25T10:00:00',
            end: '2025-06-25T10:30:00',
            bookedBy: 'Daniel',
          },
          {
            id: 2,
            start: '2025-06-25T10:30:00',
            end: '2025-06-25T10:45:00',
            bookedBy: 'Daniel',
          },
        ],
      },
      {
        roomId: 2,
        roomName: 'b',
        slots: [
          {
            id: 3,
            start: '2025-06-25T10:00:00',
            end: '2025-06-25T10:15:00',
            bookedBy: 'Daniel',
          },
          {
            id: 4,
            start: '2025-06-26T12:00:00',
            end: '2025-06-26T14:15:00',
            bookedBy: null,
          },
        ],
      },
    ];

    const grid = calGridGenerator(rooms, startDate);

    const timeIndex = (timeStr: string) => {
      const date = new Date(timeStr);
      return Math.floor((date.getHours() * 60 + date.getMinutes()) / TIME_SLOT_INTERVAL);
    };

    const dayIndex = (dateStr: string) =>
      Math.floor((new Date(dateStr).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const idx1Start = timeIndex('2025-06-25T10:00:00');
    const idx1End = timeIndex('2025-06-25T10:30:00');
    for (let i = idx1Start; i < idx1End; i++) {
      const cell = grid[dayIndex('2025-06-25')][i];
      expect(cell).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 1, roomId: 1, roomName: 'a' })]),
      );
    }

    const idx3Start = timeIndex('2025-06-25T10:00:00');
    const idx3End = timeIndex('2025-06-25T10:15:00');
    for (let i = idx3Start; i < idx3End; i++) {
      const cell = grid[dayIndex('2025-06-25')][i];
      expect(cell).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 3, roomId: 2, roomName: 'b' })]),
      );
    }

    const idx4Start = timeIndex('2025-06-26T12:00:00');
    const idx4End = timeIndex('2025-06-26T14:15:00');
    for (let i = idx4Start; i < idx4End; i++) {
      const cell = grid[dayIndex('2025-06-26')][i];
      expect(cell).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 4, bookedBy: null, roomId: 2 })]),
      );
    }

    const unexpectedCell = grid[dayIndex('2025-06-24')]?.[timeIndex('2025-06-24T10:00:00')];
    expect(unexpectedCell).toBeNull();
  });

  it('should throw if slot is before the start date', () => {
    const rooms: Rooms = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 10,
            start: '2025-06-22T10:00:00',
            end: '2025-06-22T10:30:00',
            bookedBy: 'Daniel',
          },
        ],
      },
    ];

    expect(() => calGridGenerator(rooms, startDate)).toThrowError(
      'The booking is outside the displayed week range.',
    );
  });

  it('should throw on duplicated slot ID in same cell', () => {
    const rooms: Rooms = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 12,
            start: '2025-06-25T10:00:00',
            end: '2025-06-25T10:30:00',
            bookedBy: 'Daniel',
          },
          {
            id: 12,
            start: '2025-06-25T10:00:00',
            end: '2025-06-25T10:30:00',
            bookedBy: 'Daniel',
          },
        ],
      },
    ];

    expect(() => calGridGenerator(rooms, startDate)).toThrowError(
      'The data from API is illegal: The booking id is not unique.',
    );
  });

  it('should throw on overlapping bookings', () => {
    const rooms: Rooms = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 13,
            start: '2025-06-25T10:00:00',
            end: '2025-06-25T10:30:00',
            bookedBy: 'Daniel',
          },
          {
            id: 14,
            start: '2025-06-25T10:15:00',
            end: '2025-06-25T10:45:00',
            bookedBy: 'Daniel',
          },
        ],
      },
    ];

    expect(() => calGridGenerator(rooms, startDate)).toThrowError('Duplicate booking detected.');
  });

  it('should throw if there are duplicate room IDs', () => {
    const rooms: Rooms = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [],
      },
      {
        roomId: 1,
        roomName: 'a',
        slots: [],
      },
    ];

    expect(() => calGridGenerator(rooms, startDate)).toThrowError('Duplicate room detected.');
  });
});
