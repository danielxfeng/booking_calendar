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
 */
const newDate = (date: string): Date => {
  const [y, m, d] = date.split('-').map(Number);
  return startOfDay(new Date(y, m - 1, d));
};

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

const gridStyleGenerator = (sizeW: number, sizeH?: number): CSSProperties => {
  const basic = {
    gridTemplateColumns: `repeat(8, ${sizeW}px)`,
  };

  return { ...basic, ...styleGenerator(sizeW * 8, sizeH) };
};

const formatToDate = (date: Date) => {
  return format(date, 'yyyy-MM-dd');
};

const formatToDateTime = (date: Date) => {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss");
};

/**
 * @summary Returns the Date object by given gird cell
 */
const timeFromCellIdx = (rowIdx: number, cellBaseTime: Date): Date => {
  return addHours(cellBaseTime, rowIdx);
};

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
