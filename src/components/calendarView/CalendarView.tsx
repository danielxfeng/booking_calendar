import { useEffect, useRef } from 'react';

import BasicGrids from '@/components/calendarView/BasicGrids';
import BookingCanvas from '@/components/calendarView/BookingCanvas';
import CalendarDateRow from '@/components/calendarView/CalendarDateRow';
import CalendarTimeColumn from '@/components/calendarView/CalendarTimeColumn';
import { CELL_HEIGHT_PX, CELL_WIDTH_PX, OPEN_HOURS_IDX } from '@/config';
import { slotsInAHour, styleGenerator } from '@/lib/tools';

const rows = (OPEN_HOURS_IDX[1] - OPEN_HOURS_IDX[0]) / slotsInAHour;

const CalendarView = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dateRowRef = useRef<HTMLDivElement>(null);
  const timeColumnRef = useRef<HTMLDivElement>(null);
  const dataContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const syncScroll = () => {
      const dataContainer = dataContainerRef.current;
      const dateRow = dateRowRef.current;
      const timeColumn = timeColumnRef.current;

      if (!dataContainer || !dateRow || !timeColumn) return;

      if (dataContainer.scrollLeft !== dateRow.scrollLeft)
        dateRow.scrollLeft = dataContainer.scrollLeft;
      if (dataContainer.scrollTop !== timeColumn.scrollTop)
        timeColumn.scrollTop = dataContainer.scrollTop;
    };

    const dataContainer = dataContainerRef.current;
    dataContainer?.addEventListener('scroll', syncScroll);

    return () => {
      dataContainer?.removeEventListener('scroll', syncScroll);
    };
  }, []);

  return (
    <div data-role='calendar' className='flex flex-1 overflow-hidden'>
      {/* TimeColumn */}
      <div className='flex flex-col'>
        <div className='h-12 shrink-0 border-r-3 border-b-3 border-blue-600' />
        <div
          data-role='calendar-time-column-scroll-container'
          className='scrollbar-hide flex-1 overflow-hidden'
          ref={timeColumnRef}
        >
          <CalendarTimeColumn />
        </div>
      </div>

      {/* Right */}
      <div className='flex h-full w-full flex-1 flex-col overflow-hidden'>
        {/* DateRow */}
        <div
          data-role='calendar-date-row-scroll-container'
          className='scrollbar-hide flex w-full shrink-0 overflow-hidden'
          ref={dateRowRef}
        >
          <CalendarDateRow />
        </div>

        {/* Data */}
        <div
          data-role='calendar-data-scroll-container'
          className='scrollbar-hide flex-1 overflow-auto'
          ref={dataContainerRef}
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
