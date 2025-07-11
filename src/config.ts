/**
 * @file This file defines the configuration of the web application
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { ThrowInternalError } from './lib/errorHandler';

const ROOM_MAP: { id: number; name: string; color: string }[] = [
  { id: 1, name: 'Big', color: 'bg-slate-400/70 border-slate-500/50' },
  { id: 2, name: 'Small', color: 'bg-slate-300/70 border-slate-400/50' },
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

const API_URL: string = import.meta.env.VITE_API_URL || '';

const ENDPOINT_AUTH: string = 'oauth/login';

const ENDPOINT_SLOTS: string = 'reservation';

const FETCHER_TIMEOUT: number = 3000; // 30 seconds

const CACHE_DURATION: number = 5; // 5 minutes

/**
 * The size of a cell of the calendar view.
 */
const CELL_WIDTH_PX: number = 112; // 112px
const CELL_HEIGHT_PX: number = 48; // 24px

export {
  API_URL,
  CACHE_DURATION,
  CELL_HEIGHT_PX,
  CELL_WIDTH_PX,
  CURR_USER_COLOR,
  ENDPOINT_AUTH,
  ENDPOINT_SLOTS,
  FETCHER_TIMEOUT,
  ROOM_MAP,
  TIME_SLOT_INTERVAL,
};
