import { CELL_HEIGHT_PX } from '@/config';
import { rowsArr, styleGenerator } from '@/lib/tools';

const CalendarTimeColumn = () => {
  return (
    <div className='flex flex-col'>
      <div className='border-border h-12 shrink-0 border' />
      {rowsArr.map((row) => (
        <div
          key={`cal-time-cell-${row}`}
          className='border-border flex items-center justify-center border px-5 text-xs'
          style={styleGenerator(undefined, CELL_HEIGHT_PX)}
        >
          {row}
        </div>
      ))}
    </div>
  );
};

export default CalendarTimeColumn;
