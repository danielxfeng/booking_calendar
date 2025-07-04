/**
 * @file axiosFetcher.ts
 * @summary Singleton Axios instance with auth and timeout support
 * @author Xin (Daniel) Feng
 * @contact intra: @xifeng
 */

import axios from 'axios';

import { API_URL, ENDPOINT_AUTH, FETCHER_TIMEOUT } from '@/config';
import { getUser, setUser } from '@/lib/userStore';

// Init a singleton instance
const axiosFetcher = axios.create({
  baseURL: API_URL,
  timeout: FETCHER_TIMEOUT,
});

// Attach the token to requests.
axiosFetcher.interceptors.request.use((config) => {
  if (import.meta.env.VITE_IS_AUTH === 'false') return config;

  const token = getUser()?.token;
  if (!token) {
    window.location.replace(`${API_URL}/${ENDPOINT_AUTH}`);
    return Promise.reject(new axios.Cancel('No token, redirecting.'));
  }
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Redirects to auth page on 401, or 498.
axiosFetcher.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 ||
      error.response?.status === 403 ||
      error.response?.status === 498
    ) {
      setUser(null);
      window.location.replace(`${API_URL}/${ENDPOINT_AUTH}`);
      return Promise.reject(new axios.Cancel('No token, redirecting.'));
    }
    return Promise.reject(error);
  },
);

export { axiosFetcher };
