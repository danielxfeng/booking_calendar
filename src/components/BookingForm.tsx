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
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { useAtom, useAtomValue, useStore } from 'jotai';

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
import { RadioGroup } from '@/components/ui/radio-group';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { API_URL, ENDPOINT_SLOTS, ROOM_MAP } from '@/config';
import { bookingsAtom, formPropAtom, startAtom } from '@/lib/atoms';
import { axiosFetcher } from '@/lib/axiosFetcher';
import { calculateSlots, initForm, overlappingCheck } from '@/lib/bookingFormUtils';
import { ThrowInternalError } from '@/lib/errorHandler';
import { type BookingFromApi, type UpsertBooking, UpsertBookingSchema } from '@/lib/schema';
import { newDate } from '@/lib/tools';
import type { DayBookings } from '@/lib/weekBookings';

type FormType = 'view' | 'insert' | 'update';

/**
 * @summary Represents the properties of upsert form.
 * @description
 * - null: no form should be shown.
 */
type FormProp = {
  startTime: Date;
  booking?: BookingFromApi;
  roomId?: number;
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
 * TODO:  Allow users to modify a booking? Changing date in form?
 */
const BookingForm = () => {
  // Subscribe the atoms to tracking the data changing.
  const bookings = useAtomValue(bookingsAtom);
  const [formProp, setFormProp] = useAtom(formPropAtom);

  // We just need the current value here, bc we can get the newest data when `bookings` is updated.
  const start = useStore().get(startAtom);

  // If formProp is null, the sheet should not be open, so it's safe here.
  const prop = formProp!;

  const startDate = newDate(start);

  // We just need one day: baseTime
  const dayShift = differenceInCalendarDays(prop.startTime, startDate);
  if (dayShift < 0 || dayShift > 6)
    // should not be here.
    throw ThrowInternalError('[BookingForm]: the required date is out of range.');

  // Now we have the 0:00, and bookings of the day.
  const baseTime = addDays(startDate, dayShift);
  const existingBookings: DayBookings = bookings[dayShift];

  // Get the type of form, 'view', 'insert', 'update', and it's initialized values.
  const [formType, defaultValues]: [FormType, UpsertBooking] = initForm(
    prop,
    existingBookings,
    prop.booking,
    prop.roomId,
  );

  // Init a RHF.
  const form = useForm<UpsertBooking>({
    resolver: zodResolver(UpsertBookingSchema),
    defaultValues: defaultValues,
    mode: 'onChange',
  });

  // Hook to track the value change.
  const [watchedRoomId, watchedStart, watchedEnd] = useWatch({
    control: form.control,
    name: ['roomId', 'start', 'end'],
  });

  // 2 slots is required, it mainly tracks the changing of roomId.
  // It reads the bookings from `day`, then set `unavailable` to booked slots.
  const startSlots = useMemo(() => {
    return calculateSlots(existingBookings, 'start', watchedRoomId, baseTime);
  }, [existingBookings, watchedRoomId, baseTime]);

  const endSlots = useMemo(() => {
    return calculateSlots(existingBookings, 'end', watchedRoomId, baseTime, prop.booking?.id);
  }, [existingBookings, watchedRoomId, prop.booking?.id, baseTime]);

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
      return axiosFetcher.delete(`${API_URL}/${ENDPOINT_SLOTS}/${prop.booking?.id}`);
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

  // Sheet title
  const titlePrefix = formType === 'insert' ? 'Book' : formType === 'view' ? 'Review' : 'Update';

  if (!formProp) return null; // Should not be here.

  return (
    <div
      data-role='booking-upsert-form'
      className='flex h-screen w-screen flex-col justify-between lg:h-96 lg:w-96'
    >
      <SheetHeader>
        <SheetTitle>{`${titlePrefix}  a meeting room`}</SheetTitle>
      </SheetHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => upsertMutation.mutate(data))}
          className='space-y-8'
        >
          {/* Date, now changing of booking date is disabled currently. */}
          <div data-role='booked-date'>{`Date: ${format(baseTime, 'eee dd MMM')}`}</div>
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
                    disabled={formType === 'view' || form.formState.isSubmitting}
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
                      disabled={formType === 'view' || form.formState.isSubmitting}
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
                      disabled={formType === 'view' || form.formState.isSubmitting}
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
          <div data-role='booking-form-btns' className='flex justify-center'>
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
 * A sheet wrapper of the upsert form.
 */
const FormWrapper = () => {
  const [formProp, setFormProp] = useAtom(formPropAtom);
  return (
    <Sheet
      open={!!formProp}
      // manual close
      onOpenChange={(open) => {
        if (!open) setFormProp(null);
      }}
    >
      <SheetContent>
        <BookingForm />
      </SheetContent>
    </Sheet>
  );
};

export default FormWrapper;

export type { FormProp, FormType };
