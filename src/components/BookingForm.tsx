import { useState } from 'react';
import { Form, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroupItem } from '@radix-ui/react-radio-group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { add, differenceInMinutes, format, formatISO, startOfDay } from 'date-fns';
import { useAtom } from 'jotai';

import type { FormProp } from '@/components/Main';
import type { Slot } from '@/components/ScrollTimePicker';
import ScrollTimePicker from '@/components/ScrollTimePicker';
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
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup } from '@/components/ui/radio-group';
import { API_URL, ENDPOINT_SLOTS, ROOM_MAP, TIME_SLOT_INTERVAL } from '@/config';
import { formPropAtom } from '@/lib/atoms';
import { axiosFetcher } from '@/lib/axiosFetcher';
import type { CalGrid } from '@/lib/calGrid';
import { ThrowInternalError } from '@/lib/errorHandler';
import { type UpsertBooking, UpsertBookingSchema } from '@/lib/schema';
import { cn } from '@/lib/utils';

type FormType = 'view' | 'insert' | 'update';

/**
 * @summary Returns an empty Slots
 */
const initSlots = (start: string | undefined): Slot[] => {
  if (!start) return []; // to solve the type, should not be here.

  const baseDay = startOfDay(start);
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minuteOptionsCount = 60 / TIME_SLOT_INTERVAL - 1; // -1 = - min_interval
  const minutesIdx = Array.from({ length: minuteOptionsCount }, (_, i) => i);
  const slots: Slot[] = [];
  for (const h of hours) {
    for (const mi of minutesIdx) {
      slots.push({
        slot: add(baseDay, { hours: h, minutes: mi * TIME_SLOT_INTERVAL }),
        avail: false,
      });
    }
  }
  return slots;
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
 * @summary Handle the error from posting data from API.
 */
const parseErrorMsg = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message ?? 'Server responded with an error.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred.';
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

  // Init a RHF.
  const form = useForm<UpsertBooking>({
    resolver: zodResolver(UpsertBookingSchema),
    defaultValues: formProp?.default,
    mode: 'onChange',
  });

  // States for time picker.
  const [startSlots, setStartSlots] = useState<Slot[]>(initSlots(formProp?.default.start));
  const [endSlots, setEndSlots] = useState<Slot[]>(initSlots(formProp?.default.start));

  const start = formatISO(new Date(formProp!.startDate), { representation: 'date' });

  /**
   * @summary Post-process when the post/put/delete is done..
   * @description
   * We clear the cache, and clear the atoms here.
   * There are several side effects:
   * - The form is cleared and closed since the formProp is gone.
   * - The calendar is re-rendered since the cache is re-built
   */
  const delayRefreshAndQuit = (start: string) => {
    setTimeout(() => {
      queryClient.invalidateQueries({
        queryKey: ['slots', start],
      });
      setFormProp(null);
    }, 2000);
  };

  /**
   * @summary Post-process when the post/put/delete is on error.
   */
  const handleError = (error: unknown) => {
    queryClient.invalidateQueries({ queryKey: ['slots', start] });
    form.setError('root', {
      type: 'server',
      message: parseErrorMsg(error),
    });
  };

  // tanStack query to handle the API request.
  const queryClient = useQueryClient();

  // deletion handler.
  const deleteMutation = useMutation({
    mutationFn: () => {
      return axiosFetcher.delete(`${API_URL}/${ENDPOINT_SLOTS}/${formProp?.editingId}`);
    },
    onSuccess: () => {
      delayRefreshAndQuit(start);
    },
    onError: (error: unknown) => {
      handleError(error);
    },
  });

  // upsert handler.
  const upsertMutation = useMutation({
    mutationFn: (data: UpsertBooking) => {
      return formType === 'insert'
        ? axiosFetcher.post(`${API_URL}/${ENDPOINT_SLOTS}`, { body: data })
        : axiosFetcher.put(`${API_URL}/${ENDPOINT_SLOTS}/${formProp?.editingId}`, {
            body: data,
          });
    },
    onSuccess: () => {
      delayRefreshAndQuit(start);
    },
    onError: (error: unknown) => {
      handleError(error);
    },
  });

  // handle the slot (start/end) changing event.
  const timeSlotChangeHandler = (type: 'start' | 'end', value: string) => {
    if (type === 'start') {
      // todo
      console.log(value);
      setStartSlots([]);
    } else if (type === 'end')
      setEndSlots([]); // todo
    // should not be here.
    else ThrowInternalError('The type of Time Slot Selector should be either start or end.');
  };

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
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => upsertMutation.mutate(data))}
          className='space-y-8'
        >
          {/* Room id selector */}
          <FormField
            control={form.control}
            name='roomId'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormLabel>Choose a meeting room: </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(val) => field.onChange(Number(val))}
                    defaultValue={String(field.value)}
                    className='flex flex-col'
                  >
                    {ROOM_MAP.map(({ id, name }) => (
                      <FormItem key={id} className='flex items-center gap-3'>
                        <FormControl>
                          <RadioGroupItem value={String(id)} />
                        </FormControl>
                        <FormLabel className='font-normal'>{name}</FormLabel>
                      </FormItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Slot selector */}
          <div className='flex gap-3'>
            {/* Start time selector */}
            <FormField
              control={form.control}
              name='start'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>Start time:</FormLabel>
                  <FormControl>
                    <ScrollTimePicker
                      slots={startSlots}
                      selected={field.value}
                      onSelect={(val) => {
                        field.onChange(val);
                        timeSlotChangeHandler('start', val);
                        // next tick to wait for the prev handler taking effect
                        setTimeout(() => form.trigger('end'), 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End time selector */}
            <FormField
              control={form.control}
              name='end'
              render={({ field }) => (
                <FormItem className='space-y-3'>
                  <FormLabel>End time:</FormLabel>
                  <FormControl>
                    <ScrollTimePicker
                      slots={endSlots}
                      selected={field.value}
                      onSelect={(val) => {
                        field.onChange(val);
                        timeSlotChangeHandler('end', val);
                        // next tick to wait for the prev handler taking effect
                        setTimeout(() => form.trigger('start'), 0);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Root error(possible) */}
          {form.formState.errors.root && (
            <p className='text-destructive text-sm'>{form.formState.errors.root?.message}</p>
          )}

          {/* Return info(possible) */}
          {(deleteMutation.isSuccess || upsertMutation.isSuccess) && (
            <p>Cool! The operation was successful, we are closing the form...</p>
          )}

          {/* Btns */}
          <div
            data-role='booking-form-btns'
            className={cn('flex justify-between', formType === 'insert' && 'justify-center')}
          >
            {/* Upsert submit */}
            <Button
              type='submit'
              disabled={
                formType === 'view' || form.formState.isSubmitting || !form.formState.isValid
              }
            >
              {form.formState.isSubmitting ? 'Loading' : formType === 'update' ? 'Update' : 'Book'}
            </Button>

            {/* Delete */}
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
