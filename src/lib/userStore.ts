/**
 * @file userStore.ts
 * @summary Persisted auth token store. Getter/setter are provided.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

type User = {
  token: string;
  intra: string | null;
  role: 'student' | 'staff' | null;
};

/**
 * @summary A singleton instance user.
 * @description
 * Seems like 42 has session management,
 * it's acceptable to just save the user in memory.
 *
 * When the session initializes, 42 API handles the token renewal,
 * students may need to wait for 1 seconds for that process.
 *
 * Then the token is no longer stored in localstorage, to solve Felipe's concern.
 */
let user: User | null = null;

/**
 * @summary Returns the current user, or null if not set/parsing error.
 */
const getUser = (): User | null => {
  return user;
};

/**
 * @summary Updates the user
 */
const setUser = (newUser: User | null): void => {
  if (newUser) user = newUser;
  else user = null;
};

export { getUser, setUser };
