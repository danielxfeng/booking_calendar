/**
 * @file atoms.ts
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

import { ROOM_MAP, type RoomProp } from '@/config';
import type { FormProp } from '@/lib/hooks/useBookingForm';
import type { WeekBookings } from '@/lib/weekBookings';

const formPropAtom = atom<FormProp>(null);

const bookingsAtom = atom<WeekBookings>([]);

const roomsAtom = atom<RoomProp[]>(ROOM_MAP);

// A wrapper of `sessionStorage`. the reviver is to convert `null` to '' since the type of store is `string`.
const storage = createJSONStorage<string>(() => sessionStorage, {
  reviver: (_key, value) => (value === null ? '' : value),
});

/**
 * @summary A Jotai atom synced with sessionStorage.
 */
const startAtom = atomWithStorage<string>('start', '', storage);

export { bookingsAtom, formPropAtom, roomsAtom, startAtom };
