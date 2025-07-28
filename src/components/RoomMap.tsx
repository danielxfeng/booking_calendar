import { useAtom } from 'jotai';
import { MapPin } from 'lucide-react';

import { ROOM_MAP } from '@/config';
import { roomsAtom } from '@/lib/atoms';
import { cn } from '@/lib/utils';

const RoomMap = () => {
  const [rooms, setRooms] = useAtom(roomsAtom);
  const toggleHandler = (id: number) => {
    setRooms((prev) => {
      return prev.some((r) => r.id === id)
        ? prev.filter((r) => r.id !== id)
        : [...prev, ROOM_MAP.find((r) => r.id === id)!];
    });
  };

  return (
    <div data-role='room-map' className='mb-4 flex w-fit items-center justify-start gap-4 text-sm'>
      <div data-role='room-map-label' className='flex items-center gap-1 font-semibold'>
        <MapPin className='h-4 w-4' />
        Meeting rooms:
      </div>
      <div data-role='room-map-list' className='flex w-fit gap-2 text-sm'>
        {ROOM_MAP.map((room) => (
          <button
            type='button'
            data-role='room-map-room'
            key={room.id}
            className={cn(
              `rounded-full border px-4 py-0.5 font-medium text-neutral-900 opacity-20 shadow-sm transition-colors ${room.color}`,
              rooms.some((r) => r.id === room.id) && 'opacity-100',
            )}
            style={{ minWidth: 60 }}
            onClick={() => toggleHandler(room.id)}
          >
            {room.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomMap;
