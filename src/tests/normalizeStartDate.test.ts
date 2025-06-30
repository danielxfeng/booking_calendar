import { describe, expect, it } from 'vitest';
import { vi } from 'vitest';

import { normalizeStartDate } from '@/lib/normalizeStartDate';

describe('normalizeStartDate', () => {
  it('returns previous Monday if input is null', () => {
    vi.setSystemTime(new Date('2025-06-28'));

    const result = normalizeStartDate(null);
    const expected = '2025-06-23';

    expect(result).toBe(expected);

    vi.useRealTimers();
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
    vi.setSystemTime(new Date('2025-06-28'));

    const result = normalizeStartDate('not-a-date');
    const expected = '2025-06-23';

    expect(result).toBe(expected);

    vi.useRealTimers();
  });
});
