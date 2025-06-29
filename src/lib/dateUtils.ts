/**
 * @file dateUtils.ts
 * @summary Just tools for date related.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { startOfDay } from 'date-fns';

/**
 * @summary Returns a local time format of date
 * @param date like '2000-01-01'
 * @returns local time like: 2000-01-01T00:00
 */
const newDate = (date: string): Date => {
  const [y, m, d] = date.split('-').map(Number);
  return startOfDay(new Date(y, m - 1, d));
};

export { newDate };
