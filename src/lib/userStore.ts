type User = {
  token: string;
  intra: string | null;
  role: 'student' | 'staff' | null;
};

let user: User | null = null;

const getUser = (): User | null => {
  return user;
};

const setUser = (newUser: User | null): void => {
  if (newUser) user = newUser;
  else user = null;
};

export { getUser, setUser };

export type { User };
