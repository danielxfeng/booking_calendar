/**
 * @file This file defines the configuration of the web application
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

/**
 * @summary How many meeting rooms do we have?
 */
const NUMBERS_OF_ROOMS: number = 2;

/**
 * The time slot interval
 */
const TIME_SLOT_INTERVAL = 15; // Must divide evenly into 60 (e.g., 5, 10, 15, 30).

/**
 * The API Url
 */
const API_URL = '';

/**
 * The API endpoint for Login
 */
const ENDPOINT_AUTH = '';

/**
 * The API endpoint for getting slots
 */
const ENDPOINT_SLOTS = '';

/**
 * The timeout for API fetching
 */
const FETCHER_TIMEOUT = 30; // 30 seconds

/**
 * The cache duration for calendar.
 * Since the user may switch the calendar view frequently, we set a cache to optimize the loading speed.
 */
const CACHE_DURATION = 5; // 5 minutes

export {
  API_URL,
  CACHE_DURATION,
  ENDPOINT_AUTH,
  ENDPOINT_SLOTS,
  FETCHER_TIMEOUT,
  NUMBERS_OF_ROOMS,
  TIME_SLOT_INTERVAL,
};
