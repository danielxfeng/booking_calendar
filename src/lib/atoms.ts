/**
 * @file atoms.ts
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { atom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';

import type { FormProp } from '@/components/BookingForm';
import type { WeekBookings } from '@/lib/weekBookings';

const formPropAtom = atom<FormProp>(null);

const bookingsAtom = atom<WeekBookings>([]);

const storage = createJSONStorage<string>(
  () => sessionStorage,
  {
    reviver: (_key, value) => (value === null ? '' : value),
  },
);

const startAtom = atomWithStorage<string>('start', '', storage);

export { bookingsAtom, formPropAtom, startAtom };
