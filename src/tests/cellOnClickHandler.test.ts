import { describe, expect, it, vi } from 'vitest';

import type { Booking, CalGrid } from '@/lib/calGrid';
import { cellOnClickHandler } from '@/lib/cellOnClickHandler';

describe('cellOnClickHandler', () => {
  const start = '2025-06-23';
  const row = 4;
  const col = 2;

  it('should set insert form when cell is available and room 0 is free', () => {
    const mockSetFormProp = vi.fn();
    const grid = Array.from({ length: 48 }, () => Array.from({ length: 7 }, () => []));

    cellOnClickHandler(row, col, grid, start, mockSetFormProp);

    expect(mockSetFormProp).toHaveBeenCalledTimes(1);
    const arg = mockSetFormProp.mock.calls[0][0];

    expect(arg.editingId).toBe(null);
    expect(arg.default.roomId).toBe(0);
    expect(arg.default.start).toBe('2025-06-25T01:00');
    expect(arg.default.end).toBe('2025-06-25T01:15');
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
    expect(arg.default.start).toBe('2025-06-25T01:00');
    expect(arg.default.end).toBe('2025-06-25T01:15');
    expect(arg.col).toBe(col);
    expect(arg.row).toBe(row);
  });

  it('should not call setFormProp and log error if no rooms available', () => {
    const mockSetFormProp = vi.fn();
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const grid: CalGrid = Array.from({ length: 96 }, () =>
      Array.from({ length: 7 }, () => [
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
      start: '2025-06-25T01:00',
      end: '2025-06-25T01:15',
      roomId: 2,
      roomName: 'room2',
      bookedBy: null,
    };
    const grid: CalGrid = Array.from({ length: 48 }, () => Array.from({ length: 7 }, () => []));

    cellOnClickHandler(row, col, grid, start, mockSetFormProp, booking);

    expect(mockSetFormProp).toHaveBeenCalledTimes(1);
    const arg = mockSetFormProp.mock.calls[0][0];
    expect(arg.editingId).toBe(1);
    expect(arg.default).toEqual(booking);
    expect(arg.col).toBe(col);
    expect(arg.row).toBe(row);
  });
});
