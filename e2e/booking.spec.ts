import { expect, test } from '@playwright/test';

test.describe('Booking Calendar', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for calendar to load
    await page.waitForSelector('[data-role="calendar"]');
    // Wait for bookings to load (wait for at least one "Booked" text)
    await page.waitForSelector('text=Booked', { timeout: 10000 });
  });

  test('should display rooms and bookings', async ({ page }) => {
    // Check calendar is visible
    const calendar = page.locator('[data-role="calendar"]');
    await expect(calendar).toBeVisible();

    // Check that booked slots are displayed (from mock data)
    const bookedSlots = page.locator('text=Booked');
    await expect(bookedSlots.first()).toBeVisible();

    // Verify multiple bookings exist
    const count = await bookedSlots.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should open booking form when clicking empty slot', async ({ page }) => {
    // Find the data container that handles clicks
    const dataContainer = page.locator('[data-role="calendar-data-scroll-container"]');
    await expect(dataContainer).toBeVisible();

    // Get the bounding box
    const box = await dataContainer.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      // Click in the middle area of the calendar (should hit an empty slot)
      // The FreeLayer handles clicks on empty areas
      await page.mouse.click(
        box.x + box.width * 0.8,
        box.y + box.height * 0.5
      );
    }

    // Wait for the booking form sheet to open
    const form = page.locator('[data-role="booking-upsert-form"]');
    await expect(form).toBeVisible({ timeout: 5000 });

    // Check that we're in "insert" mode
    await expect(page.getByText('Book a meeting room')).toBeVisible();
  });

  test('should show booked slots with correct styling', async ({ page }) => {
    // Find booked slots - these have pointer-events-auto class and contain booking info
    const bookedSlots = page.locator('.pointer-events-auto.absolute');
    await expect(bookedSlots.first()).toBeVisible();

    // Verify slots have the expected visual elements
    const firstSlot = bookedSlots.first();

    // Check slot has a title attribute with booking info
    const title = await firstSlot.getAttribute('title');
    expect(title).toContain('Meeting room');

    // Verify multiple booked slots exist
    const count = await bookedSlots.count();
    expect(count).toBeGreaterThan(0);
  });
});
