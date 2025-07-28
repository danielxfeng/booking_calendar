/**
 * @file BookingForm.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useState } from 'react';
import { RadioGroupItem } from '@radix-ui/react-radio-group';
import {
  addDays,
  differenceInCalendarDays,
  format,
  isAfter,
  isBefore,
  startOfToday,
} from 'date-fns';
import { useAtom, useAtomValue } from 'jotai';
import { ChevronDownIcon, Loader, User } from 'lucide-react';

import ScrollSlotPicker from '@/components/bookingForm/ScrollSlotPicker';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RadioGroup } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ROOM_MAP } from '@/config';
import { formPropAtom } from '@/lib/atoms';
import useBookingForm from '@/lib/hooks/useBookingForm';
import { changeDate } from '@/lib/tools';
import { cn } from '@/lib/utils';

/**
 * @summary The upsert form UI.
 */
const BookingForm = () => {
  const formProp = useAtomValue(formPropAtom);
  // For date picker
  const [open, setOpen] = useState(false);
  // If formProp is null, the sheet should not be open, so it's safe here.
  const prop = formProp!;
  const {
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
    onSubmit,
    onDelete,
  } = useBookingForm(prop);

  const titlePrefix =
    formType === 'insert'
      ? 'Book a meeting room'
      : formType === 'view'
        ? 'Review a booking'
        : 'Update a booking';

  return (
    <div data-role='booking-upsert-form' className='flex flex-col justify-start py-6 lg:w-96'>
      <SheetHeader>
        <SheetTitle>{titlePrefix}</SheetTitle>
        <SheetDescription className='mt-2'>
          You can review, create, or delete a meeting room reservation using the form below.
        </SheetDescription>
      </SheetHeader>
      <Form {...form}>
        <form onSubmit={onSubmit} className='space-y-8 px-4'>
          {/* Optional BookedBy */}
          {prop.booking?.bookedBy && (
            <div className='flex items-center gap-3'>
              <User className='h-4 w-4' />
              <div data-role='booked-by' className='text-sm'>
                {prop.booking?.bookedBy}
              </div>
            </div>
          )}

          {/* Not required now
            {formType !== 'insert' && (
              <div className='flex items-center gap-3'>
                <MapPin className='h-4 w-4' />
                <div data-role='booked-room-name' className='text-sm capitalize'>
                  {ROOM_MAP.find((room) => room.id === prop.roomId)?.name}
                </div>
              </div>
            )}
            */}

          {formType === 'insert' && <hr />}

          {/* Date */}
          <div className='flex flex-col gap-3'>
            <div className='text-sm font-bold'>
              {formType === 'insert' ? 'Choose a date:' : 'The booked date:'}
            </div>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant='outline'
                  id='date'
                  className='w-full justify-between font-normal disabled:opacity-100'
                  disabled={formType !== 'insert' || isUpsertBusy}
                >
                  {format(bookingDate, 'EEE dd MMM')}
                  <ChevronDownIcon />
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-auto overflow-hidden p-0' align='start'>
                <Calendar
                  mode='single'
                  selected={addDays(startDate, dayShift)}
                  captionLayout='dropdown'
                  onSelect={(date) => {
                    if (!date) return;

                    const newDayShift = differenceInCalendarDays(date, startDate);
                    const [currStart, currEnd] = form.getValues(['start', 'end']);
                    const nextStart = changeDate(currStart, date);

                    if (currStart !== nextStart) {
                      const nextEnd = changeDate(currEnd, date);
                      form.setValue('start', nextStart);
                      form.setValue('end', nextEnd);
                      setDayShift(newDayShift);
                    }

                    setOpen(false);
                  }}
                  disabled={(date) =>
                    isBefore(date, startOfToday()) || // Before today
                    // out of the week view
                    isBefore(date, startDate) ||
                    isAfter(date, addDays(startDate, 6))
                  }
                />
              </PopoverContent>
            </Popover>
          </div>

          <hr />

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
                          'data-[state=checked]:border-primary flex cursor-pointer items-center justify-center rounded-sm py-1.5 shadow-sm data-[state=checked]:border-2',
                          'data-[state=checked]:border-primary flex cursor-pointer items-center justify-center rounded-sm py-1.5 shadow-sm data-[state=checked]:border-2',
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
                    disabled={isDeleteBusy || prop.booking?.bookedBy === null}
                    aria-label='Delete booking'
                  >
                    {isDeleteBusy ? (
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
                    <AlertDialogAction onClick={onDelete} disabled={isDeleteBusy}>
                      {isDeleteBusy ? 'Deleting...' : 'Continue'}
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
  const isOpen = !!formProp && formProp.channel === 'sheet';
  return (
    <Sheet
      open={isOpen}
      // manual close
      onOpenChange={(open) => {
        if (!open) setFormProp(null);
      }}
    >
      <SheetContent className='z-50 h-full w-full overflow-y-auto lg:w-96'>
        {!!formProp && <BookingForm />}
      </SheetContent>
    </Sheet>
  );
};

export default FormWrapper;
