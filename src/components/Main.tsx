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
import { CELL_HEIGHT_PX, CELL_WIDTH_PX } from '@/config';
import { styleGenerator } from '@/lib/tools';

/**
 * @summary The main content of the application
 * @description
 * Includes:
 *  - Operation Panel, which syncs with the `startAtom` to set the date.
 *  - A calendar container, includes:
 *   - The base grids(static layer).
 *   - Booking blocks(dynamic layer).
 */
const Main = () => (
  <div
    data-role='main-wrapper'
    className='flex w-full items-start justify-start overflow-x-scroll lg:items-center lg:justify-center'
  >
    <div data-role='main' className='mx-4 my-12 h-fit w-fit'>
      {/* Operation row */}
      <OperationRow />

      {/* Calendar */}
      <div data-role='calendar'>
        <CalendarHeader />

        {/* Calendar data */}
        <div
          data-role='calendar-base'
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
