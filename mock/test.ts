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
          start: formatLocal(addMinutes(base, 60)), // 1:00
          end: formatLocal(addMinutes(base, 90)), // 1:30
          bookedBy: 'Alice',
        },
        {
          id: 3,
          start: formatLocal(addMinutes(base, 180)), // 3:00
          end: formatLocal(addMinutes(base, 210)), // 3:30
          bookedBy: 'Bob',
        },
        {
          id: 5,
          start: formatLocal(addDays(addMinutes(base, 180), 2)), // next day 3:00
          end: formatLocal(addDays(addMinutes(base, 300), 2)), // 4:30
          bookedBy: null,
        },
        {
          id: 8,
          start: formatLocal(addDays(addMinutes(base, 180), 5)), // 3:00
          end: formatLocal(addDays(addMinutes(base, 300), 5)), // 4:00
          bookedBy: 'Daniel',
        },
        {
          id: 9,
          start: formatLocal(addDays(addMinutes(base, 1320), 6)), // 22:00
          end: formatLocal(addDays(addMinutes(base, 1380), 6)), // 23:00
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
          start: formatLocal(addMinutes(base, 120)), // 2:00
          end: formatLocal(addMinutes(base, 150)), // 2:30
          bookedBy: null,
        },
        {
          id: 4,
          start: formatLocal(addMinutes(base, 180)), // 3:00
          end: formatLocal(addMinutes(base, 240)), // 4:00
          bookedBy: null,
        },
        {
          id: 6,
          start: formatLocal(addDays(addMinutes(base, 180), 3)), // 3:00
          end: formatLocal(addDays(addMinutes(base, 300), 3)), // 4:00
          bookedBy: null,
        },
        {
          id: 7,
          start: formatLocal(addDays(addMinutes(base, 180), 4)), // 3:00
          end: formatLocal(addDays(addMinutes(base, 300), 4)), // 4:00
          bookedBy: null,
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
