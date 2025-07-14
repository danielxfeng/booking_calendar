/**
 * @file This file defines the configuration of the web application
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { ThrowInternalError } from './lib/errorHandler';

type RoomProp = { id: number; name: string; color: string };

const ROOM_MAP: RoomProp[] = [
  { id: 1, name: 'Big', color: 'bg-blue-200 border-blue-300' },
  { id: 2, name: 'Small', color: 'bg-blue-50 border-blue-200' },
];

/**
 * summary Background color for current user.
 */
const CURR_USER_COLOR: string = 'bg-orange-600/20 border-orange-500/40';

/**
 * The time slot interval
 */
const TIME_SLOT_INTERVAL: number = 30; // Must divide evenly into 60 (e.g., 5, 10, 15, 30).

if (60 % TIME_SLOT_INTERVAL !== 0)
  ThrowInternalError('TIME_SLOT_INTERVAL must divide evenly into 60');

/**
 * The open hours of the meeting rooms,
 * [start, end], must align with TIME_SLOT_INTERVAL, and on hour
 */
const OPEN_HOURS: [string, string] = ['06:00', '21:00'];

const getOpenHoursIdx = (time: string): number => {
  const [hour, minute] = time.split(':').map(Number);
  const minutes = hour * 60 + minute;
  if (minutes % TIME_SLOT_INTERVAL !== 0 || minute !== 0)
    ThrowInternalError('open hours must align with TIME_SLOT_INTERVAL, and on hour');
  return minutes / TIME_SLOT_INTERVAL;
};

/**
 * The first and last valid slot indexes for meetings within open hours.
 */
const OPEN_HOURS_IDX = [getOpenHoursIdx(OPEN_HOURS[0]), getOpenHoursIdx(OPEN_HOURS[1])];

const API_URL: string = import.meta.env.VITE_API_URL || '';

const ENDPOINT_AUTH: string = 'oauth/login';

const ENDPOINT_SLOTS: string = 'reservation';

const FETCHER_TIMEOUT: number = 3000; // 30 seconds

const CACHE_DURATION: number = 5; // 5 minutes

const LONGEST_STUDENT_MEETING: number = 4; // 4 hours.

/**
 * The size of a cell of the calendar view.
 */
const CELL_WIDTH_PX: number = 112; // 112px
const CELL_HEIGHT_PX: number = 88; // 24px

export {
  API_URL,
  CACHE_DURATION,
  CELL_HEIGHT_PX,
  CELL_WIDTH_PX,
  CURR_USER_COLOR,
  ENDPOINT_AUTH,
  ENDPOINT_SLOTS,
  FETCHER_TIMEOUT,
  LONGEST_STUDENT_MEETING,
  OPEN_HOURS_IDX,
  ROOM_MAP,
  TIME_SLOT_INTERVAL,
};

export type { RoomProp };
