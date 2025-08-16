import { useSetAtom } from 'jotai';
import { useSearchParams } from 'react-router-dom';

import { startAtom } from '@/lib/atoms';
import { normalizeStartDate } from '@/lib/normalizeStartDate';

const useStartController = () => {
  // A setter, not the subscription.
  const setStart = useSetAtom(startAtom);

  const [searchParams, setSearchParams] = useSearchParams();

  const setNewStart = (newStart: string | null, replace: boolean) => {
    const normalizedStart = normalizeStartDate(newStart);

    setStart((prev) => {
      return normalizedStart === prev ? prev : normalizedStart;
    });

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
