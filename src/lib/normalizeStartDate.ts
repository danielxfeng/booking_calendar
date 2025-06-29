/**
 * @file normalizeStartDate.ts
 * @summary Handles auth, and data loading.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { format, isMonday, previousMonday } from 'date-fns';

import { DateSchema } from '@/lib/schema';

/**
 * @summary Validates and normalizes the `start` date from query parameters.
 * @description
 * - If the input is not a valid ISO date, fallback to the previous Monday from today.
 * - If the date is valid but not a Monday, shift it to the previous Monday.
 * - Otherwise, return the input start.
 *
 * This function ensures that the calendar always starts on a Monday.
 *
 * @param start - A potential ISO date string, or null.
 * @returns A valid ISO date string representing a Monday.
 */
const normalizeStartDate = (start: string | null): string => {
  // If there is not a valid start day
  if (!DateSchema.safeParse(start).success) return format(previousMonday(new Date()), 'yyyy-MM-dd');

  // If the start is valid, but not the Monday
  const startDate = new Date(start!);
  if (!isMonday(startDate)) return format(previousMonday(startDate), 'yyyy-MM-dd');

  // the start is valid
  return start!;
};

export { normalizeStartDate };
