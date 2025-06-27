/**
 * @file calGrid.ts
 * @summary Main data structure of the app: a 2D matrix of time slots for the weekly calendar view.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */
import { differenceInCalendarDays, getHours, getMinutes } from 'date-fns';

import { NUMBERS_OF_ROOMS, TIME_SLOT_INTERVAL } from '@/config';
import type { Rooms, SlotFromApi } from '@/lib/schema';

import { ThrowInvalidIncomingDataErr } from './errorHandler';

/**
 * @summary A slot in the calendar grid view.
 * @description
 * A booking slot used for the calendar grid view.
 * roomId and roomName are added to the CellSlot.
 */
type Slot = {
  roomId: number;
  roomName: string;
} & SlotFromApi;

/**
 * @summary A cell, may contains an array of slots, or null.
 */
type Cell = Slot[] | null;

/**
 * @summary 2D matrix of time slots for the weekly calendar view.
 */
type CalGrid = Cell[][];

// Returns a new empty Calendar Grid.
const newCalGrid = (): CalGrid =>
  Array.from({ length: (24 * 60) / TIME_SLOT_INTERVAL }, () => Array(7).fill(null));

/**
 * @summary Generate a calendar grid from given rooms
 *
 * @param rooms the array of slotsAndRooms.
 * @param startDate the start date of calendar table.
 * @returns a table view.
 */
const calGridGenerator = (rooms: Rooms, startDate: Date): CalGrid => {
  const grid: CalGrid = newCalGrid();

  // The length of the array.
  if (rooms.length > NUMBERS_OF_ROOMS)
    ThrowInvalidIncomingDataErr('Too many meeting rooms in slots.');

  const roomSet = new Set();
  const idSet = new Set();

  // iterator all slots
  for (const room of rooms) {
    // Prevent duplicated room
    if (roomSet.has(room.roomId)) ThrowInvalidIncomingDataErr('Duplicate room detected.');
    roomSet.add(room.roomId);

    for (const slot of room.slots) {
      const dayIndex = differenceInCalendarDays(slot.start, startDate);

      // Validate the date
      if (dayIndex < 0)
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
        const cell = grid[timeIndex]?.[dayIndex];

        const newCellSlot = { ...slot, roomId: room.roomId, roomName: room.roomName };

        // Insert
        if (!cell) {
          grid[timeIndex][dayIndex] = [newCellSlot];
          continue;
        }

        // Or Append
        // Check overlapping.
        if (
          cell.some((slot) => {
            return slot.roomId === room.roomId;
          })
        )
          ThrowInvalidIncomingDataErr('Duplicate slot detected.');

        grid[timeIndex][dayIndex]!.push(newCellSlot);
      }
    }
  }

  return grid;
};

export { calGridGenerator, newCalGrid };

export type { CalGrid, Cell, Slot };
