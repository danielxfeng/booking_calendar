/**
 * @file ScrollSlotPicker.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useEffect, useRef } from 'react';
import { format } from 'date-fns';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

type Slot = { slot: Date; avail: boolean };

type ScrollTimePickerProps = {
  slots: Slot[];
  selected: string;
  disabled: boolean;
  onSelect: (val: string) => void;
};

/**
 * @summary A slot picker made buy ScrollArea and buttons.
 */
const ScrollSlotPicker = ({ slots, selected, disabled, onSelect }: ScrollTimePickerProps) => {
  const selectedRef = useRef<HTMLButtonElement | null>(null);

  // To scroll the selected item to the center of the dom.
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selected]);

  // Keyboard support
  const keyDownHandler = (e: React.KeyboardEvent) => {
    if (disabled) return;

    // we just need up/down
    if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;

    e.preventDefault();
    let selectedIdx = slots.findIndex(
      (slot) => format(slot.slot, "yyyy-MM-dd'T'HH:mm:ss") === selected,
    );

    if (selectedIdx === -1) return; // should not be here.
    const iter = e.key === 'ArrowUp' ? -1 : 1;

    while (true) {
      selectedIdx += iter;
      // Out of bound check.
      if (selectedIdx < 0 || selectedIdx >= slots.length) break;

      // Select the available value.
      if (slots[selectedIdx].avail) {
        onSelect(format(slots[selectedIdx].slot, "yyyy-MM-dd'T'HH:mm:ss"));
        break;
      }
    }
  };

  return (
    <div className='border-border relative h-36 w-36 rounded-md border'>
      <div
        data-role='mask-t'
        className={cn(
          'pointer-events-none absolute top-0 right-0 left-0 z-10 h-8 bg-gradient-to-b from-white/80 to-transparent',
          disabled && 'pointer-events-auto h-18',
        )}
      />
      <div
        data-role='mask-b'
        className={cn(
          'pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-8 bg-gradient-to-t from-white/80 to-transparent',
          disabled && 'pointer-events-auto h-18',
        )}
      />
      <ScrollArea className='h-36 w-36 rounded-md'>
        <div
          className='flex flex-col gap-1 p-2'
          tabIndex={0}
          onKeyDown={keyDownHandler}
          role='listbox'
          aria-activedescendant={selected}
        >
          {slots.map((slot: Slot) => {
            const value = format(slot.slot, "yyyy-MM-dd'T'HH:mm:ss");
            const label = format(slot.slot, 'HH:mm');
            const isSelected = value === selected;
            return (
              <Button
                key={value}
                type='button'
                ref={isSelected ? selectedRef : undefined}
                variant={slot.avail ? 'secondary' : 'outline'}
                className={isSelected ? '!bg-primary text-background' : undefined}
                onClick={() => onSelect(value)}
                role='option'
                aria-selected={isSelected}
                disabled={!disabled && !slot.avail} // if the form is disabled, the `disabled` property here is useless.
              >
                {label}
              </Button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ScrollSlotPicker;

export type { Slot };
