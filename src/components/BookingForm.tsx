import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { AxiosError } from 'axios';
import { add, differenceInMinutes, format, formatISO, startOfDay } from 'date-fns';
import { useAtom } from 'jotai';

import type { FormProp } from '@/components/Main';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { API_URL, ENDPOINT_SLOTS, TIME_SLOT_INTERVAL } from '@/config';
import { currFormAtom, formPropAtom } from '@/lib/atoms';
import { axiosFetcher } from '@/lib/axiosFetcher';
import type { Booking, CalGrid, Cell } from '@/lib/calGrid';
import { ThrowInternalError } from '@/lib/errorHandler';
import type { UpsertBooking } from '@/lib/schema';
import { cn } from '@/lib/utils';

type FormType = 'view' | 'insert' | 'update';

type AvailSlot = { slot: Date; avail: boolean };

/**
 * @summary Returns an empty AvailSlot
 */
const initAvailSlots = (start: string | undefined): AvailSlot[] => {
  if (!start) return []; // to solve the type, should not be here.

  const baseDay = startOfDay(start);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptionsCount = 60 / TIME_SLOT_INTERVAL;
  const minutesIdx = Array.from({ length: minuteOptionsCount }, (_, i) => i);
  const availSlots: AvailSlot[] = [];
  for (const h of hours) {
    for (const mi of minutesIdx) {
      availSlots.push({
        slot: add(baseDay, { hours: h, minutes: mi * TIME_SLOT_INTERVAL }),
        avail: false,
      });
    }
  }
  return availSlots;
};

/**
 * @summary Returns form type
 * @description
 * - if there is no `editingId`, indicates the `insert`
 * - Then there should be an existing booking.
 *   - If the booking is expired, or the bookedBy is null, the type is `view`
 *   - Otherwise, it is `update`
 */
const getFormType = (formProp: Exclude<FormProp, null>, grid: CalGrid): FormType => {
  // When there is no `editingId`
  if (formProp.editingId === null) return 'insert';

  const cell = grid[formProp.row][formProp.col];

  const currBooking = cell?.find((booking) => booking.id === formProp.editingId);
  if (!currBooking) {
    ThrowInternalError('cannot find the booking.'); // There should be a booking.
    return 'view'; // Should not be here.
  }

  // When the bookedBy is null.
  if (!currBooking.bookedBy) return 'view';

  // When the booking is expired.
  if (differenceInMinutes(new Date(currBooking.start), new Date()) <= 0) return 'view';

  return 'update';
};

/**
 * @summary The View/Upsert/Delete form for a booking
 * @description
 * When `editId` is null, the form is an `insertion` form.
 * When `bookedBy` is null, or the start time is in the past, then the booking is view only.
 * Otherwise, the form is an `update/delete` form.
 */
const BookingForm = ({ grid }: { grid: CalGrid }) => {
  // Subscribe the atom to survive the re-render.
  const [formProp, setFormProp] = useAtom(formPropAtom);
  const [currForm, setCurrForm] = useAtom(currFormAtom);

  const navigate = useNavigate();

  // Init a RHF.
  const { handleSubmit, control, setError, formState } = useForm<UpsertBooking>({
    defaultValues: formProp?.default,
  });

  // States for time picker.
  const [availStart, setAvailStart] = useState<AvailSlot[]>(
    initAvailSlots(formProp?.default.start),
  );
  const [availEnd, setAvailEnd] = useState<AvailSlot[]>(initAvailSlots(formProp?.default.start));

  const start = formatISO(new Date(formProp!.startDate), { representation: 'date' });

  /**
   * @summary The call back for axios fetcher.
   * @description
   * We clear the cache, and clear the atoms here.
   * There are several side effects:
   * - The form is cleared and closed since the formProp is gone.
   * - The calendar is re-rendered since the cache is re-built
   */
  const refresh = (start: string) => {
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ['slots', start],
      });
      setFormProp(null);
      setCurrForm(null);
    }, 2000);
  };

  // tanStack query to handle the API request.
  const queryClient = useQueryClient();

  // deletion handler.
  const deleteMutation = useMutation({
    mutationFn: () => {
      return axiosFetcher.delete(`${API_URL}/${ENDPOINT_SLOTS}/${formProp?.editingId}`);
    },
    onSuccess: () => {
      refresh(start);
    },
    onError: () => {
      refresh(start);
    },
  });

  // upsert handler.
  const upsertMutation = useMutation({
    mutationFn: () => {
      return formType === 'insert'
        ? axiosFetcher.post(`${API_URL}/${ENDPOINT_SLOTS}`, { body: currForm! })
        : axiosFetcher.put(`${API_URL}/${ENDPOINT_SLOTS}/${formProp?.editingId}`, {
            body: currForm!,
          });
    },
    onSuccess: () => {
      refresh(start);
    },
    onError: () => {
      queryClient.invalidateQueries({
        queryKey: ['slots', start],
      });
    },
  });

  if (!formProp) return null; // Should not be here.

  const formType = getFormType(formProp, grid);

  return (
    <div
      data-role='booking-upsert-form'
      className='flex h-screen w-screen flex-col justify-between lg:h-96 lg:w-96'
    >
      <h1>{formType.charAt(0).toUpperCase() + formType.slice(1)} a booking</h1>
      <div data-role='booking-date'>
        <span>Date:</span>
        <span>{format(new Date(formProp.default.start), 'dd MMM')}</span>
      </div>
      <Form>
        <form>
          {/* Possible errors */}
          {formState.errors && (
            <div className='text-destructive'>{JSON.stringify(formState.errors)}</div>
          )}

          {/* Possible return message */}
          {deleteMutation.isError && (
            <p className='text-destructive'>
              Sorry, deletion failed, redirecting... {deleteMutation.failureReason?.message}
            </p>
          )}
          {deleteMutation.isSuccess && <p>The booking is canceled, redirecting...</p>}

          {/* Btns */}
          <div
            data-role='booking-form-btns'
            className={cn('flex justify-between', formType === 'insert' && 'justify-center')}
          >
            <Button type='submit' disabled={formType === 'view' || formState.isSubmitting}>
              {formState.isSubmitting ? 'Loading' : formType === 'update' ? 'Update' : 'Book'}
            </Button>
            {formType !== 'insert' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  {/* The deletion btn */}
                  <Button
                    type='button'
                    disabled={formType === 'view' || deleteMutation.isPending}
                    aria-label='Delete booking'
                  >
                    {deleteMutation.isPending ? 'Deleting' : 'Delete'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this booking.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteMutation.mutate()}
                      disabled={deleteMutation.isPending}
                    >
                      {deleteMutation.isPending ? 'Deleting...' : 'Continue'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
};

export default BookingForm;
