/**
 * @file atoms.ts
 * @summary Use atom to maintain the form states for surviving the re-render/un-mounting.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { atom } from 'jotai';

import type { FormProp } from '@/components/BookingForm';
import type { WeekBookings } from '@/lib/weekBookings';

/**
 * @summary Maintains the default value of the upsert form.
 */
const formPropAtom = atom<FormProp>(null);

/**
 * @summary Maintains the current bookings for a week.
 */
const bookingsAtom = atom<WeekBookings>([]);

/**
 * @summary Maintains the current start of the application.
 */
const startAtom = atom<string>('');

export { bookingsAtom, formPropAtom, startAtom };
