import { getDefaultStore } from 'jotai';
import { atomWithStorage } from 'jotai/utils';

type User = {
  token: string;
  intra: string | null;
  role: 'student' | 'staff' | null;
};

const userAtom = atomWithStorage<User | null>('user', null);
const store = getDefaultStore()

const getUser = (): User | null => store.get(userAtom);

const setUser = (user: User | null): void => {
  store.set(userAtom, user);
};

export { getUser, setUser, userAtom };

export type { User };
