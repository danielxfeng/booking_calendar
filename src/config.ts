/**
 * @file This file defines the configuration of the web application
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { ThrowInternalError } from './lib/errorHandler';

/**
 * @summary How many meeting rooms do we have?
 */
const NUMBERS_OF_ROOMS: number = 2;

/**
 * @summary The available rooms. Need to replaced by an API.
 */
const ROOM_MAP: { id: number; name: string }[] = [
  { id: 0, name: 'small' },
  { id: 1, name: 'big' },
];

/**
 * The time slot interval
 */
const TIME_SLOT_INTERVAL: number = 15; // Must divide evenly into 60 (e.g., 5, 10, 15, 30).

if (60 % TIME_SLOT_INTERVAL !== 0)
  ThrowInternalError('TIME_SLOT_INTERVAL must divide evenly into 60');

/**
 * Number of calendar cells per time label and horizontal divider.
 */
const TIME_LABEL_INTERVAL: number = 8; // If TIME_SLOT_INTERVAL = 15, and this is 8 = 2, time is shown every 2 hours.

/**
 * The API Url
 */
const API_URL: string = '';

/**
 * The API endpoint for Login
 */
const ENDPOINT_AUTH: string = '';

/**
 * The API endpoint for getting slots
 */
const ENDPOINT_SLOTS: string = '';

/**
 * The timeout for API fetching
 */
const FETCHER_TIMEOUT: number = 30; // 30 seconds

/**
 * The cache duration for calendar.
 * Since the user may switch the calendar view frequently, we set a cache to optimize the loading speed.
 */
const CACHE_DURATION: number = 5; // 5 minutes

/**
 * The size of a cell of the calendar view.
 * We use `overflow` to support the responsive design for protecting the user experience.
 */
const CELL_WIDTH_PX: number = 112; // 112px
const CELL_HEIGHT_PX: number = 24; // 24px

// For Tailwind
const CELL_WIDTH: string = `w-[${CELL_WIDTH_PX}px]`;
const CELL_HEIGHT: string = `h-[${CELL_HEIGHT_PX}px]`;

export {
  API_URL,
  CACHE_DURATION,
  CELL_HEIGHT,
  CELL_HEIGHT_PX,
  CELL_WIDTH,
  CELL_WIDTH_PX,
  ENDPOINT_AUTH,
  ENDPOINT_SLOTS,
  FETCHER_TIMEOUT,
  NUMBERS_OF_ROOMS,
  ROOM_MAP,
  TIME_LABEL_INTERVAL,
  TIME_SLOT_INTERVAL,
};
