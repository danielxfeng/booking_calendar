import { formatISO, previousMonday } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { normalizeStartDate } from '@/lib/normalizeStartDate';

describe('normalizeStartDate', () => {
  it('returns previous Monday if input is null', () => {
    const result = normalizeStartDate(null);
    const expected = formatISO(previousMonday(new Date()), { representation: 'date' });
    expect(result).toBe(expected);
  });

  it('returns previous Monday if input is not a Monday', () => {
    const input = '2025-06-26';
    const result = normalizeStartDate(input);
    expect(result).toBe('2025-06-23');
  });

  it('returns same date if input is a valid Monday', () => {
    const input = '2025-06-23';
    const result = normalizeStartDate(input);
    expect(result).toBe(input);
  });

  it('returns previous Monday if input is an invalid date', () => {
    const result = normalizeStartDate('not-a-date');
    const expected = formatISO(previousMonday(new Date()), { representation: 'date' });
    expect(result).toBe(expected);
  });
});
