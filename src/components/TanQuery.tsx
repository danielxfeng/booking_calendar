/**
 * @file TanQuery.tsx
 * @summary A headless component that syncs slot query result to calendarGridAtom.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { memo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import isEqual from 'lodash/isEqual';

import { CACHE_DURATION } from '@/config';
import { getSlots } from '@/lib/apiFetcher';
import { bookingsAtom, startAtom } from '@/lib/atoms';
import { ThrowInvalidIncomingDataErr } from '@/lib/errorHandler';
import { type WeekBookings, weekBookingsGenerator } from '@/lib/weekBookings';

/**
 * @summary TanQuery, not an UI component.
 * @description
 * For sync the data, and avoid the unnecessary re-render.
 * - Subscribes to `startAtom`
 */
const TanQuery = memo(() => {
  // Subscribe the start.
  const start = useAtomValue(startAtom);
  const setBookingsAtom = useSetAtom(bookingsAtom);

  const { data: bookings, isError } = useQuery<WeekBookings>({
    enabled: start !== null,
    queryKey: ['slots', start],
    queryFn: async () => {
      const bookings = weekBookingsGenerator(await getSlots(start!), start!);
      return bookings;
    },
    staleTime: 1000 * 60 * CACHE_DURATION,
  });

  // Update the atom, deep comparison first.
  useEffect(() => {
    if (!bookings) return;
    setBookingsAtom((prev) => (isEqual(prev, bookings) ? prev : bookings));
  }, [bookings, setBookingsAtom]);

  // Redirect to error boundary.
  useEffect(() => {
    if (isError) {
      ThrowInvalidIncomingDataErr('Data fetching error.');
    }
  }, [isError]);

  return <></>;
});

export default TanQuery;
