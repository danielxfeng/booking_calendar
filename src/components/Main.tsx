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
import OperationRow from '@/components/OperationRow';
import RoomMap from '@/components/RoomMap';
import { CELL_HEIGHT_PX, CELL_WIDTH_PX } from '@/config';
import { styleGenerator } from '@/lib/tools';

const Main = () => (
  <div
    data-role='main-wrapper'
    className='flex w-full items-start justify-start overflow-x-scroll lg:items-center lg:justify-center'
  >
    <div data-role='main' className='mx-4 mt-5 mb-12 h-fit w-fit'>
      {/* Operation row */}
      <OperationRow />

      <RoomMap />

      {/* Calendar */}
      <div data-role='calendar'>
        <CalendarHeader />

        {/* Calendar data */}
        <div
          data-role='calendar-data-container'
          className='relative'
          style={styleGenerator(CELL_WIDTH_PX * 8, CELL_HEIGHT_PX * 24)}
        >
          <BasicGrids />
          <BookingsLayer />
        </div>
      </div>
    </div>
  </div>
);

export default Main;
