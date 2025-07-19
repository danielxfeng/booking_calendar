import { addDays, addMinutes, format, parseISO } from 'date-fns';
import { MockMethod } from 'vite-plugin-mock';

import type { Rooms } from '../src/lib/schema';

const DELAY: 'fast' | 'slow' | 'timeout' = 'slow';

const delayMap = {
  fast: 0,
  slow: 400,
  timeout: 5000,
};

const delayNb = delayMap[DELAY];

const formatLocal = (date: Date): string => format(date, "yyyy-MM-dd'T'HH:mm:ss");

const generateMockedData = (start: string): Rooms => {
  const base = parseISO(start);
  return [
    {
      roomId: 1,
      roomName: 'Room A',
      slots: [
        {
          id: 1,
          start: formatLocal(addMinutes(base, 360)), // 06:00
          end: formatLocal(addMinutes(base, 390)), // 06:30
          bookedBy: 'Alice',
        },
        {
          id: 3,
          start: formatLocal(addMinutes(base, 390)), // 06:30
          end: formatLocal(addMinutes(base, 420)), // 07:00
          bookedBy: 'Bob',
        },
        {
          id: 5,
          start: formatLocal(addDays(addMinutes(base, 780), 2)), // next day 13:00
          end: formatLocal(addDays(addMinutes(base, 900), 2)), // 15:00
          bookedBy: null,
        },
        {
          id: 8,
          start: formatLocal(addDays(addMinutes(base, 780), 5)), // 13:00
          end: formatLocal(addDays(addMinutes(base, 900), 5)), // 15:00
          bookedBy: 'Daniel',
        },
        {
          id: 9,
          start: formatLocal(addDays(addMinutes(base, 1230), 6)), // 20:30
          end: formatLocal(addDays(addMinutes(base, 1260), 6)), // 21:00
          bookedBy: 'Daniel',
        },
      ],
    },
    {
      roomId: 2,
      roomName: 'Room B',
      slots: [
        {
          id: 2,
          start: formatLocal(addMinutes(base, 720)), // 12:00
          end: formatLocal(addMinutes(base, 750)), // 12:30
          bookedBy: null,
        },
        {
          id: 4,
          start: formatLocal(addMinutes(base, 780)), // 13:00
          end: formatLocal(addMinutes(base, 900)), // 15:00
          bookedBy: null,
        },
        {
          id: 6,
          start: formatLocal(addDays(addMinutes(base, 780), 3)), // 13:00
          end: formatLocal(addDays(addMinutes(base, 900), 3)), // 15:00
          bookedBy: null,
        },
        {
          id: 7,
          start: formatLocal(addDays(addMinutes(base, 780), 4)), // 13:00
          end: formatLocal(addDays(addMinutes(base, 900), 4)), // 15:00
          bookedBy: null,
        },
        {
          id: 10,
          start: formatLocal(addDays(addMinutes(base, 1230), 6)), // 20:30
          end: formatLocal(addDays(addMinutes(base, 1260), 6)), // 21:00
          bookedBy: 'Daniel',
        },
      ],
    },
  ];
};

const mocks: MockMethod[] = [
  {
    url: '/reservation',
    method: 'get',
    timeout: 400,
    response: ({ query }) => {
      const { start } = query;
      return generateMockedData(start);
    },
  },
  {
    url: '/reservation',
    method: 'post',
    timeout: delayNb,
    response: {},
  },
  {
    url: /^\/reservation\/[^/]+$/ as unknown as string,
    method: 'delete',
    timeout: delayNb,
    response: {},
  },
];

export default mocks;

export { generateMockedData };
