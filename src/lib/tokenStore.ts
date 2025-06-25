/**
 * @file tokenStore.ts
 * @summary Persisted auth token store. Getter/setter are provided.
 *
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

/**
 * @summary Returns the current access token, or null if not set.
 */
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

/**
 * @summary Updates the access token in localStorage. Pass null to remove it.
 */
const setToken = (token: string | null): void => {
  if (token) localStorage.setItem('token', token);
  else localStorage.removeItem('token');
};

export { getToken, setToken };
