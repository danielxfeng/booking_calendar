import CalendarView from '@/components/calendarView/CalendarView';
import RoomMap from '@/components/RoomMap';

const Main = () => {
  return (
    <main className='mx-4 my-5 flex-1 overflow-hidden lg:my-8'>
      <div data-role='main-wrapper' className='flex h-full w-full items-center justify-center'>
        <div data-role='main' className='flex h-full flex-col overflow-hidden lg:gap-2'>
          <RoomMap />
          <CalendarView />
        </div>
      </div>
    </main>
  );
};

export default Main;
