import { useIsFetching } from '@tanstack/react-query';
import { useAtomValue } from 'jotai';

import { startAtom } from '@/lib/atoms';

const useSlotsPending = () => {
  const start = useAtomValue(startAtom);
  const isPending =
    useIsFetching({
      queryKey: start ? ['slots', start] : [],
      predicate: (query) => query.state.status === 'pending',
    }) > 0;

  return isPending;
};

export default useSlotsPending;
