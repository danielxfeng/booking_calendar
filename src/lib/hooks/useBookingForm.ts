/**
 * @file useBookingForm.tsx
 * @summary a custom hook for the booking form.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, differenceInCalendarDays } from 'date-fns';
import { useAtomValue, useSetAtom, useStore } from 'jotai';
import { toast } from 'sonner';

import { API_URL, ENDPOINT_SLOTS, LONGEST_STUDENT_MEETING } from '@/config';
import { bookingsAtom, formPropAtom, startAtom } from '@/lib/atoms';
import { axiosFetcher } from '@/lib/axiosFetcher';
import {
  bookingLengthCheck,
  calculateSlots,
  initForm,
  overlappingCheck,
  parseErrorMsg,
} from '@/lib/bookingFormUtils';
import { ThrowInternalError } from '@/lib/errorHandler';
import type { BookingFromApi, UpsertBooking } from '@/lib/schema';
import { UpsertBookingSchema } from '@/lib/schema';
import { changeDate, newDate } from '@/lib/tools';
import { getUser } from '@/lib/userStore';

type FormType = 'view' | 'insert' | 'update';

// set to null to close the form.
type FormProp = {
  channel: 'sheet' | 'dragging';
  startTime: Date;
  roomId: number;
  booking?: BookingFromApi;
} | null;

const invalidMeetingErrorMessage = `The selected time conflicts with existing bookings or exceeds the ${LONGEST_STUDENT_MEETING}-hour limit.`;

/**
 * @summary Booking form logic hook.
 * @return All return values are dynamic, except `FormType` and `startDate`
 */
const useBookingForm = (formProp: Exclude<FormProp, null>) => {
  const user = getUser();
  const bookings = useAtomValue(bookingsAtom);
  const setFormProp = useSetAtom(formPropAtom);
  const start = useStore().get(startAtom);
  const queryClient = useQueryClient();

  // Monday of the week view
  const startDate = newDate(start);
  const [dayShift, setDayShift] = useState(differenceInCalendarDays(formProp.startTime, startDate));

  if (dayShift < 0 || dayShift > 6)
    // should not be here.
    throw ThrowInternalError('[BookingForm]: the required date is out of range.');

  const bookingDate = addDays(startDate, dayShift);
  const existingBookings = bookings[dayShift];

  const [formType, defaultValues]: [FormType, UpsertBooking] = initForm(
    formProp,
    formProp.booking,
    formProp.roomId,
  );

  const form = useForm<UpsertBooking>({
    resolver: zodResolver(UpsertBookingSchema),
    defaultValues,
    mode: 'onChange',
  });

  const [watchedRoomId, watchedStart, watchedEnd] = useWatch({
    control: form.control,
    name: ['roomId', 'start', 'end'],
  });

  // available slots for startTime
  const startSlots = useMemo(() => {
    return calculateSlots(existingBookings, 'start', watchedRoomId, bookingDate);
  }, [existingBookings, watchedRoomId, bookingDate]);

  // available slots for endTime
  const endSlots = useMemo(() => {
    return calculateSlots(
      existingBookings,
      'end',
      watchedRoomId,
      bookingDate,
      formProp.booking?.id,
    );
  }, [existingBookings, watchedRoomId, bookingDate, formProp.booking?.id]);

  // To validate the invalid booking.
  useEffect(() => {
    const validSlots =
      overlappingCheck(watchedStart, watchedEnd, endSlots) &&
      bookingLengthCheck(watchedStart, watchedEnd, user?.role);

    const currentErrorMessage = form.getFieldState('end')?.error?.message ?? '';
    if (!validSlots && currentErrorMessage !== invalidMeetingErrorMessage)
      form.setError('end', { type: 'manual', message: invalidMeetingErrorMessage });
    else if (validSlots && currentErrorMessage === invalidMeetingErrorMessage)
      form.clearErrors('end');
  }, [watchedStart, watchedEnd, endSlots, form, user?.role]);

  useEffect(() => {
    if (form.formState.isValid && form.formState.errors['root']) form.clearErrors('root');
  }, [form, form.formState.isValid]);

  // When the date picker value changes, update the date of `start` and `end`.
  useEffect(() => {
    const [startV, endV] = form.getValues(['start', 'end']);
    const newDate = addDays(startDate, dayShift);

    const nextStart = changeDate(startV, newDate);
    const nextEnd = changeDate(endV, newDate);

    // start and end should be at the same day!
    if (nextStart !== startV) {
      form.setValue('start', nextStart);
      form.setValue('end', nextEnd);
    }
  }, [dayShift, form, startDate]);

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

  const upsertMutation = useMutation({
    mutationFn: (data: UpsertBooking) =>
      axiosFetcher.post(`${API_URL}/${ENDPOINT_SLOTS}`, {
        roomId: data.roomId,
        startTime: data.start,
        endTime: data.end,
      }),
    onSuccess: () => {
      handleSuccess(start, 'Cool! Your meeting room is booked.');
    },
    onError: (error: unknown) => {
      handleError(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => axiosFetcher.delete(`${API_URL}/${ENDPOINT_SLOTS}/${formProp.booking?.id}`),
    onSuccess: () => {
      handleSuccess(start, 'Your booking is successfully canceled.');
    },
    onError: (error: unknown) => {
      handleError(error);
    },
  });

  const isUpsertBusy = useMemo(
    () => form.formState.isSubmitting || upsertMutation.isPending,
    [form.formState.isSubmitting, upsertMutation.isPending],
  );

  const isDeleteBusy = useMemo(() => deleteMutation.isPending, [deleteMutation.isPending]);

  return {
    form,
    formType,
    dayShift,
    setDayShift,
    startDate,
    bookingDate,
    startSlots,
    endSlots,
    isUpsertBusy,
    isDeleteBusy,
    onSubmit: form.handleSubmit((data) => upsertMutation.mutate(data)),
    onDelete: () => deleteMutation.mutate(),
  };
};

export default useBookingForm;

export type { FormProp, FormType };
