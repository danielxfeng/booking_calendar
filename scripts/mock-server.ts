/**
 * In-memory mock server for booking calendar.
 * Generates mock data dynamically based on the requested week's start date.
 *
 * Run with: npm run mock:server
 */

import { createServer } from 'http';

const PORT = 3001;

// Types
interface Slot {
  id: number;
  start: string;
  end: string;
  bookedBy: string | null;
}

interface Room {
  roomId: number;
  roomName: string;
  slots: Slot[];
}

// Date utilities
const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

const addMinutes = (date: Date, minutes: number): Date => {
  const result = new Date(date);
  result.setMinutes(result.getMinutes() + minutes);
  return result;
};

const formatLocal = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  const secs = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${mins}:${secs}`;
};

// Generate mock data for a week starting from `start`
const generateMockData = (start: string): Room[] => {
  // Parse as local date (not UTC) by appending time
  const base = new Date(`${start}T00:00:00`);

  return [
    {
      roomId: 1,
      roomName: 'Big',
      slots: [
        {
          id: 1,
          start: formatLocal(addMinutes(base, 360)), // Mon 06:00
          end: formatLocal(addMinutes(base, 390)),   // Mon 06:30
          bookedBy: 'Alice',
        },
        {
          id: 3,
          start: formatLocal(addMinutes(base, 390)), // Mon 06:30
          end: formatLocal(addMinutes(base, 420)),   // Mon 07:00
          bookedBy: 'Bob',
        },
        {
          id: 5,
          start: formatLocal(addMinutes(addDays(base, 2), 780)), // Wed 13:00
          end: formatLocal(addMinutes(addDays(base, 2), 900)),   // Wed 15:00
          bookedBy: null,
        },
        {
          id: 8,
          start: formatLocal(addMinutes(addDays(base, 5), 780)), // Sat 13:00
          end: formatLocal(addMinutes(addDays(base, 5), 900)),   // Sat 15:00
          bookedBy: 'Daniel',
        },
        {
          id: 9,
          start: formatLocal(addMinutes(addDays(base, 6), 1230)), // Sun 20:30
          end: formatLocal(addMinutes(addDays(base, 6), 1260)),   // Sun 21:00
          bookedBy: 'Daniel',
        },
      ],
    },
    {
      roomId: 2,
      roomName: 'Small',
      slots: [
        {
          id: 2,
          start: formatLocal(addMinutes(base, 720)), // Mon 12:00
          end: formatLocal(addMinutes(base, 750)),   // Mon 12:30
          bookedBy: null,
        },
        {
          id: 4,
          start: formatLocal(addMinutes(base, 780)), // Mon 13:00
          end: formatLocal(addMinutes(base, 900)),   // Mon 15:00
          bookedBy: null,
        },
        {
          id: 6,
          start: formatLocal(addMinutes(addDays(base, 3), 780)), // Thu 13:00
          end: formatLocal(addMinutes(addDays(base, 3), 900)),   // Thu 15:00
          bookedBy: null,
        },
        {
          id: 7,
          start: formatLocal(addMinutes(addDays(base, 4), 780)), // Fri 13:00
          end: formatLocal(addMinutes(addDays(base, 4), 900)),   // Fri 15:00
          bookedBy: null,
        },
        {
          id: 10,
          start: formatLocal(addMinutes(addDays(base, 6), 1230)), // Sun 20:30
          end: formatLocal(addMinutes(addDays(base, 6), 1260)),   // Sun 21:00
          bookedBy: 'Daniel',
        },
      ],
    },
  ];
};

// HTTP Server
const server = createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // GET /reservation?start=YYYY-MM-DD
  if (req.method === 'GET' && pathname === '/reservation') {
    const start = url.searchParams.get('start');
    if (!start) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing start parameter' }));
      return;
    }

    const data = generateMockData(start);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data));
    return;
  }

  // POST /reservation - just return success
  if (req.method === 'POST' && pathname === '/reservation') {
    let body = '';
    req.on('data', (chunk) => (body += chunk.toString()));
    req.on('end', () => {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({}));
    });
    return;
  }

  // DELETE /reservation/:id - just return success
  const deleteMatch = pathname.match(/^\/reservation\/(\d+)$/);
  if (req.method === 'DELETE' && deleteMatch) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({}));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
  console.log('GET /reservation?start=YYYY-MM-DD returns mock data for that week');
});
