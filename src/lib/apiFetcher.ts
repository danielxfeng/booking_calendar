import { format, nextSunday } from 'date-fns';

import { ENDPOINT_SLOTS } from '@/config';
import { axiosFetcher } from '@/lib/axiosFetcher';
import type { RoomsIsoTime } from '@/lib/schema';
import { newDate } from '@/lib/tools';

const getSlots = async (start: string): Promise<RoomsIsoTime> => {
  const end = format(nextSunday(newDate(start)), 'yyyy-MM-dd');

  const params = new URLSearchParams();
  params.set('start', start);
  params.set('end', end);

  const res = await axiosFetcher.get<RoomsIsoTime>(ENDPOINT_SLOTS, { params });
  return res.data;
};

export { getSlots };
