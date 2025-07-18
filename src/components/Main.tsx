import CalendarView from '@/components/calendarView/CalendarView';
import RoomMap from '@/components/RoomMap';

const Main = () => {
  return (
    <div
      data-role='main-wrapper'
      className='flex h-full w-full items-start justify-start lg:justify-center'
    >
      <div
        data-role='main'
        className='mx-2 mt-2 flex h-full w-full flex-col overflow-hidden lg:w-fit'
      >
        <RoomMap />
        <CalendarView />
      </div>
    </div>
  );
};

export default Main;
