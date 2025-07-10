import { ROOM_MAP } from '@/config';
import { cn } from '@/lib/utils';

const RoomMap = () => (
  <div data-role='room-map' className='mb-4 flex w-fit items-center justify-start gap-4 text-sm'>
    <div data-role='room-map-label' className='font-semibold'>
      Meeting rooms:{' '}
    </div>
    <div data-role='room-map-list' className='flex w-fit gap-2 text-sm'>
      {ROOM_MAP.map((room) => (
        <div
          data-role='room-map-room'
          key={room.id}
          className='flex items-center justify-start gap-2'
        >
          <div className={cn('rounded-md px-3 py-0.5 border', room.color)}>{room.name}</div>
        </div>
      ))}
    </div>
  </div>
);

export default RoomMap;
