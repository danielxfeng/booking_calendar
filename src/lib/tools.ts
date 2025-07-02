/**
 * @file tools.ts
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import type { CSSProperties } from 'react';
import { addHours, format, isBefore, startOfDay } from 'date-fns';

/**
 * @summary Returns a local time format of date
 * @param date like '2000-01-01'
 * @returns local time like: 2000-01-01T00:00
 */
const newDate = (date: string): Date => {
  const [y, m, d] = date.split('-').map(Number);
  return startOfDay(new Date(y, m - 1, d));
};

/**
 * @summary generate style by given size
 * @param sizeW optional width
 * @param sizeH optional height
 * @param left optional left
 * @param top optional top
 * @returns the style
 */
const styleGenerator = (
  sizeW?: number,
  sizeH?: number,
  left?: number,
  top?: number,
): CSSProperties | undefined => {
  const w =
    sizeW !== undefined
      ? {
          width: `${sizeW}px`,
          minWidth: `${sizeW}px`,
          maxWidth: `${sizeW}px`,
        }
      : {};

  const h =
    sizeH !== undefined
      ? {
          height: `${sizeH}px`,
          minHeight: `${sizeH}px`,
          maxHeight: `${sizeH}px`,
        }
      : {};

  const l =
    left != undefined
      ? {
          left: `${left}px`,
        }
      : {};

  const t =
    top != undefined
      ? {
          top: `${top}px`,
        }
      : {};

  return { ...w, ...h, ...l, ...t };
};

/**
 * @summary generate style for grid
 * @param sizeW width
 * @returns the style
 */
const gridStyleGenerator = (sizeW: number, sizeH?: number): CSSProperties => {
  const basic = {
    gridTemplateColumns: `repeat(8, ${sizeW}px)`,
  };

  return { ...basic, ...styleGenerator(sizeW * 8, sizeH) };
};

/**
 * @summary to format a Date object to '2020-12-30'
 * @param date the Date object
 * @returns like '2020-12-30'
 */
const formatToDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

/**
 * @summary to format a Date object to '2020-12-30T11:30:00'
 * @param date the Date object
 * @returns like '2020-12-30T11:30:00'
 */
const formatToDateTime = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
};

/**
 * @summary Returns the Date object by given gird cell
 * @param rowIdx the row idx
 * @param cellBaseTime the start of today
 */
const timeFromCellIdx = (rowIdx: number, cellBaseTime: Date): Date => {
  return addHours(cellBaseTime, rowIdx);
};

/**
 * @summary Determines whether a specific time is in the past.
 * @param paramTime the time to compare
 * @param curr now
 */
const isPast = (paramTime: Date, curr: Date): boolean => {
  return isBefore(paramTime, curr);
};

export {
  formatToDate,
  formatToDateTime,
  gridStyleGenerator,
  isPast,
  newDate,
  styleGenerator,
  timeFromCellIdx,
};
