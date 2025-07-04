/**
 * @file BookingLayer.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import type { CSSProperties } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAtomValue, useSetAtom } from 'jotai';

import Loading from '@/components/Loading';
import { CELL_HEIGHT_PX, CELL_WIDTH_PX, CURR_USER_COLOR, ROOM_MAP } from '@/config';
import { bookingsAtom, formPropAtom, startAtom } from '@/lib/atoms';
import type { BookingFromApi } from '@/lib/schema';
import { getUser } from '@/lib/userStore';
import type { WeekBookings } from '@/lib/weekBookings';

/**
 * @summary A helper function to get the position of a booking block
 * @describe
 * Basically it calculates the offset based on the start time, end time, and roomId.
 */
const getPosition = (col: number, start: string, end: string, roomId: number): CSSProperties => {
  const totalHeight = CELL_HEIGHT_PX * 24;
  const totalWidth = CELL_WIDTH_PX * 8;

  const startTime = new Date(start);
  const endTime = new Date(end);

  const startMin = startTime.getHours() * 60 + startTime.getMinutes();
  const endMin_ = endTime.getHours() * 60 + endTime.getMinutes();

  // If endTime is "00:00", it is "24:00"
  const endMin = endMin_ === 0 ? 24 * 60 : endMin_;

  const top = (startMin / (24 * 60)) * totalHeight;
  const height = ((endMin - startMin) / (24 * 60)) * totalHeight;

  const roomIdx = ROOM_MAP.findIndex((room) => room.id === roomId);
  if (roomIdx === -1) return {};

  const roomCount = ROOM_MAP.length;
  const width = CELL_WIDTH_PX / roomCount;
  const left = ((col + 1) * totalWidth) / 8 + roomIdx * width;

  return { position: 'absolute', top, left, width, height };
};

/**
 * @summary a booked block
 * @description
 * TODO:
 * how to support different background colors for different meeting rooms?
 * displays different data depends on the space?
 */
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
  const room = ROOM_MAP.find((r) => r.id === roomId);
  const roomName = room?.name;

  const user = getUser();
  //const user = { intra: 'Daniel', role: 'null', token: 'd' }; for local debugging
  const isCurrUser = slot.bookedBy != null && slot.bookedBy == user?.intra;

  // order: 1 currUser 2 room's color, 3 fallback
  const roomColor = isCurrUser ? CURR_USER_COLOR : room?.color || 'bg-gray-600/20';

  return (
    <div
      className={`pointer-events-auto absolute flex items-start justify-center rounded-sm border ${roomColor}`}
      style={getPosition(col, slot.start, slot.end, roomId)}
      title={`Meeting room: ${roomName}\n${format(new Date(slot.start), 'HH:mm')} - ${format(new Date(slot.end), 'HH:mm')}\n${
        slot.bookedBy ? 'Booked by: ' + slot.bookedBy : ''
      }`}
      onClick={() =>
        setFormProp({ booking: slot, roomId: roomId, startTime: new Date(slot.start) })
      }
    >
      <span className='text-xs opacity-80'>{roomName}</span>
    </div>
  );
};

/**
 * @summary the covered layer of booked slots
 */
const BookingsLayer = () => {
  const start = useAtomValue(startAtom);
  const bookings: WeekBookings = useAtomValue(bookingsAtom);
  const isPending =
    useIsFetching({
      queryKey: ['slots', start],
      predicate: (query) => query.state.status === 'pending',
    }) > 0;

  return (
    <div className='pointer-events-none absolute top-0 left-0 z-10 h-full w-full'>
      {isPending ? (
        <Loading />
      ) : (
        <>
          {bookings.map((day, col) =>
            Object.values(day).map((room) =>
              room.slots.map((slot) => (
                <BookedBlock key={slot.id} roomId={room.roomId} col={col} slot={slot} />
              )),
            ),
          )}
        </>
      )}
    </div>
  );
};

export default BookingsLayer;
