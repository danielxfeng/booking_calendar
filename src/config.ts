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

const TIME_SLOT_INTERVAL = 15; // Must divide evenly into 60 (e.g., 5, 10, 15, 30).

export { NUMBERS_OF_ROOMS, TIME_SLOT_INTERVAL };
