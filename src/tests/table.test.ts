import { parseISO } from 'date-fns';
import { describe, expect, it } from 'vitest';

import type { SlotsRooms } from '@/lib/schema';
import { tableGenerator } from '@/lib/table';

const startDate = parseISO('2025-06-23');

describe('TableGenerator', () => {
  it('should place one slot into correct cell', () => {
    const slotsRooms: SlotsRooms = [
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

    const table = tableGenerator(slotsRooms, startDate);

    expect(table[40][2].slots?.[1]).not.toBe(null);
    expect(table[41][2].slots?.[1]).not.toBe(null);
  });

  it('should place slots into correct cells', () => {
    const slotsRooms: SlotsRooms = [
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

    const table = tableGenerator(slotsRooms, startDate);

    expect(table[40][2].slots?.[1]).not.toBe(null);
    expect(table[41][2].slots?.[1]).not.toBe(null);

    expect(table[42][2].slots?.[2]).not.toBe(null);

    expect(table[40][2].slots?.[3]).not.toBe(null);

    for (let i = 48; i <= 56; i++) {
      expect(table[i][3].slots?.[4]).not.toBe(null);
    }

    const cell = table[40][2];
    const slotIds = Object.values(cell.slots).map((s) => s.id);
    expect(slotIds).toContain(1);
    expect(slotIds).toContain(3);
  });

  it('should throw if slot is before the start date', () => {
    const slotsRooms: SlotsRooms = [
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

    expect(() => tableGenerator(slotsRooms, startDate)).toThrowError(
      'The slot is outside the displayed week range.',
    );
  });

  it('should throw if slot is after the 7-day range', () => {
    const slotsRooms: SlotsRooms = [
      {
        roomId: 1,
        roomName: 'a',
        slots: [
          {
            id: 11,
            start: '2025-06-30T10:00',
            end: '2025-06-30T10:30',
            bookedBy: 'Daniel',
          },
        ],
      },
    ];

    expect(() => tableGenerator(slotsRooms, startDate)).toThrowError(
      'The slot is outside the displayed week range.',
    );
  });

  it('should throw on duplicated slot ID in same cell', () => {
    const slotsRooms: SlotsRooms = [
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

    expect(() => tableGenerator(slotsRooms, startDate)).toThrowError(
      'The data from API is illegal: The slot id is not unique.',
    );
  });

  it('should throw on overlapping slots', () => {
    const slotsRooms: SlotsRooms = [
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

    expect(() => tableGenerator(slotsRooms, startDate)).toThrowError('Duplicate slot detected.');
  });

  it('should throw if there are duplicate room IDs', () => {
    const slotsRooms: SlotsRooms = [
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

    expect(() => tableGenerator(slotsRooms, startDate)).toThrowError('Duplicate room detected.');
  });
});
