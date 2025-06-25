/**
 * @file CellComponent.tsx
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import type { Table } from '@/lib/table';

type CellCompProps = {
  row: number;
  col: number;
  table: Table;
  startDate: Date;
};

/**
 * @summary Represents a cell of the calendar view, includes:
 * @detail
 * Main logic:
 * - for all cells:
 *   - if in the past, display a gray bg, onHover: none, onClick: none
 *   - if in the future, display a normal bg, onHover: tooltip to show the time, onClick: upsert form(insertion only)
 *   - if there are slots, draw a absolute view:
 *     - width is shared, so need to be handled very carefully.
 *     - height can be overflowed by the length of the slot.
 *     - draw border and bg (blue maybe?).
 *     - displays the info, start-end time, and bookedBy if available.
 *     - on hover: tooltip to display the info.
 *     - on click: show the upsert form and the deletion btn.
 *       - for the slots which is in the past, or bookedBy is null: disabled.
 *       - otherwise, show the update view, and the deletion btn.
 */
const CellComp = ({ row, col, table, startDate }: CellCompProps) => {
  console.log(row, col, table, startDate);
  return <></>;
};

export default CellComp;
