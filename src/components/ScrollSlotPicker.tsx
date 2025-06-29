/**
 * @file ScrollSlotPicker.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

type Slot = { slot: Date; avail: boolean };

type ScrollTimePickerProps = {
  slots: Slot[];
  selected: string;
  onSelect: (val: string) => void;
};

/**
 * @summary A slot picker made buy ScrollArea and buttons.
 */
const ScrollSlotPicker = ({ slots, selected, onSelect }: ScrollTimePickerProps) => {
  onSelect('a'); // toto
  return (
    <ScrollArea className='h-48 w-40 rounded-md border'>
      {slots.map((slot) => {
        return (
          <Button>
            {/* toto */}
            {slot.avail}
            {selected}
          </Button>
        );
      })}
    </ScrollArea>
  );
};

export default ScrollSlotPicker;

export type { Slot };
