/**
 * @file tools.ts
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import type { CSSProperties } from 'react';
import { startOfDay } from 'date-fns';

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

export { newDate, styleGenerator };
