import { format } from 'date-fns';
import { describe, expect, it } from 'vitest';

import { newDate } from '@/lib/tools';

describe('newDate', () => {
  it('returns a Date object', () => {
    const date = newDate('2025-01-01');
    const strDate = format(date, "yyyy-MM-dd'T'HH:mm:ss");
    expect(strDate).toBe('2025-01-01T00:00:00');
  });
});
