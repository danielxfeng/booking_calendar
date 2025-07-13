import { MapPin } from 'lucide-react';

import { ROOM_MAP } from '@/config';
import { cn } from '@/lib/utils';

const RoomMap = () => {
  return (
    <div data-role='room-map' className='mb-4 flex w-fit items-center justify-start gap-4 text-sm'>
      <div data-role='room-map-label' className='font-semibold flex gap-1 items-center'>
        <MapPin className='h-4 w-4' />Meeting rooms:
      </div>
      <div data-role='room-map-list' className='flex w-fit gap-2 text-sm'>
        {ROOM_MAP.map((room) => (
          <button
            type='button'
            data-role='room-map-room'
            key={room.id}
            className={cn(
              `transition-colors rounded-full border px-4 py-0.5 font-medium shadow-sm ${room.color} focus:outline-none focus:ring-2 focus:ring-blue-300`,
            )}
            style={{ minWidth: 60 }}
          >
            {room.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoomMap;
