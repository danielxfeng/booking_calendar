/**
 * @file Main.tsx
 * @summary Main section of the app
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useRef } from 'react';

import BasicGrids from '@/components/calendarView/BasicGrids';
import BookingCanvas from '@/components/calendarView/BookingCanvas';
import CalendarDayRow from '@/components/calendarView/CalendarHeader';
import CalendarTimeCol from '@/components/calendarView/CalendarTimeCol';
import RoomMap from '@/components/RoomMap';
import { CELL_HEIGHT_PX, CELL_WIDTH_PX, OPEN_HOURS_IDX, TIME_SLOT_INTERVAL } from '@/config';
import { styleGenerator } from '@/lib/tools';

const slotsInAHour = 60 / TIME_SLOT_INTERVAL;
const rows = (OPEN_HOURS_IDX[1] - OPEN_HOURS_IDX[0]) / slotsInAHour;

const Main = () => {
  const containerRef = useRef(null);
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

        {/* Calendar */}
        <div data-role='calendar' className='flex h-full w-full flex-1'>
          <CalendarTimeCol />

          <div data-role='calendar-right' className='flex w-full flex-1 flex-col'>
            <CalendarDayRow />

            {/* Calendar data */}
            <div
              data-role='calendar-data-scroll-container'
              className='h-full w-full flex-1 overflow-scroll'
              ref={containerRef}
            >
              <div
                data-role='calendar-data-container'
                className='bg-background relative'
                style={styleGenerator(CELL_WIDTH_PX * 8, CELL_HEIGHT_PX * rows)}
              >
                <BasicGrids />
                <BookingCanvas containerRef={containerRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
