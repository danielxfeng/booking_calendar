/**
 * @file BookingLayer.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import type { CSSProperties } from 'react';
import { format } from 'date-fns';
import { useAtomValue, useSetAtom } from 'jotai';

import { CELL_HEIGHT_PX, CELL_WIDTH_PX, ROOM_MAP } from '@/config';
import { bookingsAtom, formPropAtom } from '@/lib/atoms';
import type { BookingFromApi } from '@/lib/schema';
import type { WeekBookings } from '@/lib/weekBookings';

const getPosition = (col: number, start: string, end: string, roomId: number): CSSProperties => {
  const totalHeight = CELL_HEIGHT_PX * 24;
  const totalWidth = CELL_WIDTH_PX * 8;

  const startTime = new Date(start);
  const endTime = new Date(end);

  const startMin = startTime.getHours() * 60 + startTime.getMinutes();
  const endMin = endTime.getHours() * 60 + endTime.getMinutes();

  const top = (startMin / (24 * 60)) * totalHeight;
  const height = ((endMin - startMin) / (24 * 60)) * totalHeight;

  const roomIdx = ROOM_MAP.findIndex((room) => room.id === roomId);
  if (roomIdx === -1) return {};

  const roomCount = ROOM_MAP.length;
  const width = CELL_WIDTH_PX / roomCount;
  const left = ((col + 1) * totalWidth) / 8 + roomIdx * width;

  return { position: 'absolute', top, left, width, height };
};

const BookedBlock = ({
  roomId,
  col,
  slot,
}: {
  roomId: number;
  col: number;
  slot: BookingFromApi;
}) => {
  const setFormProp = useSetAtom(formPropAtom);
  return (
    <div
      className='absolute rounded-sm border border-blue-500 bg-blue-500/60'
      style={getPosition(col, slot.start, slot.end, roomId)}
      title={`${format(new Date(slot.start), 'HH:mm')} - ${format(new Date(slot.end), 'HH:mm')}\n${
        slot.bookedBy ? 'Booked by: ' + slot.bookedBy : ''
      }`}
      onClick={() => setFormProp({ bookingId: slot.id })}
    >
      {slot.id}
    </div>
  );
};

/**
 * @summary the covered layer of booked slots
 */
const BookingsLayer = () => {
  const bookings: WeekBookings = useAtomValue(bookingsAtom);

  return (
    <div className='absolute z-10 h-full w-full'>
      {bookings.map((day, col) =>
        Object.values(day).map((room) =>
          room.slots.map((slot) => (
            <BookedBlock key={slot.id} roomId={room.roomId} col={col} slot={slot} />
          )),
        ),
      )}
    </div>
  );
};

export default BookingsLayer;
