import { format, isMonday, previousMonday } from 'date-fns';

import { DateSchema } from '@/lib/schema';
import { newDate } from '@/lib/tools';

const normalizeStartDate = (start: string | null): string => {
  if (!DateSchema.safeParse(start).success) start = format(new Date(), 'yyyy-MM-dd');

  const startDate = newDate(start!);
  if (!isMonday(startDate)) return format(previousMonday(startDate), 'yyyy-MM-dd');

  return start!;
};

export { normalizeStartDate };
