import { expect, test } from '@playwright/test';
import { addMinutes } from 'date-fns';

// Generate mock data similar to mock/test.ts
const generateMockData = (start: string) => {
  const base = new Date(`${start}T00:00:00.000Z`);
  return [
    {
      roomId: 2,
      roomName: 'Small',
      slots: [
        {
          id: 1,
          startTime: addMinutes(base, 720).toISOString(), // 12:00 UTC
          endTime: addMinutes(base, 750).toISOString(), // 12:30 UTC
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

    await page.goto('/?token=e2e-token&intra=e2e-user&role=staff');

    // Should see the calendar view with header
    await expect(page.getByRole('heading', { name: 'Bookme' })).toBeVisible();

    // Should see the booking slot
    await expect(page.getByText('Booked')).toBeVisible();
  });
});
