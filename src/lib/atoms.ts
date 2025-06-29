/**
 * @file atoms.ts
 * @summary Use atom to maintain the form states for surviving the re-render/un-mounting.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { atom } from 'jotai';

import type { FormProp } from '@/components/BookingForm';
import type { CalGrid } from '@/lib/calGrid';

/**
 * @summary Maintains the default value of the upsert form.
 */
const formPropAtom = atom<FormProp>(null);

/**
 * @summary Maintains the current grid of the calendar.
 */
const calendarGridAtom = atom<CalGrid>([]);

/**
 * @summary Maintains the current start of the application.
 */
const startAtom = atom<string>('');

export { calendarGridAtom, formPropAtom, startAtom };
