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
import CalendarHeader from '@/components/calendarView/CalendarHeader';
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
      className='flex w-full items-start justify-start lg:items-center lg:justify-center'
    >
      <div data-role='main' className='mx-4 mt-5 mb-12 h-fit'>
        <RoomMap />

        {/* Calendar */}
        <div data-role='calendar'>
          <CalendarHeader />

          {/* Calendar data */}
          <div
            ref={containerRef}
            data-role='calendar-data-container'
            className='bg-background relative overflow-x-scroll'
            style={styleGenerator(CELL_WIDTH_PX * 8, CELL_HEIGHT_PX * rows)}
          >
            <BasicGrids />
            <BookingCanvas containerRef={containerRef} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
