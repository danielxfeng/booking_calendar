/**
 * @file table.ts
 * @summary Defines the structure and metadata for a calendar table view.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */
import { differenceInCalendarDays, getHours, getMinutes } from 'date-fns';

import { NUMBERS_OF_ROOMS, TIME_SLOT_INTERVAL } from '@/config';
import type { Slot, SlotsRooms } from '@/lib/schema';

import { ThrowInvalidIncomingDataErr } from './errorHandler';

/**
 * @summary A cell in the calendar grid view.
 * @description
 * Each cell corresponds to a 15-minute block on a specific day.
 * - dayIndex: Index of the day in the week (Monday = 0, ..., Sunday = 6)
 * - timeIndex: Index of the time slot in the day (00:00 = 0, 00:15 = 1, ..., 23:45 = 95)
 * - slots: The slot data this cell belongs to, { roomId: Slot }
 */
type Cell = {
  dayIndex: number; // Monday is 0, Tuesday is 1 ...
  timeIndex: number; // 0:00 is 0, 0:15 is 1 ...
  slots: Record<number, Slot>;
};

/**
 * @summary A calendar grid composed of Cells.
 */
type Table = Cell[][];

// Returns a new empty table.
const newTable = () => {
  const table: Table = [];

  const rows = (24 * 60) / TIME_SLOT_INTERVAL;
  for (let i = 0; i < rows; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < 7; j++) {
      row.push({ dayIndex: j, timeIndex: i, slots: {} });
    }
    table.push(row);
  }

  return table;
};

/**
 * @summary Generate a calendar table view from given slotsRooms
 * @param slotsRooms the array of slots for all rooms.
 * @param startDate the start date of calendar table.
 * @returns a table view.
 */
const TableGenerator = (slotsRooms: SlotsRooms, startDate: Date): Table => {
  const table: Table = newTable();

  // The length of the array.
  if (slotsRooms.length > NUMBERS_OF_ROOMS)
    ThrowInvalidIncomingDataErr('Too many meeting rooms in slots.');

  const roomSet = new Set();
  const idSet = new Set();

  // iterator all slots
  for (const slotARoom of slotsRooms) {
    // Prevent duplicated room
    if (roomSet.has(slotARoom.roomId)) ThrowInvalidIncomingDataErr('Duplicate room detected.');
    roomSet.add(slotARoom.roomId);

    for (const slot of slotARoom.slots) {
      const dayIndex = differenceInCalendarDays(slot.start, startDate);

      // Validate the date
      if (dayIndex < 0 || dayIndex > 6)
        ThrowInvalidIncomingDataErr('The slot is outside the displayed week range.');

      // Find all related cells, also we have checked that end > start in schema.
      const timeIndexStart = Math.floor(
        (getHours(slot.start) * 60 + getMinutes(slot.start)) / TIME_SLOT_INTERVAL,
      );
      const timeIndexEnd = Math.floor(
        (getHours(slot.end) * 60 + getMinutes(slot.end)) / TIME_SLOT_INTERVAL,
      );

      // Prevent duplicated slot id.
      if (idSet.has(slot.id)) ThrowInvalidIncomingDataErr('The slot id is not unique.');

      idSet.add(slot.id);

      // Assign slot to these cells.
      for (let timeIndex = timeIndexStart; timeIndex < timeIndexEnd; timeIndex++) {
        const cell = table[timeIndex]?.[dayIndex];
        if (!cell) ThrowInvalidIncomingDataErr('Slot time is invalid.');

        // Check overlapping.
        if (cell.slots[slotARoom.roomId]) ThrowInvalidIncomingDataErr('Duplicate slot detected.');

        // Insert or append.
        cell.slots[slotARoom.roomId] = slot;
      }
    }
  }

  return table;
};

export { TableGenerator };

export type { Cell, Table };
