/**
 * @file atoms.ts
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { atom } from 'jotai';

import type { FormProp } from '@/components/BookingForm';
import type { WeekBookings } from '@/lib/weekBookings';

const formPropAtom = atom<FormProp>(null);

const bookingsAtom = atom<WeekBookings>([]);

const startAtom = atom<string>('');

export { bookingsAtom, formPropAtom, startAtom };
