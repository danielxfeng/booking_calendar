import { CELL_HEIGHT_PX } from '@/config';
import { rowsArr, styleGenerator } from '@/lib/tools';

const CalendarTimeColumn = () => {
  return (
    <div className='flex flex-col'>
      {rowsArr.map((row) => (
        <div
          key={`cal-time-cell-${row}`}
          className='flex items-center justify-center border-r-3 border-b-2 border-r-blue-600 px-5 text-xs'
          style={styleGenerator(undefined, CELL_HEIGHT_PX)}
        >
          {row}.00
        </div>
      ))}
    </div>
  );
};

export default CalendarTimeColumn;
