import { type CSSProperties, useState } from 'react';
import { addDays, addMinutes, isBefore } from 'date-fns';
import { useSetAtom } from 'jotai';
import { isEqual as lodashIsEqual } from 'lodash';

import {
  CELL_HEIGHT_PX,
  CELL_WIDTH_PX,
  OPEN_HOURS_IDX,
  type RoomProp,
  TIME_SLOT_INTERVAL,
} from '@/config';
import { formPropAtom } from '@/lib/atoms';
import { newDate, slotsInAHour } from '@/lib/tools';
import { cn } from '@/lib/utils';

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

/**
 * @summary locate a slot based on the hover/click position.
 */
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

  const days = Math.floor(x / CELL_WIDTH_PX);

  const heightPerSlot = CELL_HEIGHT_PX / slotsInAHour;
  const timeIdx = Math.floor(y / heightPerSlot);

  const slotOffsetMin = (timeIdx + OPEN_HOURS_IDX[0]) * TIME_SLOT_INTERVAL;
  const targetDay = addDays(newDate(start), days);
  const startTime = addMinutes(targetDay, slotOffsetMin);

  const endTime = addMinutes(startTime, TIME_SLOT_INTERVAL);

  if (isBefore(startTime, curr)) return null;

  const widthPerRoom = CELL_WIDTH_PX / rooms.length;
  const roomIdx = Math.floor((x - days * CELL_WIDTH_PX) / widthPerRoom);
  const roomId = rooms[roomIdx].id;

  return {
    position: 'absolute',
    top: timeIdx * heightPerSlot,
    left: days * CELL_WIDTH_PX + roomIdx * widthPerRoom,
    width: widthPerRoom,
    height: heightPerSlot,
    startTime,
    endTime,
    roomId,
  };
};

/**
 * @summary Handles interaction of available (free) slots, belongs to BookingCanvas.
 */
const FreeLayer = ({
  containerRef,
  start,
  rooms,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  start: string;
  rooms: RoomProp[];
}) => {
  // A temp cell to handle the hover/click event on empty space.
  const [hoverGridProps, setHoverGridProps] = useState<HoverGridProps | null>(null);
  const setFormProp = useSetAtom(formPropAtom);
  const curr = new Date();

  return (
    <div
      className={cn('absolute top-0 left-0 h-full w-full', hoverGridProps && 'cursor-pointer')}
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
      {hoverGridProps && <HoverGrid hoverGridProps={hoverGridProps} />}
    </div>
  );
};

export default FreeLayer;
