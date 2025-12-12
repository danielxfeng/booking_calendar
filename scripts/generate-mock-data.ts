/**
 * Generates mock data for JSON Server.
 * Creates booking data for 3 weeks: previous, current, and next week.
 *
 * Run with: npx tsx scripts/generate-mock-data.ts
 */

import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Date utilities (avoiding external dependencies for the generator)
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

const getMonday = (date: Date): Date => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

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

// Generate slots for a single week starting from Monday
const generateWeekSlots = (weekMonday: Date, idOffset: number): { room1Slots: Slot[]; room2Slots: Slot[] } => {
  const room1Slots: Slot[] = [
    // Monday: 06:00 - 06:30
    {
      id: idOffset + 1,
      start: formatLocal(addMinutes(weekMonday, 360)),
      end: formatLocal(addMinutes(weekMonday, 390)),
      bookedBy: 'Alice',
    },
    // Monday: 06:30 - 07:00
    {
      id: idOffset + 2,
      start: formatLocal(addMinutes(weekMonday, 390)),
      end: formatLocal(addMinutes(weekMonday, 420)),
      bookedBy: 'Bob',
    },
    // Wednesday: 13:00 - 15:00
    {
      id: idOffset + 3,
      start: formatLocal(addMinutes(addDays(weekMonday, 2), 780)),
      end: formatLocal(addMinutes(addDays(weekMonday, 2), 900)),
      bookedBy: null,
    },
    // Saturday: 13:00 - 15:00
    {
      id: idOffset + 4,
      start: formatLocal(addMinutes(addDays(weekMonday, 5), 780)),
      end: formatLocal(addMinutes(addDays(weekMonday, 5), 900)),
      bookedBy: 'Daniel',
    },
    // Sunday: 20:30 - 21:00
    {
      id: idOffset + 5,
      start: formatLocal(addMinutes(addDays(weekMonday, 6), 1230)),
      end: formatLocal(addMinutes(addDays(weekMonday, 6), 1260)),
      bookedBy: 'Daniel',
    },
  ];

  const room2Slots: Slot[] = [
    // Monday: 12:00 - 12:30
    {
      id: idOffset + 6,
      start: formatLocal(addMinutes(weekMonday, 720)),
      end: formatLocal(addMinutes(weekMonday, 750)),
      bookedBy: null,
    },
    // Monday: 13:00 - 15:00
    {
      id: idOffset + 7,
      start: formatLocal(addMinutes(weekMonday, 780)),
      end: formatLocal(addMinutes(weekMonday, 900)),
      bookedBy: null,
    },
    // Thursday: 13:00 - 15:00
    {
      id: idOffset + 8,
      start: formatLocal(addMinutes(addDays(weekMonday, 3), 780)),
      end: formatLocal(addMinutes(addDays(weekMonday, 3), 900)),
      bookedBy: null,
    },
    // Friday: 13:00 - 15:00
    {
      id: idOffset + 9,
      start: formatLocal(addMinutes(addDays(weekMonday, 4), 780)),
      end: formatLocal(addMinutes(addDays(weekMonday, 4), 900)),
      bookedBy: null,
    },
    // Sunday: 20:30 - 21:00
    {
      id: idOffset + 10,
      start: formatLocal(addMinutes(addDays(weekMonday, 6), 1230)),
      end: formatLocal(addMinutes(addDays(weekMonday, 6), 1260)),
      bookedBy: 'Daniel',
    },
  ];

  return { room1Slots, room2Slots };
};

const generateMockData = (): Room[] => {
  const today = new Date();
  const currentMonday = getMonday(today);
  const prevMonday = addDays(currentMonday, -7);
  const nextMonday = addDays(currentMonday, 7);

  // Generate slots for all 3 weeks
  const prevWeek = generateWeekSlots(prevMonday, 0);
  const currWeek = generateWeekSlots(currentMonday, 100);
  const nextWeek = generateWeekSlots(nextMonday, 200);

  // Combine all slots
  const room1AllSlots = [...prevWeek.room1Slots, ...currWeek.room1Slots, ...nextWeek.room1Slots];
  const room2AllSlots = [...prevWeek.room2Slots, ...currWeek.room2Slots, ...nextWeek.room2Slots];

  return [
    {
      roomId: 1,
      roomName: 'Big',
      slots: room1AllSlots,
    },
    {
      roomId: 2,
      roomName: 'Small',
      slots: room2AllSlots,
    },
  ];
};

// Generate and write db.json
const db = {
  reservation: generateMockData(),
};

const outputPath = join(__dirname, '..', 'db.json');
writeFileSync(outputPath, JSON.stringify(db, null, 2));

console.log(`Mock data generated at: ${outputPath}`);
console.log(`Generated ${db.reservation.length} rooms with data for 3 weeks (prev, current, next)`);
