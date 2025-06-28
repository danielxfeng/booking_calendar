/**
 * @file atoms.ts
 * @summary Use atom to maintain the form states for surviving the re-render/un-mounting.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { atom } from 'jotai';

import type { FormProp } from '@/components/Main';
import type { UpsertBooking } from '@/lib/schema';

/**
 * @summary Maintains the default value of the upsert form.
 */
const formPropAtom = atom<FormProp>(null);

/**
 * @summary Maintains the current value of the upsert form.
 */
const currFormAtom = atom<UpsertBooking | null>(null);

export { currFormAtom, formPropAtom };
