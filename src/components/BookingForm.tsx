/**
 * @file BookingForm.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroupItem } from '@radix-ui/react-radio-group';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { addDays, differenceInCalendarDays, format } from 'date-fns';
import { useAtom, useAtomValue, useStore } from 'jotai';
import { Calendar, Loader, MapPin, User } from 'lucide-react';
import { toast } from 'sonner';

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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { API_URL, ENDPOINT_SLOTS, ROOM_MAP } from '@/config';
import { bookingsAtom, formPropAtom, startAtom } from '@/lib/atoms';
import { axiosFetcher } from '@/lib/axiosFetcher';
import { calculateSlots, initForm, overlappingCheck } from '@/lib/bookingFormUtils';
import { ThrowInternalError } from '@/lib/errorHandler';
import { type BookingFromApi, type UpsertBooking, UpsertBookingSchema } from '@/lib/schema';
import { newDate } from '@/lib/tools';
import { cn } from '@/lib/utils';
import type { DayBookings } from '@/lib/weekBookings';

type FormType = 'view' | 'insert' | 'update';

// set to null to close the form.
type FormProp = {
  startTime: Date;
  booking?: BookingFromApi;
  roomId?: number;
} | null;

const overlappingErrorMessage = 'The booked slots are not available.';

const parseErrorMsg = (error: unknown): string => {
  if (error instanceof AxiosError) {
    return error.response?.data?.message ?? error.message ?? 'Server responded with an error.';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Unknown error occurred.';
};

// TODO:  Allow users to modify a booking? Changing date in form?
// TODO:  Can not find an available slot when the start is not from like 8:00, 9:00...
const BookingForm = () => {
  const bookings = useAtomValue(bookingsAtom);
  const [formProp, setFormProp] = useAtom(formPropAtom);

  const start = useStore().get(startAtom);

  // If formProp is null, the sheet should not be open, so it's safe here.
  const prop = formProp!;

  const startDate = newDate(start);

  const dayShift = differenceInCalendarDays(prop.startTime, startDate);
  if (dayShift < 0 || dayShift > 6)
    // should not be here.
    throw ThrowInternalError('[BookingForm]: the required date is out of range.');

  // Now we have the 0:00, and bookings of the day.
  const baseTime = addDays(startDate, dayShift);
  const existingBookings: DayBookings = bookings[dayShift];

  const [formType, defaultValues]: [FormType, UpsertBooking] = initForm(
    prop,
    existingBookings,
    prop.booking,
    prop.roomId,
  );

  const form = useForm<UpsertBooking>({
    resolver: zodResolver(UpsertBookingSchema),
    defaultValues: defaultValues,
    mode: 'onChange',
  });

  const [watchedRoomId, watchedStart, watchedEnd] = useWatch({
    control: form.control,
    name: ['roomId', 'start', 'end'],
  });

  const startSlots = useMemo(() => {
    return calculateSlots(existingBookings, 'start', watchedRoomId, baseTime);
  }, [existingBookings, watchedRoomId, baseTime]);

  const endSlots = useMemo(() => {
    return calculateSlots(existingBookings, 'end', watchedRoomId, baseTime, prop.booking?.id);
  }, [existingBookings, watchedRoomId, prop.booking?.id, baseTime]);

  // To validate the overlapping booking
  useEffect(() => {
    const validSlots = overlappingCheck(watchedStart, watchedEnd, endSlots);

    const currentErrorMessage = form.getFieldState('end')?.error?.message ?? '';
    if (!validSlots && currentErrorMessage !== overlappingErrorMessage)
      form.setError('end', { type: 'manual', message: overlappingErrorMessage });
    else if (validSlots && currentErrorMessage === overlappingErrorMessage) form.clearErrors('end');
  }, [watchedStart, watchedEnd, endSlots, form]);

  useEffect(() => {
    if (form.formState.isValid && form.formState.errors['root']) {
      form.clearErrors('root');
    }
  }, [form, form.formState.isValid]);

  const handleSuccess = (start: string, msg: string) => {
    toast.success(msg);
    queryClient.invalidateQueries({
      queryKey: ['slots', start],
    });
    setFormProp(null);
  };

  const handleError = (error: unknown) => {
    queryClient.invalidateQueries({ queryKey: ['slots', start] });
    form.setError('root', {
      type: 'server',
      message: parseErrorMsg(error),
    });
  };

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => {
      return axiosFetcher.delete(`${API_URL}/${ENDPOINT_SLOTS}/${prop.booking?.id}`);
    },
    onSuccess: () => {
      handleSuccess(start, 'Your booking is successfully canceled.');
    },
    onError: (error: unknown) => {
      handleError(error);
    },
  });

  const upsertMutation = useMutation({
    mutationFn: (data: UpsertBooking) => {
      return axiosFetcher.post(`${API_URL}/${ENDPOINT_SLOTS}`, {
        roomId: data.roomId,
        startTime: data.start,
        endTime: data.end,
      });
    },
    onSuccess: () => {
      handleSuccess(start, 'Cool! Your meeting room is booked.');
    },
    onError: (error: unknown) => {
      handleError(error);
    },
  });

  const titlePrefix =
    formType === 'insert'
      ? 'Book a meeting room'
      : formType === 'view'
        ? 'Review a booking'
        : 'Update a booking';

  const isUpsertBusy = form.formState.isSubmitting || upsertMutation.isPending;

  return (
    <div
      data-role='booking-upsert-form'
      className='flex flex-col justify-start py-6 lg:h-96 lg:w-96'
    >
      <SheetHeader>
        <SheetTitle>{titlePrefix}</SheetTitle>
        <SheetDescription className='mt-2'>
          You can review, create, or delete a meeting room reservation using the form below.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((data) => upsertMutation.mutate(data))}
          className='space-y-8 px-4'
        >
          <div data-role='booking-info' className='flex flex-col gap-3'>
            {/* Date */}
            <div className='flex items-center gap-3'>
              <Calendar className='h-4 w-4' />
              <div data-role='booked-date' className='text-sm'>
                {format(baseTime, 'eee dd MMM')}
              </div>
            </div>

            {/* Optional BookedBy */}
            {prop.booking?.bookedBy && (
              <div className='flex items-center gap-3'>
                <User className='h-4 w-4' />
                <div data-role='booked-by' className='text-sm'>
                  {prop.booking?.bookedBy}
                </div>
              </div>
            )}

            {/* Optional RoomId */}
            {/* TODO: Might be a bit repetitive with the room selector */}
            {formType !== 'insert' && (
              <div className='flex items-center gap-3'>
                <MapPin className='h-4 w-4' />
                <div data-role='booked-room-name' className='text-sm capitalize'>
                  {ROOM_MAP.find((room) => room.id === prop.roomId)?.name}
                </div>
              </div>
            )}
          </div>

          {formType === 'insert' && <hr />}

          {/* Room id selector */}
          <FormField
            control={form.control}
            name='roomId'
            render={({ field }) => (
              <FormItem className='space-y-3'>
                <FormLabel className='text-sm font-bold'>
                  {formType === 'insert' ? 'Choose a meeting room:' : 'The booked meeting room:'}
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={(val) => field.onChange(Number(val))}
                    value={String(field.value)}
                    className='grid grid-cols-2 gap-10 px-4'
                    disabled={formType !== 'insert' || form.formState.isSubmitting}
                  >
                    {ROOM_MAP.map(({ id, name, color }) => (
                      <RadioGroupItem
                        key={id}
                        id={`room-${id}`}
                        value={String(id)}
                        className={cn(
                          'data-[state=checked]:border-2 data-[state=checked]:border-primary flex items-center justify-center rounded-sm py-1.5 shadow-sm cursor-pointer',
                          color,
                        )}
                      >
                        <span className='text-sm'>{name}</span>
                      </RadioGroupItem>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <hr />

          {/* Slot selector */}
          <p className='mb-2 pb-0 text-sm font-bold'>{`${formType === 'insert' ? 'Select' : 'Review'} slots:`}</p>
          <div className='flex justify-center gap-10 py-4'>
            {/* Start time selector */}
            <FormField
              control={form.control}
              name='start'
              render={({ field }) => (
                <FormItem className='flex flex-col items-center space-y-3'>
                  <FormLabel>Start:</FormLabel>
                  <FormControl>
                    <ScrollSlotPicker
                      slots={startSlots}
                      selected={field.value}
                      disabled={formType !== 'insert' || form.formState.isSubmitting}
                      onSelect={(val) => field.onChange(val)}
                    />
                  </FormControl>
                  <FormMessage className='min-h-12' />
                </FormItem>
              )}
            />

            {/* End time selector */}
            <FormField
              control={form.control}
              name='end'
              render={({ field }) => (
                <FormItem className='flex flex-col items-center space-y-3'>
                  <FormLabel>End:</FormLabel>
                  <FormControl>
                    <ScrollSlotPicker
                      slots={endSlots}
                      selected={field.value}
                      disabled={formType !== 'insert' || form.formState.isSubmitting}
                      onSelect={(val) => field.onChange(val)}
                    />
                  </FormControl>
                  <FormMessage className='min-h-[1.25rem]' />
                </FormItem>
              )}
            />
          </div>

          <hr />
          {/* Root error(possible) */}
          {form.formState.errors.root && (
            <p className='text-destructive text-sm'>{form.formState.errors.root?.message}</p>
          )}
          {/* Return info(possible) */}
          {(deleteMutation.isSuccess || upsertMutation.isSuccess) && (
            <p className='text-center text-sm font-semibold text-green-500'>
              Cool! The operation was successful, <br />
              we are closing the form...
            </p>
          )}

          {/* Btns */}
          <div data-role='booking-form-btns' className='flex justify-center'>
            {/* Upsert submit */}
            {formType === 'insert' && (
              <Button
                className='flex w-full'
                type='submit'
                disabled={isUpsertBusy || !form.formState.isValid}
              >
                {isUpsertBusy ? (
                  <span className='flex items-center justify-center gap-2'>
                    <Loader className='h-4 w-4' />
                    Booking
                  </span>
                ) : (
                  'Book'
                )}
              </Button>
            )}

            {/* Delete */}
            {formType === 'update' && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  {/* The deletion btn */}
                  <Button
                    variant='outline'
                    type='button'
                    disabled={deleteMutation.isPending || formProp?.booking?.bookedBy === null}
                    aria-label='Delete booking'
                  >
                    {deleteMutation.isPending ? (
                      <span className='flex items-center justify-center gap-2'>
                        <Loader className='h-4 w-4' />
                        Deleting
                      </span>
                    ) : (
                      'Delete'
                    )}
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
      <SheetContent className='w-full overflow-y-auto lg:w-96'>
        {!!formProp && <BookingForm />}
      </SheetContent>
    </Sheet>
  );
};

export default FormWrapper;

export type { FormProp, FormType };
