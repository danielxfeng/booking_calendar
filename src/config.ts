import { ThrowInternalError } from './lib/errorHandler';

const IS_PROD: boolean = import.meta.env.PROD;

type RoomProp = { id: number; name: string; color: string };

const ROOM_MAP: RoomProp[] = !IS_PROD
  ? [
      { id: 1, name: 'Big', color: 'bg-blue-300 border-blue-400' },
      { id: 2, name: 'Small', color: 'bg-blue-100 border-blue-200' },
    ]
  : [{ id: 2, name: 'Small', color: 'bg-blue-100 border-blue-200' }];

/**
 * summary Background color for current user.
 */
const CURR_USER_COLOR: string = 'bg-purple-300 border-purple-500';

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

const API_URL: string = !IS_PROD ? 'http://localhost:3001' : import.meta.env.VITE_API_URL || '';

const ENDPOINT_AUTH: string = 'oauth/login';

const ENDPOINT_SLOTS: string = 'reservation';

const FETCHER_TIMEOUT: number = 30000; // 30 seconds

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
  IS_PROD,
  LONGEST_STUDENT_MEETING,
  OPEN_HOURS_IDX,
  ROOM_MAP,
  TIME_SLOT_INTERVAL,
};

export type { RoomProp };
