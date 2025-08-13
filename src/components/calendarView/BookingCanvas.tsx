import { type CSSProperties, useEffect, useState } from 'react';
import { useIsFetching } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import BookedBlock from '@/components/calendarView/BookedBlock';
import FreeLayer from '@/components/calendarView/FreeLayer';
import Loading from '@/components/Loading';
import { bookingsAtom, roomsAtom, startAtom } from '@/lib/atoms';
import type { WeekBookings } from '@/lib/weekBookings';
/**
 * @description
 * A stacked canvas layer for bookings.
 *
 * - Transparent background
 * - `FreeLayer` renders available (free) slots
 * - `BookedBlock` renders existing bookings
 */
const BookingCanvas = ({
  containerRef,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
}) => {
  const start = useAtomValue(startAtom);
  const rooms = useAtomValue(roomsAtom);
  const [loaderSize, setLoaderSize] = useState<{ width: number; height: number } | undefined>(
    undefined,
  );

  const bookings: WeekBookings = useAtomValue(bookingsAtom);
  const isPending =
    useIsFetching({
      queryKey: ['slots', start],
      predicate: (query) => query.state.status === 'pending',
    }) > 0;

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const visibleWidth = Math.max(
      0,
      Math.min(rect.right, window.innerWidth) - Math.max(rect.left, 0),
    );
    const visibleHeight = Math.max(
      0,
      Math.min(rect.bottom, window.innerHeight) -
        Math.max(rect.top, 0) -
        Math.max(document.querySelector('footer')?.getBoundingClientRect().height || 0, 0),
    );

    setLoaderSize({ width: visibleWidth, height: visibleHeight });
  }, [containerRef]);

  return (
    <div className='absolute top-0 left-0 z-10 h-full w-full'>
      {isPending ? (
        <Loading style={loaderSize ? (loaderSize as CSSProperties) : undefined} />
      ) : (
        <>
          <FreeLayer containerRef={containerRef} start={start} rooms={rooms} />
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
                    rooms={rooms}
                  />
                )),
              ),
          )}
        </>
      )}
    </div>
  );
};

export default BookingCanvas;
