/**
 * @file BookingForm.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useEffect, useMemo } from 'react';
import { Form, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroupItem } from '@radix-ui/react-radio-group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useAtom } from 'jotai';

import ScrollSlotPicker from '@/components/ScrollSlotPicker';
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
import { Popover, PopoverContent } from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radio-group';
import { API_URL, ENDPOINT_SLOTS, ROOM_MAP } from '@/config';
import { calendarGridAtom, formPropAtom, startAtom } from '@/lib/atoms';
import { axiosFetcher } from '@/lib/axiosFetcher';
import { calculateSlots, getFormType, overlappingCheck } from '@/lib/bookingFormUtils';
import type { Day } from '@/lib/calGrid';
import { type UpsertBooking, UpsertBookingSchema } from '@/lib/schema';
import { cn } from '@/lib/utils';

type FormType = 'view' | 'insert' | 'update';

/**
 * @summary Represents the state of upsert form.
 * @description
 * - null: no form should be shown.
 * - editingId = null: insertion, otherwise: update.
 */
type FormProp = {
  editingId: number | null;
  default: UpsertBooking;
  startDate: Date;
  row: number;
  col: number;
} | null;

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
 * @summary The View/Insert/Delete form for a booking
 * @description
 * When `editId` is null, the form is an `insertion` form.
 * When `bookedBy` is null, or the start time is in the past, then the booking is view only.
 * Otherwise, there is a 'delete' button.
 *
 */
const BookingFormBody = () => {
  // Subscribe the atoms to tracking the data changing.
  const [grid] = useAtom(calendarGridAtom);
  const [start] = useAtom(startAtom);
  const [formProp, setFormProp] = useAtom(formPropAtom);

  // We just need one day
  const day: Day = grid[formProp?.col || 0];

  // Init a RHF.
  const form = useForm<UpsertBooking>({
    resolver: zodResolver(UpsertBookingSchema),
    defaultValues: formProp?.default,
    mode: 'onChange',
  });

  // Get the type of form, 'view', 'insert', 'update'.
  const formType: FormType = getFormType(formProp, grid);

  // Hook to track the value change.
  const [watchedRoomId, watchedStart, watchedEnd] = useWatch({
    control: form.control,
    name: ['roomId', 'start', 'end'],
  });

  // 2 slots is required, it mainly tracks the changing of roomId.
  // It reads the bookings from `day`, then set `unavailable` to booked slots.
  const startSlots = useMemo(() => {
    return calculateSlots(
      formType,
      day,
      'start',
      watchedRoomId,
      undefined,
      formProp?.default.start,
    );
  }, [formType, day, formProp?.default.start, watchedRoomId]);
  const endSlots = useMemo(() => {
    return calculateSlots(
      formType,
      day,
      'end',
      watchedRoomId,
      formProp?.editingId,
      formProp?.default.start,
    );
  }, [formType, day, formProp?.default.start, formProp?.editingId, watchedRoomId]);

  // To validate the overlapping booking, since the overlapping check is not included in zod.
  useEffect(() => {
    const isOverlapping = overlappingCheck(watchedStart, watchedEnd, endSlots);
    if (isOverlapping)
      form.setError('end', { type: 'manual', message: 'The booked slots are not available.' });
    else form.clearErrors('end');
  }, [watchedStart, watchedEnd, endSlots, form]);

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
      return axiosFetcher.post(`${API_URL}/${ENDPOINT_SLOTS}`, { body: data });
    },
    onSuccess: () => {
      delayRefreshAndQuit(start);
    },
    onError: (error: unknown) => {
      handleError(error);
    },
  });

  if (!formProp) return null; // Should not be here.

  return (
    <div
      data-role='booking-upsert-form'
      className='flex h-screen w-screen flex-col justify-between lg:h-96 lg:w-96'
    >
      <h1>{formType.charAt(0).toUpperCase() + formType.slice(1)} a booking</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => upsertMutation.mutate(data))}
          className='space-y-8'
        >
          {/* Date, now changing of booking date is disabled currently. */}
          <div data-role='booked-date'>{`Booked date: {format(formProp.default.start, 'dd MMM')}`}</div>
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
                    disabled={formType === 'view'}
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
                    <ScrollSlotPicker
                      slots={startSlots}
                      selected={field.value}
                      disabled={formType === 'view'}
                      onSelect={(val) => field.onChange(val)}
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
                    <ScrollSlotPicker
                      slots={endSlots}
                      selected={field.value}
                      disabled={formType === 'view'}
                      onSelect={(val) => field.onChange(val)}
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
            {formType === 'insert' && (
              <Button
                type='submit'
                disabled={form.formState.isSubmitting || !form.formState.isValid}
              >
                {form.formState.isSubmitting ? 'Booking' : 'Book'}
              </Button>
            )}

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

/**
 * @summary The wrapper of form, it is rendered when `formProp` is not null.
 * @see BookingFormBody contains the actual form logic
 */
const BookingForm = () => {
  const [formProp] = useAtom(formPropAtom);

  return (
    <Popover open={!!formProp}>
      <PopoverContent className='w-[300px]'>{formProp && <BookingFormBody />}</PopoverContent>
    </Popover>
  );
};

export default BookingForm;

export type { FormProp, FormType };
