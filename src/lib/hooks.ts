/**
 * @file hooks.tsx
 * @summary my hooks
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import { useSearchParams } from 'react-router-dom';
import { useSetAtom } from 'jotai';

import { startAtom } from '@/lib/atoms';
import { normalizeStartDate } from '@/lib/normalizeStartDate';

/**
 * @summary Update the start, and search params.
 * @description
 * When the incoming start is invalid, it fallbacks to today.
 * When the incoming start is not Monday, it fallbacks to the previous Monday.
 */
const useStartController = () => {
  const setStart = useSetAtom(startAtom);
  const [searchParams, setSearchParams] = useSearchParams();

  /**
   * @summary Update the start, and search params.
   * @description
   * When the incoming start is invalid, it fallbacks to today.
   * When the incoming start is not Monday, it fallbacks to the previous Monday.
   */
  const setNewStart = (newStart: string | null, replace: boolean) => {
    const normalizedStart = normalizeStartDate(newStart);
    // Update the setStart
    setStart((prev) => {
      return normalizedStart === prev ? prev : normalizedStart;
    });

    //Update the Url
    if (searchParams.get('start') === normalizedStart) return;

    const newParams = new URLSearchParams(searchParams);
    newParams.set('start', normalizedStart);

    setSearchParams(newParams, {
      replace: replace ?? false,
    });
  };

  return { setNewStart };
};

export { useStartController };
