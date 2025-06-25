/**
 * @file apiFetcher.ts
 * @summary Service for fetching data from api.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { formatISO, nextSunday } from 'date-fns';

import { ENDPOINT_SLOTS } from '@/config';
import { axiosFetcher } from '@/lib/axiosFetcher';
import type { SlotsRooms } from '@/lib/schema';

/**
 * @summary Fetch available slots for a given week.
 * @param start start ISO date string (e.g. "2025-06-23"), should be Monday
 * @returns
 */
const getSlots = async (start: string): Promise<SlotsRooms> => {
  const end = formatISO(nextSunday(new Date(start)), { representation: 'date' });

  const params = new URLSearchParams();
  params.set('start', start);
  params.set('end', end);

  const res = await axiosFetcher.get<SlotsRooms>(ENDPOINT_SLOTS, { params });
  return res.data;
};

export { getSlots };
