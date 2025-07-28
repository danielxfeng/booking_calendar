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

const iosDetector = (): boolean => {
  if (typeof navigator === 'undefined') return false;

  const agent = navigator.userAgent;

  if (agent.includes('iPhone') || agent.includes('iPad')) return true;
  return false;
};

const ScrollSlotPicker = ({ slots, selected, disabled, onSelect }: ScrollTimePickerProps) => {
  const selectedRef = useRef<HTMLButtonElement | null>(null);

  // IOS does not support `smooth`
  useEffect(() => {
    if (selectedRef.current) {
      if (!iosDetector())
        selectedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      else selectedRef.current.scrollIntoView({ block: 'center' });
    }
  }, [selected]);

  const keyDownHandler = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!['ArrowUp', 'ArrowDown'].includes(e.key)) return;

    e.preventDefault();
    let selectedIdx = slots.findIndex(
      (slot) => format(slot.slot, "yyyy-MM-dd'T'HH:mm:ss") === selected,
    );

    if (selectedIdx === -1) return; // should not be here.
    const iter = e.key === 'ArrowUp' ? -1 : 1;

    while (true) {
      selectedIdx += iter;
      if (selectedIdx < 0 || selectedIdx >= slots.length) break;

      if (slots[selectedIdx].avail) {
        onSelect(format(slots[selectedIdx].slot, "yyyy-MM-dd'T'HH:mm:ss"));
        break;
      }
    }
  };

  return (
    <div className='border-border relative h-40 w-36 rounded-md border'>
      <div
        data-role='mask-t'
        className={cn(
          'pointer-events-none absolute top-0 right-0 left-0 z-10 h-8 bg-gradient-to-b from-background/80 to-transparent',
          disabled && 'pointer-events-auto h-18',
        )}
      />
      <div
        data-role='mask-b'
        className={cn(
          'pointer-events-none absolute right-0 bottom-0 left-0 z-10 h-8 bg-gradient-to-t from-background/80 to-transparent',
          disabled && 'pointer-events-auto h-18',
        )}
      />
      <ScrollArea
        className={cn('h-40 w-36 overflow-hidden rounded-md', disabled && 'pointer-events-none')}
      >
        <div
          className='flex flex-col gap-1.5 px-2 py-4'
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
                className={isSelected ? 'border-primary border-2' : undefined}
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
