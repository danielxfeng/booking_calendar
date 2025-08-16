import { format, nextSunday } from 'date-fns';

import { ENDPOINT_SLOTS } from '@/config';
import { axiosFetcher } from '@/lib/axiosFetcher';
import type { Rooms } from '@/lib/schema';
import { newDate } from '@/lib/tools';

const getSlots = async (start: string): Promise<Rooms> => {
  const end = format(nextSunday(newDate(start)), 'yyyy-MM-dd');

  const params = new URLSearchParams();
  params.set('start', start);
  params.set('end', end);

  const res = await axiosFetcher.get<Rooms>(ENDPOINT_SLOTS, { params });
  return res.data;
};

export { getSlots };
