/**
 * @file BookingLayer.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { type CSSProperties, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { addDays, addMinutes, differenceInCalendarDays, format, isBefore } from 'date-fns';
import { useAtomValue, useSetAtom } from 'jotai';
import { isEqual as lodashIsEqual } from 'lodash';

import Loading from '@/components/Loading';
import {
  CELL_HEIGHT_PX,
  CELL_WIDTH_PX,
  CURR_USER_COLOR,
  OPEN_HOURS_IDX,
  ROOM_MAP,
  type RoomProp,
  TIME_SLOT_INTERVAL,
} from '@/config';
import { bookingsAtom, formPropAtom, roomsAtom, startAtom } from '@/lib/atoms';
import type { BookingFromApi } from '@/lib/schema';
import { newDate } from '@/lib/tools';
import { getUser } from '@/lib/userStore';
import { cn } from '@/lib/utils';
import type { WeekBookings } from '@/lib/weekBookings';

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

type HoverGridProps = CSSProperties & { startTime: Date; endTime: Date; roomId: number };

/**
 * @summary A pure static grid for display a hover effect.
 */
const HoverGrid = ({ hoverGridProps }: { hoverGridProps: HoverGridProps }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { startTime, endTime, roomId, ...style } = hoverGridProps;
  return (
    <div
      className='pointer-events-none z-40 scale-[1.02] rounded-md border border-blue-300/60 bg-gradient-to-br from-blue-100/80 to-indigo-100/60 shadow-md transition-all duration-300 ease-out'
      style={style}
    />
  );
};

const findSlotAndStyle = (
  e: React.PointerEvent<HTMLDivElement>,
  containerRef: React.RefObject<HTMLDivElement | null>,
  start: string,
  rooms: RoomProp[],
  curr: Date,
): HoverGridProps | null => {
  if (!containerRef.current) return null;

  // Remove the offset from scroll.
  const rect = containerRef.current.getBoundingClientRect();
  const x = e.clientX - rect.left + containerRef.current.scrollLeft;
  const y = e.clientY - rect.top + containerRef.current.scrollTop;

  const days = Math.floor(x / CELL_WIDTH_PX) - 1;

  // time Label.
  if (days === -1) return null;

  const heightPerSlot = CELL_HEIGHT_PX / (60 / TIME_SLOT_INTERVAL);
  const timeIdx = Math.floor(y / heightPerSlot);

  const slotOffsetMin = (timeIdx + OPEN_HOURS_IDX[0]) * TIME_SLOT_INTERVAL;
  const targetDay = addDays(newDate(start), days);
  const startTime = addMinutes(targetDay, slotOffsetMin);

  const endTime = addMinutes(startTime, TIME_SLOT_INTERVAL);
  if (isBefore(endTime, curr)) return null;

  const widthPerRoom = CELL_WIDTH_PX / rooms.length;
  const roomIdx = Math.floor((x - (days + 1) * CELL_WIDTH_PX) / widthPerRoom);
  const roomId = rooms[roomIdx].id;

  return {
    position: 'absolute',
    top: timeIdx * heightPerSlot,
    left: (days + 1) * CELL_WIDTH_PX + roomIdx * widthPerRoom,
    width: widthPerRoom,
    height: heightPerSlot,
    startTime,
    endTime,
    roomId,
  };
};

/**
 * @description
 * A stacked canvas layer for bookings.
 *
 * - Transparent background
 * - `EmptyLayer` renders available (free) slots
 * - `BookedBlock` renders existing bookings
 */
const BookingCanvas = ({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const start = useAtomValue(startAtom);
  const rooms = useAtomValue(roomsAtom);
  const setFormProp = useSetAtom(formPropAtom);
  const bookings: WeekBookings = useAtomValue(bookingsAtom);
  const isPending =
    useIsFetching({
      queryKey: ['slots', start],
      predicate: (query) => query.state.status === 'pending',
    }) > 0;

  // A temp cell to handle the hover/click event on empty space.
  const [hoverGridProps, setHoverGridProps] = useState<HoverGridProps | null>(null);
  const curr = new Date();

  return (
    <div
      className='absolute top-0 left-0 z-10 h-full w-full'
      onPointerLeave={() => setHoverGridProps(null)} // cancel hover
      // trigger a `insertion` form
      onClick={(e: React.PointerEvent<HTMLDivElement>) => {
        // Draw a hover grid since PointerMove does not work on mobile.
        const hoverGridProps = findSlotAndStyle(e, containerRef, start, rooms, curr);
        if (!hoverGridProps) {
          setHoverGridProps(null);
          return;
        }
        setHoverGridProps((prev) => {
          return lodashIsEqual(prev, hoverGridProps) ? prev : hoverGridProps;
        });

        // next tick to wait for the hover grid.
        setTimeout(() => {
          setFormProp({
            roomId: hoverGridProps.roomId,
            startTime: hoverGridProps.startTime,
            channel: 'sheet',
          });
          setHoverGridProps(null);
        }, 0);
      }}
      onPointerMove={(e: React.PointerEvent<HTMLDivElement>) => {
        const hoverGridProps = findSlotAndStyle(e, containerRef, start, rooms, curr);
        if (!hoverGridProps) {
          setHoverGridProps(null);
          return;
        }
        setHoverGridProps((prev) => {
          return lodashIsEqual(prev, hoverGridProps) ? prev : hoverGridProps;
        });
      }}
    >
      {isPending ? (
        <Loading />
      ) : (
        <>
          {bookings.map((day) =>
            Object.values(day)
              .filter((booking) => rooms.some((room) => room.id === booking.roomId))
              .map((room) =>
                room.slots.map((slot) => (
                  <BookedBlock
                    key={slot.id}
                    roomId={room.roomId}
                    start={start}
                    slot={slot}
                    roomsCount={rooms.length}
                  />
                )),
              ),
          )}
          {hoverGridProps && <HoverGrid hoverGridProps={hoverGridProps} />}
        </>
      )}
    </div>
  );
};

export default BookingCanvas;
