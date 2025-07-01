/**
 * @file apiFetcher.ts
 * @summary Service for fetching data from api.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { format, nextSunday } from 'date-fns';

import { ENDPOINT_SLOTS } from '@/config';
import { axiosFetcher } from '@/lib/axiosFetcher';
import type { Rooms } from '@/lib/schema';
import { newDate } from '@/lib/tools';

/**
 * @summary Fetch available slots for a given week.
 * @param start start ISO date string (e.g. "2025-06-23"), should be Monday
 * @returns
 */
const getSlots = async (start: string): Promise<Rooms> => {
  const end = format(nextSunday(newDate(start)), 'yyyy-MM-dd');

  const params = new URLSearchParams();
  params.set('start', start);
  params.set('end', end);

  const res = await axiosFetcher.get<Rooms>(ENDPOINT_SLOTS, { params });
  return res.data;
};

export { getSlots };
