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
import { calendarGridAtom, startAtom } from '@/lib/atoms';
import { type CalGrid, calGridGenerator } from '@/lib/calGrid';
import { ThrowInvalidIncomingDataErr } from '@/lib/errorHandler';
import { newDate } from '@/lib/tools';

/**
 * @summary TanQuery, not an UI component.
 * @description
 * For sync the data, and avoid the unnecessary re-render.
 * - Subscribes to `startAtom`
 */
const TanQuery = memo(() => {
  // Subscribe the start.
  const start = useAtomValue(startAtom);
  const setCalendarGrid = useSetAtom(calendarGridAtom);

  const { data: grid, isError } = useQuery<CalGrid>({
    enabled: start !== null,
    queryKey: ['slots', start],
    queryFn: async () => {
      const grid = calGridGenerator(await getSlots(start!), newDate(start!));
      return grid;
    },
    staleTime: 1000 * 60 * CACHE_DURATION,
  });

  // Update the atom, deep comparison first.
  useEffect(() => {
    if (!grid) return;
    setCalendarGrid((prev) => (isEqual(prev, grid) ? prev : grid));
  }, [grid, setCalendarGrid]);

  // Redirect to error boundary.
  useEffect(() => {
    if (isError) {
      ThrowInvalidIncomingDataErr('Data fetching error.');
    }
  }, [isError]);

  return <></>;
});

export default TanQuery;
