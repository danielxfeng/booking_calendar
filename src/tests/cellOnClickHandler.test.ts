import { addDays, format, previousMonday } from 'date-fns';
import { describe, expect, it, vi } from 'vitest';

import type { Booking, CalGrid } from '@/lib/calGrid';
import { cellOnClickHandler } from '@/lib/cellOnClickHandler';

describe('cellOnClickHandler', () => {
  const startDate = previousMonday(addDays(new Date(), 7));
  const start = format(startDate, 'yyyy-MM-dd');
  const row = 4;
  const col = 2;
  const startTimeDate = format(addDays(startDate, col), 'yyyy-MM-dd');
  const startTime = `${startTimeDate}T01:00`;
  const endTime = `${startTimeDate}T01:15`;

  it('should set insert form when cell is available and room 0 is free', () => {
    const mockSetFormProp = vi.fn();
    const grid = Array.from({ length: 48 }, () => Array.from({ length: 7 }, () => []));

    cellOnClickHandler(row, col, grid, start, mockSetFormProp);

    expect(mockSetFormProp).toHaveBeenCalledTimes(1);
    const arg = mockSetFormProp.mock.calls[0][0];

    expect(arg.editingId).toBe(null);
    expect(arg.default.roomId).toBe(0);
    expect(arg.default.start).toBe(startTime);
    expect(arg.default.end).toBe(endTime);
    expect(arg.col).toBe(col);
    expect(arg.row).toBe(row);
  });

  it('should fallback to room 1 if room 0 is taken', () => {
    const mockSetFormProp = vi.fn();
    const grid: CalGrid = Array.from({ length: 96 }, () =>
      Array.from({ length: 7 }, () => [
        { roomId: 0, id: 0, roomName: 'room', start: '', end: '', bookedBy: null },
      ]),
    );

    cellOnClickHandler(row, col, grid, start, mockSetFormProp);

    const arg = mockSetFormProp.mock.calls[0][0];
    expect(arg.editingId).toBe(null);
    expect(arg.default.roomId).toBe(1);
    expect(arg.default.start).toBe(startTime);
    expect(arg.default.end).toBe(endTime);
    expect(arg.col).toBe(col);
    expect(arg.row).toBe(row);
  });

  it('should not allow insert booking into past slot', () => {
    const mockSetFormProp = vi.fn();

    const now = new Date();
    const pastStart = format(previousMonday(addDays(now, -7)), 'yyyy-MM-dd');
    const grid: CalGrid = Array.from({ length: 7 }, () => Array.from({ length: 96 }, () => []));

    cellOnClickHandler(0, 0, grid, pastStart, mockSetFormProp);

    expect(mockSetFormProp).not.toHaveBeenCalled();
  });

  it('should not call setFormProp and log error if no rooms available', () => {
    const mockSetFormProp = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const grid: CalGrid = Array.from({ length: 7 }, () =>
      Array.from({ length: 96 }, () => [
        { roomId: 0, id: 0, roomName: 'room', start: '', end: '', bookedBy: null },
        { roomId: 1, id: 1, roomName: 'room1', start: '', end: '', bookedBy: null },
      ]),
    );

    cellOnClickHandler(row, col, grid, start, mockSetFormProp);

    expect(mockSetFormProp).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('[onClickHandler]: no available meeting room.');

    consoleSpy.mockRestore();
  });

  it('should set formProp for booking when booking exists', () => {
    const mockSetFormProp = vi.fn();
    const booking: Booking = {
      id: 1,
      start: startTime,
      end: endTime,
      roomId: 2,
      roomName: 'room2',
      bookedBy: null,
    };
    const grid: CalGrid = Array.from({ length: 7 }, () => Array.from({ length: 96 }, () => []));

    cellOnClickHandler(row, col, grid, start, mockSetFormProp, booking);

    expect(mockSetFormProp).toHaveBeenCalledTimes(1);
    const arg = mockSetFormProp.mock.calls[0][0];
    expect(arg.editingId).toBe(1);
    expect(arg.default).toEqual(booking);
    expect(arg.col).toBe(col);
    expect(arg.row).toBe(row);
  });
});
