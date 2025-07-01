import { addDays, addMinutes, format, parseISO } from 'date-fns';
import { MockMethod } from 'vite-plugin-mock';

import type { Rooms } from '../src/lib/schema';

const formatLocal = (date: Date): string => format(date, "yyyy-MM-dd'T'HH:mm:ss");

const generateMockedDate = (start: string): Rooms => {
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
          end: formatLocal(addMinutes(base, 210)), // 3:30
          bookedBy: 'null',
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
      ],
    },
  ];
};

const mocks: MockMethod[] = [
  {
    url: '/reservation',
    method: 'get',
    timeout: 0,
    response: ({ query }) => {
      const { start } = query;
      return generateMockedDate(start);
    },
  },
];

export default mocks;
