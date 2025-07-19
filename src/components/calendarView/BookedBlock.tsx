import { type CSSProperties } from 'react';
import { differenceInCalendarDays, format } from 'date-fns';
import { useSetAtom } from 'jotai';

import {
  CELL_HEIGHT_PX,
  CELL_WIDTH_PX,
  CURR_USER_COLOR,
  OPEN_HOURS_IDX,
  ROOM_MAP,
  TIME_SLOT_INTERVAL,
} from '@/config';
import { formPropAtom } from '@/lib/atoms';
import type { BookingFromApi } from '@/lib/schema';
import { getUser } from '@/lib/userStore';
import { cn } from '@/lib/utils';
const slotsInAHour = 60 / TIME_SLOT_INTERVAL;

const getPositionAndStyle = (
  startOfWeek: string,
  start: string,
  end: string,
  roomId: number,
  roomsCount: number,
): CSSProperties & { h: number } => {
  const startTime = new Date(start);
  const endTime = new Date(end);

  const startMin = startTime.getHours() * 60 + startTime.getMinutes();
  const endMin_ = endTime.getHours() * 60 + endTime.getMinutes();

  // If endTime is "00:00", it is "24:00"
  const endMin = endMin_ === 0 ? 24 * 60 : endMin_;

  const heightPerSlot = CELL_HEIGHT_PX / slotsInAHour;
  const startSlotIdx = startMin / TIME_SLOT_INTERVAL - OPEN_HOURS_IDX[0];
  const endSlotIdx = endMin / TIME_SLOT_INTERVAL - OPEN_HOURS_IDX[0];
  const top = startSlotIdx * heightPerSlot;
  const height = (endSlotIdx - startSlotIdx) * heightPerSlot;

  const roomIdx = ROOM_MAP.findIndex((room) => room.id === roomId);
  if (roomIdx === -1) return { h: 0 };

  const width = CELL_WIDTH_PX / roomsCount;

  const col = differenceInCalendarDays(startTime, new Date(startOfWeek)) + 1;
  const left = col * CELL_WIDTH_PX + roomIdx * width;

  return { position: 'absolute', top, left, width, height, h: height };
};

/**
 * @summary handles an exist booking, belongs to BookingCanvas.
 */
const BookedBlock = ({
  roomId,
  start,
  slot,
  roomsCount,
}: {
  roomId: number;
  start: string;
  slot: BookingFromApi;
  roomsCount: number;
}) => {
  const setFormProp = useSetAtom(formPropAtom);
  const room = ROOM_MAP.find((r) => r.id === roomId);
  const roomName = room?.name;

  const user = getUser();
  //const user = { intra: 'Daniel', role: 'null', token: 'd' }; //for local debugging
  const isCurrUser = slot.bookedBy != null && slot.bookedBy == user?.intra;

  // order: 1 currUser 2 room's color, 3 fallback
  const roomColor = isCurrUser ? CURR_USER_COLOR : room?.color || 'bg-gray-600/20';

  const { h: height, ...style } = getPositionAndStyle(
    start,
    slot.start,
    slot.end,
    roomId,
    roomsCount,
  );

  return (
    <div
      className={`pointer-events-auto absolute flex items-start justify-center rounded-sm border ${roomColor}`}
      style={style}
      title={`Meeting room: ${roomName}\n${format(new Date(slot.start), 'HH:mm')} - ${format(new Date(slot.end), 'HH:mm')}\n${
        slot.bookedBy ? 'Booked by: ' + slot.bookedBy : ''
      }`}
      onClick={() => {
        // only staff or booked student can review/edit a booking.
        if (user?.role !== 'staff' && !isCurrUser) return;
        setFormProp({
          booking: slot,
          roomId: roomId,
          startTime: new Date(slot.start),
          channel: 'sheet',
        });
      }}
    >
      <span
        className={cn(
          'w-full truncate px-1 py-1 text-center text-xs whitespace-nowrap opacity-80',
          height < 16 && 'py-0 leading-none',
        )}
      >
        {user?.role == 'staff' && slot.bookedBy && height >= 12 ? slot.bookedBy : 'Booked'}
      </span>
    </div>
  );
};

export default BookedBlock;
