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
    <ScrollArea className='h-48 w-40 rounded-md border'>
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
              ref={isSelected ? selectedRef : undefined}
              variant={isSelected ? 'default' : slot.avail ? 'outline' : 'ghost'}
              disabled={!slot.avail || disabled}
              onClick={() => onSelect(value)}
              role='option'
              aria-selected={isSelected}
            >
              {label}
            </Button>
          );
        })}
      </div>
    </ScrollArea>
  );
};

export default ScrollSlotPicker;

export type { Slot };
