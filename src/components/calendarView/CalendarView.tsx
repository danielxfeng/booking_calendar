import { useRef } from 'react';

import BasicGrids from '@/components/calendarView/BasicGrids';
import BookingCanvas from '@/components/calendarView/BookingCanvas';
import CalendarDateRow from '@/components/calendarView/CalendarDateRow';
import CalendarTimeColumn from '@/components/calendarView/CalendarTimeColumn';
import { CELL_HEIGHT_PX, CELL_WIDTH_PX, OPEN_HOURS_IDX } from '@/config';
import { slotsInAHour, styleGenerator } from '@/lib/tools';

const rows = (OPEN_HOURS_IDX[1] - OPEN_HOURS_IDX[0]) / slotsInAHour;

const CalendarView = () => {
  const containerRef = useRef(null);
  return (
    <div data-role='calendar' className='flex flex-1 overflow-hidden'>
      {/* TimeColumn */}
      <div
        data-role='calendar-time-column-scroll-container'
        className='scrollbar-hide shrink-0 overflow-y-auto'
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
  );
};

export default CalendarView;
