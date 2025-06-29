import { format } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { newDate } from '@/lib/dateUtils';

describe('newDate', () => {
  it('returns a Date object', () => {
    const date = newDate('2025-01-01');
    const strDate = format(date, "yyyy-MM-dd'T'HH:mm");
    expect(strDate).toBe('2025-01-01T00:00');
  });
});
