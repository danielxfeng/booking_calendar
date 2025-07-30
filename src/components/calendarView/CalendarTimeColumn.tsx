import { CELL_HEIGHT_PX } from '@/config';
import { rowsArr, styleGenerator } from '@/lib/tools';

const CalendarTimeColumn = () => {
  return (
    <div className='flex flex-col'>
      {rowsArr.map((row) => (
        <div
          key={`cal-time-cell-${row}`}
          className='flex items-center justify-center border-r-2 border-r-sky-400 px-5 text-xs shadow-[inset_0_-2px_0_0_#e4e4e7] dark:shadow-[inset_0_-2px_0_0_#222223]'
          style={styleGenerator(undefined, CELL_HEIGHT_PX)}
        >
          {row}.00
        </div>
      ))}
    </div>
  );
};

export default CalendarTimeColumn;
