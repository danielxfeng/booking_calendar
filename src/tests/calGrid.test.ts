import { parseISO } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { TIME_SLOT_INTERVAL } from '@/config';
import { calGridGenerator } from '@/lib/calGrid';
import type { Rooms } from '@/lib/schema';

const startDate = parseISO('2025-06-23');

describe('calGridGenerator', () => {
  it('should place one slot into correct cell', () => {
    const slotsRooms: Rooms = [
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
        ],
      },
    ];

    const grid = calGridGenerator(slotsRooms, startDate);

    expect(grid[40][2]?.[0].roomId).toBe(1);
    expect(grid[41][2]?.[0].roomId).toBe(1);
  });

  it('should place slots into correct cells', () => {
    const slotsRooms: Rooms = [
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
          {
            id: 2,
            start: '2025-06-25T10:30',
            end: '2025-06-25T10:45',
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
            start: '2025-06-25T10:00',
            end: '2025-06-25T10:15',
            bookedBy: 'Daniel',
          },
          {
            id: 4,
            start: '2025-06-26T12:00',
            end: '2025-06-26T14:15',
            bookedBy: null,
          },
        ],
      },
    ];

    const grid = calGridGenerator(slotsRooms, startDate);

    const timeIndex = (timeStr: string) => {
      const date = new Date(timeStr);
      return Math.floor((date.getHours() * 60 + date.getMinutes()) / TIME_SLOT_INTERVAL);
    };

    const dayIndex = (dateStr: string) =>
      Math.floor((new Date(dateStr).getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

    const idx1Start = timeIndex('2025-06-25T10:00');
    const idx1End = timeIndex('2025-06-25T10:30');
    for (let i = idx1Start; i < idx1End; i++) {
      const cell = grid[i][dayIndex('2025-06-25')];
      expect(cell).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 1, roomId: 1, roomName: 'a' })]),
      );
    }

    const idx3Start = timeIndex('2025-06-25T10:00');
    const idx3End = timeIndex('2025-06-25T10:15');
    for (let i = idx3Start; i < idx3End; i++) {
      const cell = grid[i][dayIndex('2025-06-25')];
      expect(cell).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 3, roomId: 2, roomName: 'b' })]),
      );
    }

    const idx4Start = timeIndex('2025-06-26T12:00');
    const idx4End = timeIndex('2025-06-26T14:15');
    for (let i = idx4Start; i < idx4End; i++) {
      const cell = grid[i][dayIndex('2025-06-26')];
      expect(cell).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: 4, bookedBy: null, roomId: 2 })]),
      );
    }

    const unexpectedCell = grid[timeIndex('2025-06-24T10:00')]?.[dayIndex('2025-06-24')];
    expect(unexpectedCell).toBeNull();
  });

  it('should throw if slot is before the start date', () => {
    const slotsRooms: Rooms = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 10,
            start: '2025-06-22T10:00',
            end: '2025-06-22T10:30',
            bookedBy: 'Daniel',
          },
        ],
      },
    ];

    expect(() => calGridGenerator(slotsRooms, startDate)).toThrowError(
      'The slot is outside the displayed week range.',
    );
  });

  it('should throw on duplicated slot ID in same cell', () => {
    const slotsRooms: Rooms = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 12,
            start: '2025-06-25T10:00',
            end: '2025-06-25T10:30',
            bookedBy: 'Daniel',
          },
          {
            id: 12,
            start: '2025-06-25T10:00',
            end: '2025-06-25T10:30',
            bookedBy: 'Daniel',
          },
        ],
      },
    ];

    expect(() => calGridGenerator(slotsRooms, startDate)).toThrowError(
      'The data from API is illegal: The slot id is not unique.',
    );
  });

  it('should throw on overlapping slots', () => {
    const slotsRooms: Rooms = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 13,
            start: '2025-06-25T10:00',
            end: '2025-06-25T10:30',
            bookedBy: 'Daniel',
          },
          {
            id: 14,
            start: '2025-06-25T10:15',
            end: '2025-06-25T10:45',
            bookedBy: 'Daniel',
          },
        ],
      },
    ];

    expect(() => calGridGenerator(slotsRooms, startDate)).toThrowError('Duplicate slot detected.');
  });

  it('should throw if there are duplicate room IDs', () => {
    const slotsRooms: Rooms = [
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

    expect(() => calGridGenerator(slotsRooms, startDate)).toThrowError('Duplicate room detected.');
  });
});
