import { expect, test } from '@playwright/test';
import { addMinutes, format, parseISO } from 'date-fns';

const formatLocal = (date: Date): string => format(date, "yyyy-MM-dd'T'HH:mm:ss");

// Generate mock data similar to mock/test.ts
const generateMockData = (start: string) => {
  const base = parseISO(start);
  return [
    {
      roomId: 2,
      roomName: 'Small',
      slots: [
        {
          id: 1,
          start: formatLocal(addMinutes(base, 720)), // 12:00
          end: formatLocal(addMinutes(base, 750)), // 12:30
          bookedBy: null,
        },
      ],
    },
  ];
};

test.describe('App', () => {
  test('page renders calendar with bookings', async ({ page }) => {
    // Mock the reservation API
    await page.route('**/reservation*', async (route) => {
      const url = new URL(route.request().url());
      const start = url.searchParams.get('start') || new Date().toISOString();

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(generateMockData(start)),
      });
    });

    await page.goto('/');

    // Should see the calendar view with header
    await expect(page.getByRole('heading', { name: 'Bookme' })).toBeVisible();

    // Should see the booking slot
    await expect(page.getByText('Booked')).toBeVisible();
  });
});
