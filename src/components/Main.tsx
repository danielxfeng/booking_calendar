/**
 * @file Main.tsx
 * @summary Main section of the app
 */

import { useRef } from 'react';

import CalendarTimeColumn from '@/components/CalendarTimeColumn';
import BasicGrids from '@/components/calendarView/BasicGrids';
import BookingCanvas from '@/components/calendarView/BookingCanvas';
import CalendarDateRow from '@/components/calendarView/CalendarDateRow';
import RoomMap from '@/components/RoomMap';
import { CELL_HEIGHT_PX, CELL_WIDTH_PX, OPEN_HOURS_IDX, TIME_SLOT_INTERVAL } from '@/config';
import { styleGenerator } from '@/lib/tools';

const slotsInAHour = 60 / TIME_SLOT_INTERVAL;
const rows = (OPEN_HOURS_IDX[1] - OPEN_HOURS_IDX[0]) / slotsInAHour;

const Main = () => {
  const containerRef = useRef(null);
  return (
    <main className='mx-4 my-5 flex-1 overflow-hidden lg:my-8'>
      <div data-role='main-wrapper' className='flex h-full w-full items-center justify-center'>
        <div data-role='main' className='flex h-full flex-col overflow-hidden'>
          <RoomMap />

          {/* Calendar */}
          <div data-role='calendar' className='flex flex-1 overflow-hidden'>
            {/* TimeColumn */}
            <div
              data-role='calendar-time-column-scroll-container'
              className='scrollbar-hide flex shrink-0 overflow-y-auto'
            >
              <CalendarTimeColumn />
            </div>

            {/* Right */}
            <div className='flex h-full w-full flex-1 flex-col overflow-hidden'>
              {/* DateRow */}
              <div
                data-role='calendar-date-row-scroll-container'
                className='scrollbar-hide flex w-full shrink-0 overflow-x-auto'
              >
                <CalendarDateRow />
              </div>

              {/* Data */}
              <div
                data-role='calendar-data-scroll-container'
                className='scrollbar-hide flex-1 overflow-auto'
              >
                <div
                  data-role='calendar-data-container'
                  className='relative'
                  style={styleGenerator(CELL_WIDTH_PX * 7, CELL_HEIGHT_PX * rows)}
                  ref={containerRef}
                >
                  <BasicGrids />
                  <BookingCanvas containerRef={containerRef} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Main;
