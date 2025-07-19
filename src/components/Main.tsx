/**
 * @file Main.tsx
 * @summary Main section of the app
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import BasicGrids from '@/components/BasicGrids';
import BookingsLayer from '@/components/BookingsLayer';
import CalendarHeader from '@/components/CalendarHeader';
import RoomMap from '@/components/RoomMap';
import { CELL_HEIGHT_PX, CELL_WIDTH_PX, OPEN_HOURS_IDX, TIME_SLOT_INTERVAL } from '@/config';
import { styleGenerator } from '@/lib/tools';

const slotsInAHour = 60 / TIME_SLOT_INTERVAL;
const rows = (OPEN_HOURS_IDX[1] - OPEN_HOURS_IDX[0]) / slotsInAHour;

const Main = () => (
  <main className='mt-10'>
  <div
    data-role='main-wrapper'
    className='flex w-full items-start justify-start lg:items-center lg:justify-center'
  >
    <div data-role='main' className='mx-4 mt-5 mb-12'>
      <RoomMap />

      {/* Calendar */}
      <div data-role='calendar'>
        <CalendarHeader />

        {/* Calendar data */}
        <div
          data-role='calendar-data-container'
          className='relative'
          style={styleGenerator(CELL_WIDTH_PX * 8, CELL_HEIGHT_PX * rows)}
        >
          <BasicGrids />
          <BookingsLayer />
        </div>
      </div>
    </div>
  </div>
  </main>
);

export default Main;
