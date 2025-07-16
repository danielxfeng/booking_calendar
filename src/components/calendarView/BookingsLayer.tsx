/**
 * @file BookingLayer.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { type CSSProperties, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useAtomValue, useSetAtom } from 'jotai';

import Loading from '@/components/Loading';
import {
  CELL_HEIGHT_PX,
  CELL_WIDTH_PX,
  CURR_USER_COLOR,
  OPEN_HOURS_IDX,
  ROOM_MAP,
  TIME_SLOT_INTERVAL,
} from '@/config';
import { bookingsAtom, formPropAtom, roomsAtom, startAtom } from '@/lib/atoms';
import type { BookingFromApi } from '@/lib/schema';
import { getUser } from '@/lib/userStore';
import { cn } from '@/lib/utils';
import type { WeekBookings } from '@/lib/weekBookings';

const slotsInAHour = 60 / TIME_SLOT_INTERVAL;

const getPositionAndStyle = (
  col: number,
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

  const totalWidth = CELL_WIDTH_PX * 8;
  const width = CELL_WIDTH_PX / roomsCount;
  const left = ((col + 1) * totalWidth) / 8 + roomIdx * width;

  return { position: 'absolute', top, left, width, height, h: height };
};

const BookedBlock = ({
  roomId,
  col,
  slot,
  roomsCount,
}: {
  roomId: number;
  col: number;
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
    col,
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

type HoverGridProps = {
  col: number;
  row: number;
  startTime: Date;
  roomId: number;
};

const parseHoverGridProps = (x: number, y: number): HoverGridProps => {
  // TODO: to be implemented.
  return { col: x, row: y, startTime: new Date(), roomId: 0 };
};

/**
 * @summary A pure static grid for display a hover effect.
 */
const HoverGrid = ({ hoverGridProps }: { hoverGridProps: HoverGridProps }) => {
  // TODO: to be implemented.
  hoverGridProps.col = 0;
  return <></>;
};

/**
 * @description
 * A free zone with transparent bg, and absolute booking blocks on it.
 * Display a temp hover grid on hover for helping user start a new booking.
 */
const BookingsLayer = ({
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

  return (
    <div
      className='absolute top-0 left-0 z-10 h-full w-full'
      onPointerLeave={() => setHoverGridProps(null)} // cancel hover
      // trigger a `insertion` form
      onClick={() => {
        if (!hoverGridProps) return;
        setFormProp({
          roomId: hoverGridProps.roomId,
          startTime: hoverGridProps.startTime,
          channel: 'sheet',
        });
      }}
      onPointerMove={(e: React.PointerEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + containerRef.current.scrollLeft;
        const y = e.clientY - rect.top + containerRef.current.scrollTop;

        setHoverGridProps(parseHoverGridProps(x, y));
      }}
    >
      {isPending ? (
        <Loading />
      ) : (
        <>
          {bookings.map((day, col) =>
            Object.values(day)
              .filter((booking) => rooms.some((room) => room.id === booking.roomId))
              .map((room) =>
                room.slots.map((slot) => (
                  <BookedBlock
                    key={slot.id}
                    roomId={room.roomId}
                    col={col}
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

export default BookingsLayer;
