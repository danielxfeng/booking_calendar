/**
 * Custom JSON Server with middleware for booking slot operations.
 *
 * Handles:
 * - GET /reservation - Returns all rooms with slots (default json-server behavior)
 * - POST /reservation - Creates a new slot in the appropriate room
 * - DELETE /reservation/:id - Deletes a slot by its ID
 *
 * Run with: npx tsx scripts/mock-server.ts
 */

import { readFileSync, writeFileSync } from 'fs';
import { createServer } from 'http';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const DB_PATH = join(__dirname, '..', 'db.json');
const PORT = 3001;

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

interface Database {
  reservation: Room[];
}

const readDb = (): Database => {
  const data = readFileSync(DB_PATH, 'utf-8');
  return JSON.parse(data);
};

const writeDb = (db: Database): void => {
  writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
};

const getNextSlotId = (db: Database): number => {
  let maxId = 0;
  for (const room of db.reservation) {
    for (const slot of room.slots) {
      if (slot.id > maxId) maxId = slot.id;
    }
  }
  return maxId + 1;
};

const server = createServer((req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url || '/', `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // GET /reservation - Return all rooms with slots
  if (req.method === 'GET' && pathname === '/reservation') {
    const db = readDb();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(db.reservation));
    return;
  }

  // POST /reservation - Create a new slot
  if (req.method === 'POST' && pathname === '/reservation') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const { roomId, startTime, endTime } = JSON.parse(body);
        const db = readDb();

        const room = db.reservation.find((r) => r.roomId === roomId);
        if (!room) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Room not found' }));
          return;
        }

        const newSlot: Slot = {
          id: getNextSlotId(db),
          start: startTime,
          end: endTime,
          bookedBy: 'MockUser',
        };

        room.slots.push(newSlot);
        room.slots.sort((a, b) => (a.start > b.start ? 1 : -1));
        writeDb(db);

        res.writeHead(201, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newSlot));
      } catch {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
    return;
  }

  // DELETE /reservation/:id - Delete a slot by ID
  const deleteMatch = pathname.match(/^\/reservation\/(\d+)$/);
  if (req.method === 'DELETE' && deleteMatch) {
    const slotId = parseInt(deleteMatch[1], 10);
    const db = readDb();

    let deleted = false;
    for (const room of db.reservation) {
      const slotIndex = room.slots.findIndex((s) => s.id === slotId);
      if (slotIndex !== -1) {
        room.slots.splice(slotIndex, 1);
        deleted = true;
        break;
      }
    }

    if (deleted) {
      writeDb(db);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true }));
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Slot not found' }));
    }
    return;
  }

  // 404 for other routes
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
  console.log('Endpoints:');
  console.log('  GET    /reservation      - Get all rooms with slots');
  console.log('  POST   /reservation      - Create a new slot (body: { roomId, startTime, endTime })');
  console.log('  DELETE /reservation/:id  - Delete a slot by ID');
});
